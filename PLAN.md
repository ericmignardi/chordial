# Chordial — Implementation Plan

> Companion to `PRD.md`. Five milestones, ~5 weeks. Each milestone is independently shippable to TestFlight / internal testing. Adjust the milestone order only if a customer-facing reason justifies it.

## Conventions

- Single Supabase client lives in `lib/supabase.ts`. Never instantiate another one.
- Auth state lives in `providers/auth-provider.tsx` and is consumed via `useAuth()`. Never subscribe to `supabase.auth.onAuthStateChange` from a screen.
- All forms use `react-hook-form` + Zod, with schemas in `validators/`. Mirror the `validators/auth.ts` pattern (`safeParse`, surface `issues[0].message` on failure).
- All data fetching goes through React Query hooks in `hooks/use<Thing>.ts`. No raw `supabase.from(...)` calls in components.
- Run `npm run types:gen` after every migration to keep `types/database.types.ts` current. Commit the regenerated file in the same PR.
- New screens go inside the existing `(auth)` or `(app)` route groups so they inherit the redirect guards. Don't add screens directly under `app/`.

---

## Milestone 0 — Foundations (2–3 days)

Sets up the plumbing needed by every later milestone. No user-facing features land here.

1. **Install new dependencies** (see `PRD.md` and the package list below).
2. **Wire React Query**:
   - Create `providers/query-provider.tsx` exporting a `QueryClient` with sensible defaults (5min stale time, 24h gc time).
   - Wrap `app/_layout.tsx`: `<QueryProvider><AuthProvider>...`.
   - Add `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` for offline cache.
3. **UI primitives** in `components/ui/`:
   - `Button.tsx`, `Input.tsx`, `Avatar.tsx`, `Screen.tsx` (SafeAreaView + scroll wrapper), `Skeleton.tsx`.
   - All NativeWind-styled. Match the existing emerald-600 accent color used in auth screens.
4. **Toast system**: install `react-native-toast-message`, mount root in `app/_layout.tsx`, export a thin wrapper `lib/toast.ts`.
5. **Error boundary** in `app/_layout.tsx` (use Expo Router's `ErrorBoundary` export from the layout).
6. **EAS Build config**: `eas.json` with `development`, `preview`, `production` profiles. Run `eas build:configure` once.
7. **Supabase Storage buckets** (via SQL or dashboard): create `avatars` and `post-images` buckets with policies — public read, authenticated insert with path scoped to `auth.uid()`.

**Exit criteria**: `npm start` boots cleanly. `npm run lint` is clean. App still navigates to sign-in. Toast can be triggered from a dev button.

### New packages for M0

```
expo-image-picker
expo-file-system
expo-notifications
react-hook-form
@hookform/resolvers
@shopify/flash-list
@gorhom/bottom-sheet
react-native-toast-message
@tanstack/react-query-persist-client
@tanstack/query-async-storage-persister
```

Install with `npx expo install <pkg>` for any expo-prefixed packages, `npm install <pkg>` for the rest.

---

## Milestone 1 — Profile + Rig (1 week)

Delivers a complete identity loop: user signs up → onboards → has a profile → adds gear.

1. **Migration** `supabase/migrations/<ts>_profile_extras_and_gear.sql`:
   - `alter table profiles add column username text unique not null` (with a one-time backfill if there's existing data), `display_name text`, `bio text`, `location text`.
   - `create table public.gear (...)` with kind/brand/model/year/notes, RLS scoped to owner, `set_updated_at` trigger (mirror existing migration).
2. **Run `npm run types:gen`** and commit `types/database.types.ts`.
3. **Validators** `validators/profile.ts`, `validators/gear.ts`. Username rules: 3–20 chars, `^[a-z0-9_]+$`.
4. **Hooks**: `hooks/useProfile.ts`, `hooks/useGear.ts`.
5. **Screens**:
   - `app/(auth)/onboarding.tsx` — 3-slide carousel using `react-native-reanimated`, then username + avatar capture form. Routes to `/` on success.
   - Wire onboarding into the post-sign-up flow (if `profiles.username is null` after sign-in, redirect to onboarding).
   - `app/(app)/profile.tsx` — self profile. Shows avatar, display name, username, bio, follower/following placeholders (count = 0 until M3), and "My Rig" list.
   - `app/(app)/edit-profile.tsx` — modal.
   - `app/(app)/gear/[id].tsx` — add/edit gear. Use `id="new"` for new.
   - `app/(app)/settings.tsx` — sign out (move from the commented-out block in `(app)/_layout.tsx`), edit profile, delete account, blocked users (stub until M4).
6. **Tab bar** update in `app/(app)/_layout.tsx`: add Profile tab.
7. **Avatar upload** via `lib/storage.ts` helper — picks image, uploads to `avatars/${userId}/avatar.jpg`, returns public URL, writes to `profiles.avatar_url`.

**Exit criteria**: New account → sees onboarding → claims username → lands in app → opens Profile → adds a Strat to Rig → kills + reopens app → Strat is still there.

---

## Milestone 2 — Posts + Feed (1.5 weeks)

The core social loop. Single biggest milestone.

1. **Migration** `supabase/migrations/<ts>_posts_and_engagement.sql`:
   - `posts`, `post_images`, `likes`, `comments`. All RLS-enabled, all writes scoped to `auth.uid()`.
   - Indexes: `posts(author_id, created_at desc)`, `posts(created_at desc)`, `likes(post_id)`, `comments(post_id, created_at)`.
2. **`npm run types:gen`** + commit.
3. **Validators**: `validators/post.ts` (caption ≤ 500), `validators/comment.ts` (body ≤ 500).
4. **Hooks**:
   - `useFeed(scope: 'home' | 'discover')` — `useInfiniteQuery` with `pageParam` = oldest `created_at` seen.
   - `usePost(id)`, `useCreatePost()`, `useDeletePost()`.
   - `useLike(postId)` + `useUnlike(postId)` with optimistic updates.
   - `useComments(postId)`, `useCreateComment(postId)`.
5. **`lib/storage.ts`** extended with `uploadPostImage(uri, postId)`. Compress to max 2048px on the long edge before upload (use `expo-image-manipulator` if needed — add to deps).
6. **Screens**:
   - `app/(app)/new-post.tsx` — image picker → preview → caption → submit. Block back-nav while uploading.
   - `app/(app)/index.tsx` — home feed using `FlashList`. Show empty state with CTA to "Discover" tab when user follows nobody / has no posts in feed.
   - `app/(app)/discover.tsx` — global recent feed.
   - `app/(app)/post/[id].tsx` — full post with comment composer at bottom.
   - **`PostCard` component** in `components/PostCard.tsx` shared by feeds.
7. **Tab bar** update: Home · Discover · New Post (center, opens modal) · Profile.

**Exit criteria**: Phone A posts a photo. Phone B (separate user) sees it in Discover within seconds. B likes and comments. A reopens the post and sees both. Delete-post from A removes from both phones.

---

## Milestone 3 — Social graph (4–5 days)

Turns the discover-only experience into a follow-graph experience.

1. **Migration** `supabase/migrations/<ts>_follows.sql`: `follows` table with composite PK `(follower_id, followee_id)` and `check (follower_id <> followee_id)`. RLS: insert/delete only where `follower_id = auth.uid()`. Public read.
2. **`npm run types:gen`** + commit.
3. **Hooks**: `useFollow(userId)`, `useFollowers(userId)`, `useFollowing(userId)`.
4. **Update `useFeed('home')`**: join through follows; if user follows nobody, return empty list (UI handles empty state).
5. **Screens**:
   - `app/(app)/u/[username].tsx` — other user's profile. Same layout as self-profile but with Follow/Unfollow button instead of Edit.
   - Follower/Following list modals.
   - Username search at top of Discover (debounced query against `profiles.username ILIKE '<q>%'`).
6. **Profile counts** become real (M1 placeholders go away).

**Exit criteria**: B follows A. A's posts appear in B's home feed. B unfollows; posts disappear from home feed but remain in Discover.

---

## Milestone 4 — Safety + polish + store-ready (1 week)

App Store and Play Store submission requirements + final polish.

1. **Migration** `supabase/migrations/<ts>_blocks_and_reports.sql`:
   - `blocks` (composite PK).
   - `reports` (id, reporter, target_type ∈ {'post','user','comment'}, target_id, reason, status default 'open').
   - SQL function `public.is_blocked(viewer uuid, target uuid) returns bool security definer` — used in `posts`/`comments`/`profiles` SELECT policies to hide content where viewer is blocked by target OR target is blocked by viewer.
   - **Refresh** existing policies on posts, comments, profiles to apply the block filter.
2. **`npm run types:gen`** + commit.
3. **Hooks**: `useBlock`, `useUnblock`, `useBlockedUsers`, `useReport`.
4. **Screens**:
   - `app/(app)/blocked-users.tsx` — list with unblock action.
   - Report modal — opened from a `BottomSheet` triggered by a `...` button on `PostCard` and the other-user profile.
5. **Account deletion** — invoke a Supabase RPC `delete_account()` (server-side function deletes the auth user; trigger cascades to profiles → posts/gear/etc).
6. **Polish pass**:
   - Replace placeholder splash + icon assets.
   - Verify deep link config in `app.json` (scheme already `chordial`).
   - Privacy policy + ToS hosted somewhere (GitHub Pages or marketing site); link from Settings.
   - All buttons/inputs have `accessibilityLabel`.
   - Loading skeletons on every feed and profile screen.
7. **Production builds**:
   - `eas build --profile production --platform all`.
   - App Store Connect + Play Console listings, screenshots (use a TestFlight build to capture).
   - Submit for review.

**Exit criteria**: B blocks A. A's posts disappear from B's feeds and search. B can unblock from Settings → Blocked Users. Reporting a post writes a row to `reports`. App-Store-Connect upload succeeds with no warnings.

---

## Milestone 5 — Beta + launch (rolling, 1+ week)

1. Internal TestFlight, 5–10 testers.
2. Fix top 5 reported bugs.
3. Public TestFlight (optional), then submit for App Store review.
4. Same flow on Play Console (closed test → open test → production).
5. On launch: monitor Sentry/crash logs daily for a week, then weekly.

---

## Cross-cutting tasks (slotted into the milestone they fit)

- **Sentry (or alternative crash reporting)** — add in M0 if possible, otherwise M4. Won't ship without it.
- **Analytics** — defer. Don't instrument until product shape is stable.
- **CI** — minimal GitHub Action that runs `npm run lint` on PR. M0 if time, otherwise M2.

---

## Reuse map — do not reinvent

| Need | Use this | Location |
|---|---|---|
| Supabase client | `supabase` | `lib/supabase.ts` |
| Auth state | `useAuth()` | `hooks/useAuth.ts` |
| Auth methods (`signIn` / `signUp` / `signOut`) | `useAuth()` return value | `providers/auth-provider.tsx` |
| Form validation pattern | `safeParse` + `issues[0].message` | `validators/auth.ts`, `app/(auth)/sign-in.tsx` |
| Route group guard pattern | Redirect inside `_layout.tsx` based on `session` | `app/(app)/_layout.tsx`, `app/(auth)/_layout.tsx` |
| Migration shape (RLS + triggers) | Copy verbatim | `supabase/migrations/20260511000000_profiles.sql` |
| Path alias | `@/...` | `tsconfig.json` |
| Type generation | `npm run types:gen` | `package.json` |

---

## What success looks like at the end

- `eas build --profile production --platform all` succeeds.
- Two phones, two accounts, full demo loop in under 60s: sign up → onboard → post → follow → like/comment → block/report → delete account.
- App Store + Play Store listings live, awaiting / approved for review.
- `PRD.md` and `PLAN.md` updated to reflect anything that drifted during the build.
