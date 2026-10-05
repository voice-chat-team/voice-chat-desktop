# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Все коммити делай в формате Conventional Commits

## Project overview

A Discord-like voice/text chat desktop app built with **Tauri 2** (Rust backend shell) + **React 19 / TypeScript** (frontend, via Vite). The frontend talks to a remote REST API (`https://api.voice-chat-app.ru`) and a Centrifugo realtime server (`wss://centrifugo.voice-chat-app.ru`) for live updates (notifications, channel events, etc.).

## Commands

Frontend (run from repo root):

- `npm run dev` — copy the Excalidraw fonts into `public/`, then start the Vite dev server (used standalone, without the Tauri shell).
- `npm run build` — copy the Excalidraw fonts, type-check (`tsc`), then build the frontend (`vite build`).
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

On Android/iOS (`#[cfg(mobile)]`) `keyring` isn't compiled in at all (it's a desktop-only target dependency in `Cargo.toml`), so the encrypted file is always used — the config dir sits in the app's private sandbox there. Keep `KeyringStorage` and anything touching it behind `#[cfg(desktop)]`.

The frontend only talks to this through Tauri commands wrapped in `src/shared/api/auth-commands.ts` (`login`, `logout`, `getAccessToken`, `hasToken`, `refreshAccessToken`), which does small in-memory caching of the current token/flag. `src/shared/api/client.ts` wires an axios instance (used by the generated `AuthApi`/`GuildApi`/`UserApi`/`InvitationApi`/`NotificationApi`) with:

- a request interceptor that attaches `Authorization: Bearer <token>` via `getAccessToken()`,
- a response interceptor that, on a single 401, calls `refreshAccessToken()` (de-duped via a shared in-flight promise) and retries the original request once.

When adding a new authenticated API call, use the generated API instances exported from `src/shared/api/client.ts` (re-exported via `@/shared`) rather than raw axios/fetch — they get auth handling for free.

### Generated API layer

`src/shared/api/generated/` is fully generated from the OpenAPI spec via `npm run codegen` (`openapitools.json` config, `typescript-axios` generator, split into `api/` and `models/`). Never edit these files by hand — change the backend spec and regenerate instead. Hand-written API glue (client construction, auth wiring, React Query hooks) lives in `src/shared/api/*.ts` and `src/shared/api/queries/`.

### Whiteboards (Excalidraw)

Guilds have a **«Доски»** section in the channel aside (`src/widgets/server-aside-section/ui/ServerAsideBoards/`), between text channels and members. Picking a board renders it in the **centre pane**, the same slot as the chat — `src/pages/server-page/ui/ServerPage.tsx` branches on `activeBoard` / `activeTextChannel`, and the `server` store keeps them mutually exclusive inside its actions, so only one view is ever mounted.

Rules when touching this area:

Boards are **collaborative**: they live in the `services.boards` backend (gateway `/board` routes, generated `boardApi`), and every participant edits the same scene in real time and sees the others' cursors.

- **Scene sync** (`hooks/useBoardSync.ts`): own edits are diffed in `onChange` against `syncedVersions` (element id → version the server already knows), queued, and sent to `POST /board/scene` throttled at 150 ms, one request at a time, in batches of ≤ 200 elements. Remote edits arrive on the Centrifugo channel `board:{boardId}` (`BOARD_ELEMENTS_UPDATED`, own echo skipped via `BOARD_CLIENT_ID`) and are merged with `reconcileElements` + `updateScene({ captureUpdate: CaptureUpdateAction.NEVER })`, so others' edits never land in your undo stack. The server applies the **same rule** as `reconcileElements` (higher `version` wins, ties go to the lower `versionNonce`) — keep the two in step. On `subscribed` with `recovered === false` or a gap in `seq`, the scene is refetched and merged again (merging is idempotent).
- **`restoreElements(remote, null)` — the `null` matters.** Given local elements, it bumps the incoming element's version above the local one, so remote edits would always win instead of following the rule.
- `onChange` receives deleted elements too (`isDeleted`), which is how deletions propagate; the server keeps them as tombstones and returns them from `GET /board/scene`.
- **Cursors** (`hooks/useBoardPresence.ts`): clients publish `POINTER` straight to `board-presence:{boardId}` (client-side publish, throttled to 50 ms, no backend hop). The author comes from the publication's `info.user` (set by Centrifugo from the connection token), never from the payload. Collaborators are keyed by Centrifugo connection id and handed to Excalidraw as `appState.collaborators` — Excalidraw draws the cursors and the top-right participant list itself. Presence/join/leave keep the list current.
- Both channels require **subscription tokens** from `GET /board/subscription-token` (`getToken` on `newSubscription`); the Centrifugo namespaces `board` (server-publish only, history + recovery) and `board-presence` (`allow_publish_for_subscriber`, `presence` + `allow_presence_for_subscriber` — without the latter `sub.presence()` fails with code 103 — join/leave) are configured on the server, not in this repo.
- **Images are not synced yet**: the image tool is off (`UIOptions.tools.image = false`), file pastes are rejected in `onPaste`, and `useBoardSync` skips `type === "image"` elements.
- Board list changes (`BOARD_CREATED` / `BOARD_UPDATED` / `BOARD_DELETED`) arrive on `guild:{guildId}` and are handled by `useGuildBoardEvents` (`src/entities/board/hooks/`), wired in `ServerPage` to keep or close the open board.

Rules when touching this area:

- **Runtime imports of `@excalidraw/excalidraw` are confined to `src/features/guild-board/ui/BoardCanvas.tsx` and `hooks/useBoardSync.ts`** (imported only by the former). The package is a ~1.1 MB JS + 145 KB CSS chunk, reached exclusively through the `React.lazy` loader in `GuildBoard.tsx`. Everywhere else — including `src/shared/api/boards/board.types.ts` — use `import type`; the `@excalidraw/excalidraw/types` and `/element/types` subpaths are types-only and have no runtime entry at all.
- **Scene fonts are self-hosted.** `scripts/copy-excalidraw-assets.mjs` copies them from `node_modules` into `public/excalidraw-assets/fonts` (gitignored, regenerated by `npm run dev` / `npm run build`; the CJK Xiaolai family is skipped, it is 13 MB of the 14), and `setExcalidrawAssetPath()` from `@/shared` points the package at them. That call must stay **inside the lazy loader, before `await import(...)`** — ESM imports hoist, so setting it in the canvas module body would run too late. This is not optional polish: the Tauri CSP is `font-src 'self'`, so the package's CDN fallback is blocked and text would silently render in a fallback font.
- **Never sync the whole `appState`.** `pickSharedAppState` (`src/features/guild-board/models/`) keeps only the keys in `SHARED_APP_STATE_KEYS`, and `services.boards` filters by the same list. The rest is either unserialisable (`collaborators` is a `Map`), per-viewer (viewport size, scroll, zoom, selection), or changes on every pointer move — which would defeat the change detection.
- **The grid is always on and deliberately not user-toggleable**, via the `gridModeEnabled` _prop_ on `<Excalidraw>`. The package resolves it as `props.gridModeEnabled ?? state.gridModeEnabled`, and the built-in `gridMode` action carries `predicate: (…, appProps) => appProps.gridModeEnabled === undefined`, so passing the prop is what removes the context-menu entry and the `Ctrl + '` shortcut — nothing is hidden by hand. For the same reason `gridModeEnabled` is **not** in `SHARED_APP_STATE_KEYS`: the prop overrides state, so a persisted value would be inert today and would turn the grid off on every existing board the day the prop is dropped.
- `useBoardSync` uses `hashElementsVersion` (not the deprecated `getSceneVersion`) to ignore no-op `onChange` calls, and flushes the queue on unmount, `beforeunload`, `pagehide` and `visibilitychange` (Android).
- Data access goes through `useGuildBoards` / `useBoardScene` in `src/entities/board/hooks/` (TanStack Query over `boardApi`). The scene query is only the **initial snapshot** — after mount the scene lives in Excalidraw, so `GuildBoard` pins it in a ref and never feeds a refetch back as `initialData` (that would remount the canvas).

### Realtime (Centrifugo)

`src/app/providers/CentrifugeProvider.tsx` creates a single `Centrifuge` client (`src/shared/api/centrifuge/centrifuge.client.ts`, token supplied via `getAccessToken()`) at app root and exposes it through `CentrifugeContext`; `useCentrifuge()` (`src/shared/lib/hooks/useCentrifuge.tsx`) reads it. Feature/entity hooks subscribe to per-resource channels (e.g. `personal:#{userId}:notifications`) inside a `useEffect`, and on `publication` events update TanStack Query's cache directly with `queryClient.setQueryData(...)` rather than refetching — follow this pattern (see `src/entities/notifications/hooks/useUserNotification.tsx` and `src/entities/server/hooks/useGuildChannelEvents.tsx`) for new realtime-driven data.

### System notifications for new messages

`src/features/message-notifications/` turns new guild messages into OS notifications (`@tauri-apps/plugin-notification`). `MessageNotificationsListener` is mounted in `SidebarLayout`, so it runs on every authenticated screen. It subscribes to `personal:#{userId}:messages`, where `services.messages` broadcasts a `NEW_GUILD_MESSAGE` event (a `NotificationType` key) to every guild member except the author and banned members. The event is realtime-only and is never stored in the notification bell. A notification is skipped when the window is focused and the event's channel is the `activeTextChannel`. Notifications are throttled to one per channel every 3 s. Outside Tauri (`npm run dev`) nothing is shown. On desktop, clicking a notification does nothing: `onAction` is mobile-only in plugin v2.

### State management

- **Server/remote state**: TanStack Query (`src/shared/api/query-client.api.ts` for the client, `src/shared/api/queries/` for hooks like `use-current-user.ts`, `use-user-servers.ts`, `use-guild-members.ts`).
- **Local/UI state**: zustand stores scoped per entity/widget, using a `{ state, actions }` shape (see `src/entities/server/store/server.store.ts`).
- Forms use `react-hook-form` with `@hookform/resolvers` + `zod` schemas; form logic lives in a feature's `hooks/` (e.g. `useAuthorization`), kept separate from the presentational `ui/` component.

### UI kit

Built on shadcn (`components.json`: style `radix-nova`, base color `neutral`) with Radix primitives (`radix-ui`), Tailwind CSS v4 (`@tailwindcss/vite` plugin, no separate tailwind config file — CSS-based config in `src/shared/styles/main.css`), `class-variance-authority`, and `lucide-react` icons. Components go in `src/shared/ui` (aliased as `ui`/`components` in `components.json`); utilities in `src/shared/lib`.
