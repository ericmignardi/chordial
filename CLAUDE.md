# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Chordial is a mobile social network for guitar players (Expo / React Native + Supabase). `PRD.md` is the product spec and `PLAN.md` is the milestone-by-milestone build plan with a "reuse map" — read them before adding a feature; they say what is in scope and what to copy rather than reinvent.

## Commands

- `npm start` — start the Expo dev server (Metro). Use `npm run ios`, `npm run android`, or `npm run web` to launch a specific target.
- `npm run lint` — runs `expo lint` (ESLint flat config extending `eslint-config-expo`). Must be clean on every commit; CI runs it on PRs.
- `npm run types:gen` — regenerates `types/database.types.ts` from the linked Supabase project (`supabase gen types typescript --linked`). Run this after every migration and commit the regenerated file in the same PR — the Supabase client in `lib/supabase.ts` is typed against the resulting `Database` type, so `.from(...)`, `.rpc(...)`, `Tables<>`, etc. are all schema-aware.
- No test runner is configured.

Env vars live in `.env.local` and must be `EXPO_PUBLIC_`-prefixed to be inlined into the client bundle:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`

## Architecture

Expo Router app (Expo SDK 54, React 19, RN 0.81, New Architecture + React Compiler enabled) with file-based routing under `app/`.

**Provider stack (`app/_layout.tsx`).** Nesting order is load-bearing: `GestureHandlerRootView` → `QueryProvider` → `AuthProvider` → `BottomSheetModalProvider` → `Stack`. The layout also blocks render until fonts load, mounts the `<Toast />` root, and exports an `ErrorBoundary`. New global providers go here, inside the appropriate level.

**Three auth/state gates.** The route tree splits into two groups, and the `(app)` group has an extra onboarding gate:
- `app/(auth)/_layout.tsx` renders a `Stack`, redirects to `/` if a session exists.
- `app/(app)/_layout.tsx` renders the `Tabs` navigator. It redirects to `/(auth)/sign-up` if there is no session, **then** redirects to `/(auth)/onboarding` if the user's `profiles.username` is null. Both layouts return `null` while `loading` (or `profileLoading`) is true to avoid flicker.
- Put new top-level routes inside the correct group so they inherit these redirects. Tab-bar siblings that should be reachable but not shown as tabs are registered with `options={{ href: null }}` in `(app)/_layout.tsx`.

**`AuthProvider` is the only auth-state holder (`providers/auth-provider.tsx`).** Exposes `session`, `loading`, `signIn`/`signUp`/`signOut`. `signUp` returns `needsEmailConfirmation` (true when sign-up succeeds without an immediate session). Consume via `useAuth()` (`hooks/useAuth.ts`), which throws outside the provider. Never call `supabase.auth.getSession()` or subscribe to `onAuthStateChange` from a screen.

**Data layer = React Query, exclusively.** Every read and write goes through a hook in `hooks/use<Thing>.ts` — there are **no raw `supabase.from(...)` calls in components or screens**. Conventions to mirror when adding hooks:
- `QueryProvider` (`providers/query-provider.tsx`) wraps `PersistQueryClientProvider`, persisting the cache to `AsyncStorage` (24h `maxAge`); defaults are 5min `staleTime`, 24h `gcTime`, `retry: 2`. This is what gives the app its offline feed.
- Query keys are arrays, usually `[entity, ...params, userId]` (e.g. `["feed", scope, userId]`, `["profile", userId]`, `["post", id]`). `useFeed` uses `useInfiniteQuery` with the oldest `created_at` as the page param.
- Mutations either `invalidateQueries` on success (`useCreatePost`, `useBlock` — see `invalidateAfterBlockChange` for the fan-out pattern) or do optimistic cache edits in `onMutate`/`onError` (`useLike`/`useUnlike` via `applyLikeToFeedCache`, which patches both the `["feed"]` infinite cache and the `["post", id]` cache).
- `useFeed` exports `SELECT_COLUMNS` and `normalize`; `usePost` reuses both so a single post and a feed row have the identical shape (`FeedPost`). Extend the feed shape in `useFeed.ts`, not by duplicating the select string.

**Single Supabase client (`lib/supabase.ts`).** Uses `AsyncStorage` for session persistence on native and default web storage on web (`Platform.OS !== "web"` switch), `processLock` for the auth lock, and wires `AppState` to `startAutoRefresh`/`stopAutoRefresh` so tokens refresh only while foregrounded. Preserve all of this when modifying the client. Never instantiate a second client.

**Storage (`lib/storage.ts`).** Two public-read buckets, `avatars` and `post-images`. Upload helpers read the file via `expo-file-system`'s `File(...).arrayBuffer()` and `upload(...)`. Path convention is enforced by storage RLS policies: `<bucket>/<auth.uid()>/<...>` — `avatars/<uid>/avatar.<ext>` and `post-images/<uid>/<postId>/<ordinal>.<ext>`. Avatar URLs get a `?v=<timestamp>` cache-buster appended.

## Database & RLS

Migrations live in `supabase/migrations/` (timestamped). Schema, in dependency order:
- `profiles` (1:1 with `auth.users`) — kept in sync by triggers `handle_new_user`, `handle_user_update`, `set_updated_at`. `username` has a DB-level format check (`^[a-z0-9_]{3,20}$`).
- `gear` — per-user "rig" items (`gear_kind` enum: guitar/bass/amp/pedal/other).
- `posts` + `post_images` (separate table so multi-image is trivial later) + `likes` (composite PK blocks double-likes) + `comments` (flat).
- `follows` — composite PK `(follower_id, followee_id)`, `check (follower_id <> followee_id)`.
- `blocks` + `reports`.

RLS patterns — follow them for any new table:
- **Owner-scoped writes**: insert/update/delete policies check `auth.uid() = <owner column>`. Public-read tables use `using (true)` for SELECT.
- **Block enforcement**: `public.is_blocked(viewer, target)` is a `security definer` SQL function checking blocks in *both* directions. The SELECT policies on `posts`, `comments`, and `profiles` call it (`not public.is_blocked(auth.uid(), author_id)`), so blocked content disappears at the database layer — you do not (and should not) re-filter it in app code.
- **Account deletion**: `public.delete_account()` is a `security definer` RPC that deletes the caller's `auth.users` row; cascades wipe everything they own. `useDeleteAccount` calls it then `signOut()`s and clears the query cache.

## Conventions

- **Path alias**: `@/*` resolves to the repo root (`tsconfig.json`). Imports use `@/lib/...`, `@/hooks/...`, etc.
- **Typed routes** are enabled (`experiments.typedRoutes`), so `<Link href>` and `router` calls are checked against the `app/` tree.
- **Validation**: forms validate with Zod schemas from `validators/` before hitting the API. Auth screens use `safeParse` directly and surface `result.error.issues[0].message` (see `app/(auth)/sign-in.tsx`); `react-hook-form` + `@hookform/resolvers` are installed for the larger forms. Always pass `result.data.*` (trimmed/parsed) to the API, never the raw state.
- **Styling — "Editorial Classic" design system**: NativeWind v4 (Tailwind classes via `className`). Theme tokens in `tailwind.config.js`: colors `surface` (`#FAFAF7`), `ink` / `ink-2` / `ink-3`, `hair` (hairline border); fonts are **Fraunces** (serif: `font-serif`, `font-serif-medium`, etc.) and **Inter** (sans). Each weight/style is its own `fontFamily` because RN does not synthesize weight/italic for custom fonts — use `font-sans-medium`, not `font-sans` + `font-medium`. The accent color is `emerald-600`. Reusable primitives live in `components/ui/` (`Button`, `Input`, `AuthField`, `Avatar`, `Screen`, `Skeleton`); `Screen` is the SafeAreaView + optional-scroll wrapper every screen should sit in. `global.css` is imported from `app/_layout.tsx`; Tailwind content globs cover `app/` and `components/`.
- **Toasts**: use the thin wrapper `lib/toast.ts` (`toast.success/error/info`), not `react-native-toast-message` directly.
- **Bottom sheets**: `@gorhom/bottom-sheet` for action menus (`components/post-actions-sheet.tsx`, `user-actions-sheet.tsx`); the modal provider is already mounted in `app/_layout.tsx`.
- Available but not yet wired into app code: `zustand`, `expo-sqlite`, `expo-secure-store`, `expo-notifications`. If introducing one, add its provider/setup in `app/_layout.tsx` alongside the existing stack.
