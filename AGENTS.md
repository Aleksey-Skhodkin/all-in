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

## Backend (json-server + json-server-auth)
- Single `json-server/server.js`, data in `json-server/db.json`, port 3000.
- Middleware order matters: rules → auth → defaults → role check → router.
- JWT secret is hardcoded `json-server-auth-123456` (json-server-auth v2 internal).
- Permissions use 3-digit `{owner}{logged-in}{public}` codes: users=600, posts=664, projects=660, messages=640.
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