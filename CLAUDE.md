# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Discord-like voice/text chat desktop app built with **Tauri 2** (Rust backend shell) + **React 19 / TypeScript** (frontend, via Vite). The frontend talks to a remote REST API (`https://api.voice-chat-app.ru`) and a Centrifugo realtime server (`wss://centrifugo.voice-chat-app.ru`) for live updates (notifications, channel events, etc.).

## Commands

Frontend (run from repo root):
- `npm run dev` — start the Vite dev server (used standalone, without the Tauri shell).
- `npm run build` — type-check (`tsc`) then build the frontend (`vite build`).
- `npm run preview` — preview the built frontend.
- `npm run tauri dev` — run the full desktop app (Rust + webview) in dev mode.
- `npm run tauri build` — produce a production desktop build.
- `npm run codegen` — regenerate the typed API client in `src/shared/api/generated` from the remote OpenAPI spec (`openapitools.json`), using `typescript-axios`. Run this after backend API changes; do not hand-edit files under `generated/`.

There is no configured lint or test command in this repo — do not assume `npm test` / `npm run lint` exist.

Rust backend (`src-tauri/`):
- `cargo build` / `cargo check` (run inside `src-tauri/`) for a Rust-only compile check.
- Normally you don't invoke Cargo directly; `npm run tauri dev`/`build` drives it.

## Architecture

### Frontend: Feature-Sliced Design (FSD)

`src/` follows FSD layers, each importing only from layers below it:

```
app/       bootstrap, router, layouts, providers, middlewares
pages/     route-level screens (composed from widgets/features/entities)
widgets/   larger composed UI blocks (e.g. sidebar sections, auth form switcher)
features/  user-facing actions with their own hooks/model/ui (e.g. authorization,
           create-new-server, manage-guild-members)
entities/  domain objects and their state (e.g. `server` zustand store, `notifications`)
shared/    api clients, ui kit (shadcn), routes, generic lib/hooks, styles
```

Each slice typically has its own `index.ts` barrel; `src/shared/index.ts` re-exports `api`, `constants`, `helpers`, `lib`, `styles`, `ui` so most app code imports from `@/shared` rather than deep paths. The `@/*` path alias maps to `src/*` (see `tsconfig.json` and `vite.config.ts`).

UI copy is in Russian; keep new user-facing strings consistent with that.

### Routing & auth gating

`src/app/router.tsx` defines routes with `react-router` v7 data routers and lazy-loaded page components. A single `authMiddleware` (`src/app/middlewares/auth.middleware.ts`) runs on every route: it calls `hasToken()` and redirects authenticated users away from `ROUTES.AUTHORIZATION` and unauthenticated users to it. Route paths live in `src/shared/constants/routes.constants.ts` (`ROUTES`) — always route through this constant rather than hardcoding paths.

### Auth: tokens live in Rust, not the browser

Access/refresh tokens are **never** stored in JS-accessible storage. They're held by Tauri backend state (`src-tauri/src/auth.rs`) and persisted via `src-tauri/src/storage.rs`, which picks a backend at startup:
- OS keychain (Windows Credential Manager / macOS Keychain / Linux Secret Service) when available, else
- an AES-256-GCM encrypted file fallback in the app config dir.

The frontend only talks to this through Tauri commands wrapped in `src/shared/api/auth-commands.ts` (`login`, `logout`, `getAccessToken`, `hasToken`, `refreshAccessToken`), which does small in-memory caching of the current token/flag. `src/shared/api/client.ts` wires an axios instance (used by the generated `AuthApi`/`GuildApi`/`UserApi`/`InvitationApi`/`NotificationApi`) with:
- a request interceptor that attaches `Authorization: Bearer <token>` via `getAccessToken()`,
- a response interceptor that, on a single 401, calls `refreshAccessToken()` (de-duped via a shared in-flight promise) and retries the original request once.

When adding a new authenticated API call, use the generated API instances exported from `src/shared/api/client.ts` (re-exported via `@/shared`) rather than raw axios/fetch — they get auth handling for free.

### Generated API layer

`src/shared/api/generated/` is fully generated from the OpenAPI spec via `npm run codegen` (`openapitools.json` config, `typescript-axios` generator, split into `api/` and `models/`). Never edit these files by hand — change the backend spec and regenerate instead. Hand-written API glue (client construction, auth wiring, React Query hooks) lives in `src/shared/api/*.ts` and `src/shared/api/queries/`.

### Realtime (Centrifugo)

`src/app/providers/CentrifugeProvider.tsx` creates a single `Centrifuge` client (`src/shared/api/centrifuge/centrifuge.client.ts`, token supplied via `getAccessToken()`) at app root and exposes it through `CentrifugeContext`; `useCentrifuge()` (`src/shared/lib/hooks/useCentrifuge.tsx`) reads it. Feature/entity hooks subscribe to per-resource channels (e.g. `personal:#{userId}:notifications`) inside a `useEffect`, and on `publication` events update TanStack Query's cache directly with `queryClient.setQueryData(...)` rather than refetching — follow this pattern (see `src/entities/notifications/hooks/useUserNotification.tsx` and `src/entities/server/hooks/useGuildChannelEvents.tsx`) for new realtime-driven data.

### State management

- **Server/remote state**: TanStack Query (`src/shared/api/query-client.api.ts` for the client, `src/shared/api/queries/` for hooks like `use-current-user.ts`, `use-user-servers.ts`, `use-guild-members.ts`).
- **Local/UI state**: zustand stores scoped per entity/widget, using a `{ state, actions }` shape (see `src/entities/server/store/server.store.ts`).
- Forms use `react-hook-form` with `@hookform/resolvers` + `zod` schemas; form logic lives in a feature's `hooks/` (e.g. `useAuthorization`), kept separate from the presentational `ui/` component.

### UI kit

Built on shadcn (`components.json`: style `radix-nova`, base color `neutral`) with Radix primitives (`radix-ui`), Tailwind CSS v4 (`@tailwindcss/vite` plugin, no separate tailwind config file — CSS-based config in `src/shared/styles/main.css`), `class-variance-authority`, and `lucide-react` icons. Components go in `src/shared/ui` (aliased as `ui`/`components` in `components.json`); utilities in `src/shared/lib`.
