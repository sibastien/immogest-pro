# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Unified (Root)
```bash
npm run install:all # Install dependencies for root, backend, and frontend
npm run dev         # Run both backend & frontend concurrently
npm run seed        # Seed the SQLite database with initial admin credentials
npm run build       # Build the frontend for production
```

### Frontend (frontend/)
```bash
cd frontend
npm run dev        # Start Vite dev server (port 5173, proxies /api → localhost:4000)
npm run build      # TypeScript check + Vite production build
npm run lint       # Run oxlint
npm run preview    # Preview the production build
```

### Backend (backend/)
```bash
cd backend
npm run dev        # Start Express with --watch (auto-restart on change, port 4000)
npm run start      # Production start
npm run seed       # Seed the SQLite database with initial admin credentials
```

### First-time setup
```bash
# From root directory:
npm run install:all
npm run seed       # Note down the generated admin email and password!
npm run dev        # Starts both backend (4000) and frontend (5173)
```

## Architecture

This is a French real-estate agency management app (ImmoGest Pro) with two separate packages:

- **frontend/** — React 19 + TypeScript SPA (Vite, Tailwind CSS v4, Zustand, React Router v7)
- **backend/** — Express REST API (CommonJS, better-sqlite3, JWT auth, multer for file uploads)

In development, Vite proxies all `/api` requests to `http://localhost:4000` (`frontend/vite.config.ts`).


### Role-based access

There are 5 roles, each with its own URL namespace, layout component, and page set:

| Role | Path prefix | Layout |
|------|-------------|--------|
| `admin` | `/admin` | `AdminLayout` |
| `coordinatrice` | `/coordinatrice` | `CoordinatriceLayout` |
| `agent_bureau` | `/agent-bureau` | `AgentBureauLayout` |
| `agent_terrain` | `/agent-terrain` | `AgentTerrainLayout` |
| `client` | `/client` | `ClientLayout` |

The router (`src/router/index.tsx`) uses a `RequireAuth` guard that redirects unauthenticated users to `/login` and wrong-role users to their own dashboard. On login, all shared API data is bootstrapped via `useBootstrapData`.

### State management

Global state lives in Zustand stores under `src/store/`. Each store owns one resource:

- `authStore` — JWT token + current user; persisted to `localStorage` under key `immogest-auth`
- `clientsStore`, `propertiesStore`, `agentsStore`, `callsStore`, `documentsStore` — fetch from REST API via `src/lib/api.ts`

`src/lib/api.ts` is the single HTTP client. It attaches `Authorization: Bearer <token>` from `src/lib/token.ts` and throws `ApiError` on non-2xx responses. On 401, it clears the token so the app falls back to the login screen.

### Backend

- **DB**: SQLite file at `server/data/immogest.db` (auto-created on boot). Schema is defined in `server/src/db.js` as idempotent `CREATE TABLE IF NOT EXISTS` statements.
- **Auth**: JWT signed with `JWT_SECRET` env var. Middleware at `server/src/middleware/auth.js` protects all routes except `/api/auth/login`.
- **Routes**: one file per resource under `server/src/routes/`. Column names in DB use `snake_case`; `server/src/mappers.js` converts them to `camelCase` for the API responses.
- **Uploads**: files (property photos, documents) stored on disk under `server/uploads/` and served as static files at `/api/uploads`.

### Types

All shared TypeScript types are in `src/types/index.ts`. The app is in French — field values (statuses, roles, types) use French strings (e.g. `'disponible'`, `'agent_terrain'`, `'visite'`).
