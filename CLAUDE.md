# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — start the Expo dev server (Metro). Use `npm run ios`, `npm run android`, or `npm run web` to launch a specific target.
- `npm run lint` — runs `expo lint` (ESLint flat config extending `eslint-config-expo`).
- `npm run types:gen` — regenerates `types/database.types.ts` from the linked Supabase project. Run this whenever a migration changes the schema; the Supabase client in `lib/supabase.ts` is typed against the resulting `Database` type.
- No test runner is configured.

Env vars (in `.env.local`, must be `EXPO_PUBLIC_`-prefixed to be inlined into the client bundle):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`

## Architecture

Expo Router app (Expo SDK 54, React 19, RN 0.81, New Architecture + React Compiler enabled) using file-based routing under `app/`. Three things drive the overall structure:

**Auth-gated route groups.** `app/_layout.tsx` wraps the entire tree in `AuthProvider`. Inside, two route groups split by auth state:
- `app/(app)/_layout.tsx` renders a `Tabs` navigator but redirects to `/(auth)/sign-up` if there is no session.
- `app/(auth)/_layout.tsx` renders a `Stack` but redirects to `/` if a session exists.
Both layouts return `null` while `loading` is true to avoid flicker. New top-level routes should be placed inside the appropriate group so they inherit the redirect logic — do not add screens directly under `app/` unless they should be reachable in both states.

**Single Supabase client (`lib/supabase.ts`).** Uses `AsyncStorage` for session persistence on native and the default web storage on web (`Platform.OS !== "web"` switch). It also wires `AppState` to `startAutoRefresh`/`stopAutoRefresh` so tokens refresh only while foregrounded — preserve this when modifying the client. The client is typed with the generated `Database` type, so all `.from(...)` calls are schema-aware.

**`AuthProvider` is the only auth state holder.** `providers/auth-provider.tsx` exposes `session`, `loading`, and `signIn`/`signUp`/`signOut`. `signUp` returns `needsEmailConfirmation` (true when sign-up succeeds without an immediate session). Consume via `useAuth()` (`hooks/useAuth.ts`), which throws if used outside the provider. There is no other auth state — do not duplicate `supabase.auth.getSession()` calls in screens.

**Validation.** Forms use Zod schemas from `validators/` and `safeParse` the input before calling auth methods (see `app/(auth)/sign-in.tsx` and `sign-up.tsx`). Pass `result.data.*` to the API, not the raw state, so the trimmed/parsed values are used.

**Database & RLS.** Migrations live in `supabase/migrations/`. The initial migration creates `public.profiles` (1:1 with `auth.users`) with RLS policies scoped to `auth.uid() = id`, plus triggers (`handle_new_user`, `handle_user_update`, `set_updated_at`) that keep profile rows in sync with `auth.users`. Any new user-owned table should follow the same RLS-by-owner pattern.

## Conventions

- Path alias: `@/*` resolves to the repo root (see `tsconfig.json`). Imports use `@/lib/...`, `@/hooks/...`, etc.
- Styling: NativeWind v4 (Tailwind classes via `className`). `global.css` is imported from `app/_layout.tsx`; Tailwind content globs cover `app/` and `components/`. Babel preset is `babel-preset-expo` with `jsxImportSource: "nativewind"`.
- Typed routes are enabled (`experiments.typedRoutes`), so `<Link href>` and router calls are type-checked against the `app/` tree.
- Available but not yet used in app code: `@tanstack/react-query`, `zustand`, `expo-sqlite`, `expo-secure-store`. If introducing them, place providers in `app/_layout.tsx` alongside `AuthProvider`.
