import jsonServer from "json-server";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";

// Own secret (override via env in real deployments). json-server-auth is gone,
// so nothing pins this value anymore.
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

const ACCESS_TOKEN_TTL = "1m";
const REFRESH_TOKEN_TTL = "1d";
const REFRESH_COOKIE = "refreshToken";

// Only the Vite dev origin may send credentialed requests. jsonServer.defaults
// ships its own cors() (origin: true) which would overwrite these headers, so
// it is mounted with { noCors: true } below.
const CORS_ORIGIN = "http://localhost:5173";

const signAccessToken = (user) =>
  jwt.sign(
    {
      email: user.email,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
    },
    JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: ACCESS_TOKEN_TTL,
    },
  );

const signRefreshToken = (user, jti) =>
  jwt.sign({}, JWT_SECRET, {
    subject: String(user.id),
    jwtid: jti,
    expiresIn: REFRESH_TOKEN_TTL,
  });

// RFC 6265 allows only a single Path value, so the cookie is scoped to "/" and
// reaches both /refresh and /logout (httpOnly keeps it unreadable from JS).
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // dev over http
  path: "/",
};

// ---------------------------------------------------------------------------
// Refresh-token store (json-server collection `refreshTokens` in db.json).
// Each record is { id: jti, userId, expiresAt }; rotation deletes the old jti.
// ---------------------------------------------------------------------------
const refreshTokens = () => router.db.get("refreshTokens");

const persistRefreshToken = (user) => {
  const jti = randomUUID();
  const record = {
    id: jti,
    userId: user.id,
    expiresAt: Date.now() + msFromTtl(REFRESH_TOKEN_TTL),
  };
  refreshTokens().insert(record).write();
  return signRefreshToken(user, jti);
};

const revokeRefreshToken = (jti) => {
  refreshTokens().remove({ id: jti }).write();
};

const setRefreshCookie = (res, user) => {
  res.cookie(REFRESH_COOKIE, persistRefreshToken(user), REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
};

function msFromTtl(ttl) {
  const units = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) throw new Error(`Unsupported TTL: ${ttl}`);
  return Number(match[1]) * units[match[2]];
}

const server = jsonServer.create();
// Resolve the DB relative to this file (cwd-independent): the seed data lives
// at json-server/db.json, and a stray ./db.json at the repo root shadowed it.
const router = jsonServer.router(fileURLToPath(new URL("./db.json", import.meta.url)));

server.use(cookieParser());
server.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// ---------------------------------------------------------------------------
// Attach the authenticated user (with role) to req.user on EVERY request by
// decoding the Bearer access token.
// ---------------------------------------------------------------------------
server.use((req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith("Bearer ")) {
    try {
      const claims = jwt.verify(authorization.slice("Bearer ".length), JWT_SECRET);
      const user = router.db
        .get("users")
        .find({ id: Number(claims.sub) })
        .value();
      req.user = user ? { id: user.id, email: user.email, role: user.role } : undefined;
    } catch {
      res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token." });
      return;
    }
  }
  next();
});

// Parsed globally so the permission middleware below can inspect body.userId
// on POST; Express body parsers are no-ops on subsequent calls, so the custom
// auth routes keep working unchanged.
server.use(jsonServer.bodyParser);

// ---------------------------------------------------------------------------
// Permission rules (replaces json-server-auth's rewriter).
// Numeric syntax: {owner}{logged-in}{public} where read=4, write=2.
//   users    -> 600 : only the owner can read/write their own user record
//   posts    -> 664 : everyone can read, any logged-in user can write
//   projects -> 660 : only logged-in users can read or write
//   messages -> 640 : owner can write, logged-in users can read
// Owner is matched via the `userId` reference (or `id` for users).
// ---------------------------------------------------------------------------
const RULES = {
  users: {
    read: { owner: true, user: false, public: false },
    write: { owner: true, user: false, public: false },
  },
  posts: {
    read: { owner: true, user: true, public: true },
    write: { owner: true, user: true, public: false },
  },
  projects: {
    read: { owner: true, user: true, public: false },
    write: { owner: true, user: true, public: false },
  },
  messages: {
    read: { owner: true, user: true, public: false },
    write: { owner: true, user: false, public: false },
  },
};

const collectionOf = (path) => {
  const name = path.split("/")[1];
  return RULES[name] ? name : undefined;
};

const ownerIdOf = (name, entity) => (name === "users" ? entity.id : entity.userId);

server.use((req, res, next) => {
  // The refresh-token store must never be reachable through the REST router.
  if (req.path.startsWith("/refreshTokens")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  // Only guard collection routes; /login /register /refresh /logout skip this.
  const name = collectionOf(req.path);
  if (!name) return next();

  const rule = RULES[name];
  const isWrite = req.method !== "GET" && req.method !== "HEAD";
  const action = isWrite ? "write" : "read";
  const access = isWrite ? rule.write : rule.read;
  const user = req.user;

  if (!user && !access.public) {
    res.status(401).json({
      error: "Unauthorized",
      message: `Authentication required to ${action} ${name}.`,
    });
    return;
  }

  const segments = req.path.split("/").filter(Boolean);
  const id = segments[1];

  if (id !== undefined) {
    // Single-resource access (GET/PUT/PATCH/DELETE /collection/:id).
    const entity = router.db
      .get(name)
      .find({ id: Number(id) })
      .value();
    if (!entity) return next(); // let the router answer with 404
    if (!user) return next(); // public read (checked above)
    const isOwner = String(ownerIdOf(name, entity)) === String(user.id);
    if (isOwner || access.user) return next();
    res.status(403).json({
      error: "Forbidden",
      message: `Only the owner can ${action} this ${name.slice(0, -1)}.`,
    });
    return;
  }

  // Collection-level access.
  // GET list: only collections with logged-in or public read are exposed;
  // owner-only resources (users: 600) have no "list all" mode.
  if (!isWrite) {
    if (access.user || access.public) return next();
    res.status(403).json({
      error: "Forbidden",
      message: `Listing all ${name} is not allowed.`,
    });
    return;
  }

  // POST creates a new resource: the body must reference the authenticated
  // user as owner, mirroring json-server-auth's "private resource creation"
  // rule (users excepted — you register as yourself).
  if (req.method === "POST" && name !== "users") {
    if (req.body?.userId === undefined || String(req.body.userId) !== String(user.id)) {
      res.status(403).json({
        error: "Forbidden",
        message: "Private resource creation: request body must have a reference to the owner id",
      });
      return;
    }
  }

  next();
});

// ---------------------------------------------------------------------------
// Auth endpoints.
// ---------------------------------------------------------------------------
const validateAuthBody = (req, res, next) => {
  const email = req.body?.email;
  const password = req.body?.password;
  if (!email || !email.trim() || !password || !password.trim()) {
    res.status(400).jsonp("Email and password are required");
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).jsonp("Email format is invalid");
    return;
  }
  if (password.length < 4) {
    res.status(400).jsonp("Password is too short");
    return;
  }
  next();
};

const withoutPassword = ({ password, ...user }) => user; // eslint-disable-line no-unused-vars

server.post("/login", validateAuthBody, (req, res) => {
  const { email, password } = req.body;
  const user = router.db.get("users").find({ email }).value();
  if (!user) {
    res.status(400).jsonp("Cannot find user");
    return;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    res.status(400).jsonp("Incorrect password");
    return;
  }
  setRefreshCookie(res, user);
  res.status(200).jsonp({ accessToken: signAccessToken(user), user: withoutPassword(user) });
});

server.post("/register", validateAuthBody, (req, res) => {
  const { email, password, ...rest } = req.body;
  const users = router.db.get("users");
  if (users.find({ email }).value()) {
    res.status(400).jsonp("Email already exists");
    return;
  }
  const user = users.insert({ email, password: bcrypt.hashSync(password, 10), ...rest }).write();
  setRefreshCookie(res, user);
  res.status(201).jsonp({ accessToken: signAccessToken(user), user: withoutPassword(user) });
});

// Exchange the refresh cookie for a new access token. The refresh token is
// rotated on every use: the old jti is revoked and a fresh cookie is set.
server.post("/refresh", (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    res.status(401).json({ error: "Unauthorized", message: "Missing refresh token." });
    return;
  }
  let claims;
  try {
    claims = jwt.verify(token, JWT_SECRET);
  } catch {
    clearRefreshCookie(res);
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired refresh token.",
    });
    return;
  }
  const stored = refreshTokens().find({ id: claims.jti }).value();
  if (!stored || stored.expiresAt < Date.now()) {
    if (stored) revokeRefreshToken(claims.jti);
    clearRefreshCookie(res);
    res.status(401).json({
      error: "Unauthorized",
      message: "Refresh token revoked or expired.",
    });
    return;
  }
  const user = router.db
    .get("users")
    .find({ id: Number(claims.sub) })
    .value();
  if (!user) {
    revokeRefreshToken(claims.jti);
    clearRefreshCookie(res);
    res.status(401).json({ error: "Unauthorized", message: "Unknown user." });
    return;
  }
  revokeRefreshToken(claims.jti);
  setRefreshCookie(res, user);
  res.status(200).json({ accessToken: signAccessToken(user) });
});

server.post("/logout", (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const claims = jwt.verify(token, JWT_SECRET);
      if (claims.jti) revokeRefreshToken(claims.jti);
    } catch {
      // Already invalid — just clear the cookie.
    }
  }
  clearRefreshCookie(res);
  res.status(204).end();
});

server.use(jsonServer.defaults({ noCors: true }));

// ---------------------------------------------------------------------------
// Role-based authorization demo (runs after auth).
// ---------------------------------------------------------------------------
server.use((req, res, next) => {
  if (req.user) {
    const role = req.user.role;

    // DELETE on /posts requires the "admin" role.
    if (req.method === "DELETE" && req.path.startsWith("/posts/") && role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only users with the 'admin' role can delete posts.",
      });
    }

    console.log(`[${req.method} ${req.path}] user=${req.user.email} (${role})`);
  } else {
    console.log(`[${req.method} ${req.path}] anonymous`);
  }
  next();
});

server.use(router);

server.listen(3000, () => {
  console.log("JSON Server (auth) running → http://localhost:3000");
  console.log(
    `  POST /register    register a new user (sets a ${REFRESH_TOKEN_TTL} refresh cookie)`,
  );
  console.log(
    `  POST /login       log in → accessToken (JWT, ${ACCESS_TOKEN_TTL}) + refresh cookie`,
  );
  console.log("  POST /refresh     rotate the refresh cookie → new accessToken");
  console.log("  POST /logout      revoke the refresh token and clear the cookie");
  console.log("  GET  /posts       public read, write needs a token");
  console.log("  GET  /projects    requires a token");
  console.log("  GET  /messages    requires a token (owner can write)");
  console.log("Seed users (password: password123):");
  console.log("  admin@example.com  (admin)");
  console.log("  editor@example.com (editor)");
  console.log("  user@example.com   (user)");
});
