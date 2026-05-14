# Chordial Project Instructions

Chordial is a mobile social network for guitar players built with Expo, React Native, and Supabase.

## Tech Stack
- **Framework**: Expo (SDK 54) with Expo Router (File-based routing).
- **Runtime**: React Native 0.81, React 19 (New Architecture & React Compiler enabled).
- **Backend**: Supabase (Auth, Database, Storage, RLS).
- **Data Fetching**: React Query (TanStack Query) with AsyncStorage persistence.
- **Styling**: NativeWind v4 (Tailwind CSS) - "Editorial Classic" design system.
- **State Management**: Zustand (available), React Query (server state).
- **Validation**: Zod + React Hook Form.

## Core Commands
- `npm start`: Start the Expo development server (Metro).
- `npm run ios` / `npm run android` / `npm run web`: Launch the app on specific platforms.
- `npm run lint`: Run ESLint (must be clean for commits).
- `npm run types:gen`: Regenerate Supabase types in `types/database.types.ts`. Run after database migrations.

## Development Conventions

### Architecture
- **Routing**: All screens live in `app/`. Auth gates are managed in `app/(auth)/_layout.tsx` and `app/(app)/_layout.tsx`.
- **Data Layer**: Use React Query hooks from `hooks/`. **Never** call `supabase.from(...)` directly in components.
- **Auth**: Use `useAuth()` hook from `hooks/useAuth.ts`. Do not use Supabase auth methods directly in screens.
- **Supabase Client**: Single client instance in `lib/supabase.ts`.
- **Storage**: Helpers in `lib/storage.ts` for `avatars` and `post-images` buckets.

### Database & RLS
- **Migrations**: Found in `supabase/migrations/`.
- **RLS**: Policies enforce owner-scoped writes and block-aware reads (via `public.is_blocked` function). Blocked content is filtered at the DB level.

### Styling & UI
- **Design System**: "Editorial Classic" uses **Fraunces** (serif) and **Inter** (sans) fonts.
- **Theme**: Tokens are in `tailwind.config.js`. Use `font-sans-medium` instead of `font-sans` + `font-medium`.
- **Components**: Reusable UI primitives are in `components/ui/`.

### General
- **Path Aliases**: Use `@/*` for imports (e.g., `@/components/...`).
- **Validation**: Use Zod schemas from `validators/` for form validation.
- **Toasts**: Use `lib/toast.ts` wrapper.
- **Environment Variables**: Prefixed with `EXPO_PUBLIC_` in `.env.local`.
