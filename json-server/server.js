import jsonServer from "json-server";
import auth from "json-server-auth";
import bcrypt from "bcryptjs";
import cors from "cors";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";

// json-server-auth v2 hardcodes this secret internally (see its constants.js),
// so our own token-decoding middleware must use the exact same value.
const JWT_SECRET = "json-server-auth-123456";

// json-server-auth hardcodes JWT expiry to 1h with no config option, so /login
// and /register below are overridden to sign tokens with this (short) TTL.
const JWT_EXPIRES_IN = "1m";

const signAccessToken = (user) =>
  jwt.sign({ email: user.email }, JWT_SECRET, {
    subject: String(user.id),
    expiresIn: JWT_EXPIRES_IN,
  });

const server = jsonServer.create();
// Resolve the DB relative to this file (cwd-independent): the seed data lives
// at json-server/db.json, and a stray ./db.json at the repo root shadowed it.
const router = jsonServer.router(fileURLToPath(new URL("./db.json", import.meta.url)));

// json-server-auth needs the router's db bound to the app.
server.db = router.db;

// The auth package exposes a permissions rewriter. Apply it FIRST.
// Numeric syntax: {owner}{logged-in}{public} where read=4, write=2.
//   users    -> 600 : only the owner can read/write their own user record
//   posts    -> 664 : everyone can read, any logged-in user can write
//   projects -> 660 : only logged-in users can read or write
//   messages -> 640 : owner can write, logged-in users can read
const rules = auth.rewriter({
  users: 600,
  posts: 664,
  projects: 660,
  messages: 640,
});

// ---------------------------------------------------------------------------
// Attach the authenticated user (with role) to req.user on EVERY request.
// json-server-auth only sets req.claims inside its own guard routes, so we
// decode the Bearer token here to make role-based checks reliable.
// ---------------------------------------------------------------------------
server.use((req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith("Bearer ")) {
    try {
      const token = authorization.slice("Bearer ".length);
      const claims = jwt.verify(token, JWT_SECRET);
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

// Middleware order matters for json-server-auth:
//   1. rules      -> rewrites guarded routes
//   2. auth       -> handles /me and enforces the /6xx guards (its own
//                    /login and /register are shadowed by the custom routes
//                    mounted above, which run first)
//   3. router     -> serve the collections
// CORS must be mounted BEFORE the auth middleware: auth answers those routes
// directly, so the headers from jsonServer.defaults() (which sits after auth)
// never reach those responses.
server.use(cors());

// ---------------------------------------------------------------------------
// custom /login and /register.
// json-server-auth signs tokens with a hardcoded 1h expiry and exposes no
// setting for it, so these two endpoints replace the default ones. Mounted
// BEFORE server.use(auth): express matches the routes here first and the
// json-server-auth router never sees the request. Because they run before
// json-server-auth (which ships its own body parser), the body is parsed
// here via jsonServer.bodyParser. Response shapes and error messages mirror
// json-server-auth so existing clients keep working.
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

server.post("/login", jsonServer.bodyParser, validateAuthBody, (req, res) => {
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
  res.status(200).jsonp({ accessToken: signAccessToken(user), user: withoutPassword(user) });
});

server.post("/register", jsonServer.bodyParser, validateAuthBody, (req, res) => {
  const { email, password, ...rest } = req.body;
  const users = router.db.get("users");
  if (users.find({ email }).value()) {
    res.status(400).jsonp("Email already exists");
    return;
  }
  const user = users
    .insert({ email, password: bcrypt.hashSync(password, 10), ...rest })
    .write();
  res.status(201).jsonp({ accessToken: signAccessToken(user), user: withoutPassword(user) });
});

server.use(rules);
server.use(auth);
server.use(jsonServer.defaults());

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
  console.log("  POST /register    register a new user (email + password)");
  console.log(`  POST /login       log in → returns an accessToken (JWT, ${JWT_EXPIRES_IN} expiry)`);
  console.log("  GET  /posts       public read, write needs a token");
  console.log("  GET  /projects    requires a token");
  console.log("  GET  /messages    requires a token (owner can write)");
  console.log("Seed users (password: password123):");
  console.log("  admin@example.com  (admin)");
  console.log("  editor@example.com (editor)");
  console.log("  user@example.com   (user)");
});
