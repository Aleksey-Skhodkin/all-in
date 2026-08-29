import jsonServer from "json-server";
import auth from "json-server-auth";
import jwt from "jsonwebtoken";

// json-server-auth v2 hardcodes this secret internally (see its constants.js),
// so our own token-decoding middleware must use the exact same value.
const JWT_SECRET = "json-server-auth-123456";

const server = jsonServer.create();
const router = jsonServer.router("db.json");

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
//   2. auth       -> handle /register, /login and enforce the /6xx guards
//   3. router     -> serve the collections
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

server.listen(8000, () => {
  console.log("JSON Server (auth) running → http://localhost:8000");
  console.log("  POST /register    register a new user (email + password)");
  console.log("  POST /login       log in → returns an accessToken (JWT)");
  console.log("  GET  /posts       public read, write needs a token");
  console.log("  GET  /projects    requires a token");
  console.log("  GET  /messages    requires a token (owner can write)");
  console.log("Seed users (password: password123):");
  console.log("  admin@example.com  (admin)");
  console.log("  editor@example.com (editor)");
  console.log("  user@example.com   (user)");
});
