# AGENTS.md

## Commands
- `npm run dev` — Vite dev server (frontend only)
- `npm run server` / `npm run server:watch` — mock backend on http://localhost:3000
- `npm run dev:all` — frontend + backend concurrently
- `npm run build` — `tsc -b && vite build` (build is also the typecheck)
- `npm run lint` — oxlint

No test framework is installed. Verify changes with `npm run lint` then `npm run build`.

## Stack
- Vite + React 19 + TypeScript, TanStack Router + Query, antd v6.
- TanStack Router uses file-based routes in `src/routes/` with auto code-splitting (vite plugin, `vite.config.ts`).
- `src/routeTree.gen.ts` is auto-generated and **committed** — never edit it by hand.

## FSD structure (Feature-Sliced Design)
- `src/app/` — entrypoint (`main.tsx`), router/provider setup, `store/query-client.ts`, `layouts/` (root layout), `styles/`. See the `feature-sliced-design` skill for layer rules.
- `src/pages/` — one slice per route (`home/`, `about/`); each slice exposes a public API via its `index.ts`.
- `src/shared/` — infrastructure with no business logic (`config/` holds `API_BASE_URL`).
- Layers may only import from layers strictly below (app → pages → shared). Cross-slice imports on the same layer are forbidden. Don't add `features/`/`entities/` until code is actually reused in 2+ places.

## Path aliases
`@app/*`, `@pages/*`, `@shared/*` are declared in `tsconfig.app.json` **and** wired in `vite.config.ts` (`resolve.alias`). Both must stay in sync when adding a layer.

## Entrypoints
- `src/app/main.tsx` is the app root: renders Providers (TanStack Query's QueryClientProvider), RouterProvider. `index.html` points to it.
- `src/app/router.tsx` creates the router with the QueryClient in context; `src/app/store/query-client.ts` holds the single `QueryClient` instance used by both router and providers.
- Route files in `src/routes/` are **thin wrappers**: they only declare the `Route` (`createFileRoute` / `createRootRouteWithContext`) and pull components from `@/app` or `@/pages`. Business logic stays in `pages/` slices.

## Backend (json-server, no json-server-auth)
- Single `json-server/server.js`, data in `json-server/db.json`, port 3000.
- Auth is **self-implemented** (json-server-auth was removed): CORS + cookie-parser → Bearer-user decoder → global bodyParser → permission middleware → auth endpoints → defaults → role check → router.
- Token flow — **access token in memory (client) + refresh token in an httpOnly cookie**:
  - `accessToken`: JWT, `ACCESS_TOKEN_TTL` (`"15m"`), returned in the response body of `/login` and `/refresh`.
  - `refreshToken`: JWT (`jti`), `REFRESH_TOKEN_TTL` (`"7d"`), sent as an httpOnly `SameSite=Lax` cookie. Rotated on every `/refresh` (old `jti` revoked, new cookie set).
- Endpoints: `POST /login`, `POST /register` (both set the refresh cookie, return `{ accessToken, user }`), `POST /refresh` (→ `{ accessToken }`), `POST /logout` (revokes the `jti`, clears the cookie). Legacy `json-server-auth`'s `GET /me` is gone.
- Refresh tokens live in the `refreshTokens` collection in `db.json` (`{ id: jti, userId, expiresAt }`) and are blocked from the REST router.
- JWT secret: `process.env.JWT_SECRET ?? "dev-secret"`.
- CORS is `cors({ origin: "http://localhost:5173", credentials: true })`; `jsonServer.defaults({ noCors: true })` so its own cors doesn't overwrite the headers. Client must send requests with credentials.
- Permission middleware replicates jsa's 3-digit `{owner}{logged-in}{public}` codes: users=600, posts=664, projects=660, messages=640. Ownership is matched via `userId` (or `id` for users); POST requires the body's `userId` to equal the authenticated user.
- Seed users (все пароли — `password123`):
  - `admin@example.com`  (role: admin)
  - `editor@example.com` (role: editor)
  - `user@example.com`   (role: user)

## TS / lint conventions
- `verbatimModuleSyntax`: use `import type` for type-only imports.
- `erasableSyntaxOnly`: no enums, namespaces, or parameter properties.
- `react/rules-of-hooks` = error.

## Skills
Installed locally: `feature-sliced-design` (intended architecture) and `vercel-react-best-practices`.