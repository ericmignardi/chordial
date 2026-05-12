# Chordial — Product Requirements Document

> Living document. Updated as scope changes. Last edit: 2026-05-12.

## 1. Vision

Chordial is the social network for guitar players. Players show off their instruments, build a structured collection of the gear they own, and follow other players. It is differentiated from generic photo-sharing apps by the **"My Rig"** primitive — every user maintains a structured list of guitars/basses/amps/pedals on their profile, turning every account into a piece of community-readable gear inventory.

Why now: existing photo apps treat a guitar as just another photo subject. Forums (Reddit, TalkBass, TGP) are text-first and unfriendly on mobile. There is room for a mobile-first, image-first, gear-centric community.

## 2. Target users

Three personas drive MVP scope. The MVP must serve all three on day one.

- **The hobbyist collector** — owns 3–10 guitars, modifies/swaps frequently, wants to show off the collection and browse other people's. High-frequency lurker, moderate poster.
- **The intermediate player** — practices weekly, is on a gear-acquisition journey, looking for inspiration and a sense of community. Highest engagement potential.
- **The aspiring pro / content creator** — uses Chordial to build a small audience around their playing. Drives content into the network.

**Explicitly not the target for v1**: pro touring musicians needing a portfolio site, teachers selling courses, retailers/luthiers running a storefront. Their needs are real but pull scope in incompatible directions.

## 3. MVP feature list

| Feature | MVP | Notes |
|---|---|---|
| Email/password auth | ✅ | Already shipped |
| Profile (avatar, username, display name, bio, location) | ✅ | Username UNIQUE, claimed in onboarding |
| "My Rig" gear collection on profile | ✅ | The differentiator — guitars/basses/amps/pedals/other, brand/model/year/notes |
| Photo + caption posts | ✅ | Single image, caption ≤ 500 chars |
| Likes | ✅ | One per user per post, optimistic UI |
| Comments | ✅ | Flat (no threading), 500 char cap |
| Follow / unfollow | ✅ | Asymmetric, no requests/approvals |
| Home feed (followed users) | ✅ | Reverse-chronological, infinite scroll |
| Discover feed (global) | ✅ | Recent posts, cold-start defense |
| Other-user profile screen | ✅ | Username-routed (`/u/[username]`) |
| Onboarding (3 slides + username/avatar pick) | ✅ | First-run only |
| Splash screen | ✅ | Already wired via `expo-splash-screen` |
| Settings (sign out, edit profile, delete account, blocked users) | ✅ | Delete-account is an App Store requirement |
| **Block + Report content/user** | ✅ | **App Store requirement for UGC apps — non-negotiable** |
| Push notifications | ❌ | v1.1 — needs entitlements in first build but no in-app UI |
| Audio clips on posts | ❌ | v2 — biggest scope add |
| Chord / tab snippets in posts | ❌ | v2 |
| Direct messaging | ❌ | v2 |
| Search (anything beyond username) | ❌ | v1.1 |
| Tuner / metronome | ❌ | Out of scope — distracts from the social loop |

## 4. User stories

### Onboarding
- As a new user, I can sign up with email/password so I can start using the app.
- As a new user, I see 3 intro slides explaining Chordial so I understand what the app is.
- As a new user, I claim a username and (optionally) upload an avatar before reaching the main app.

### Posting
- As a signed-in user, I can pick a photo from my library or camera and add a caption to publish a post.
- As an author, I can delete my own post.

### Feed
- As a signed-in user, I see a home feed of recent posts from people I follow.
- As a signed-in user, I see a discover feed of recent posts globally so the app is useful before I follow anyone.
- As a user, I can pull-to-refresh and scroll to load more.

### Profile & Rig
- As a user, I can view my own profile and edit my bio/avatar/location.
- As a user, I can add a piece of gear (brand, model, year, kind, notes) to "My Rig".
- As a user, I can edit or delete any of my gear items.
- As a user, I can view another user's profile and Rig.

### Social
- As a user, I can like and unlike a post.
- As a user, I can comment on a post.
- As a user, I can follow and unfollow another user.
- As a user, I can see my follower / following counts on my profile.

### Safety / Settings
- As a user, I can sign out from settings.
- As a user, I can delete my account, which removes my posts, comments, likes, and gear.
- As a user, I can block another user; once blocked, their content disappears from all my feeds and they cannot see mine.
- As a user, I can report a post or user with a reason; reports are queued for out-of-band review.

## 5. Screen inventory

- **Auth stack** (`app/(auth)/`): `sign-in`, `sign-up`, `forgot-password`, `onboarding`
- **Tabs** (`app/(app)/_layout.tsx`): Home · Discover · New Post (center FAB) · Profile (self)
- **Stack screens inside `(app)`**: `post/[id]`, `u/[username]`, `edit-profile`, `gear/[id]` (add/edit modal), `settings`, `blocked-users`, `report`

## 6. Non-functional requirements

- **Platforms**: iOS 16+, Android 8+ (Expo SDK 54 defaults). New Architecture enabled.
- **Performance**: p75 home-feed first paint < 1.5s on Wi-Fi. Image lists must use `FlashList`, not `FlatList`.
- **Security**: All UGC tables have Row-Level Security enabled. No client ever calls service-role keys. Storage uploads use authenticated paths scoped by `auth.uid()`.
- **Offline**: Last home feed is served from React Query cache when offline; new actions queue and surface a toast on failure.
- **Accessibility**: Every interactive element has `accessibilityLabel`. Color contrast meets WCAG AA.
- **Quality**: Crash-free sessions > 99.5% target. `npm run lint` clean on every commit.

## 7. Success metrics (lightweight, post-launch)

- D1 retention (signed in next day)
- Posts per WAU
- Follows per new user within first 7 days
- Time-to-first-post (signup → first post)

We are not setting hard numbers pre-launch; collect for 4 weeks then set goals.

## 8. v1.1+ backlog (not MVP, but tracked)

In priority order, with rough effort estimates:

1. **Gear-tagged posts** — tag a post with the Rig item it features. Turns every post into structured data. (~3 days once Rig exists.)
2. **Push notifications** — likes, comments, follows. (~1 week.)
3. **Username search & hashtags**. (~3 days.)
4. **"Wishlist" Rig section** — separates owned vs. wanted gear.
5. **Streaks** — days-posted-in-a-row, lightweight retention mechanic.
6. **"Chord of the day"** prompt — solves the blank-canvas problem.
7. **Audio clips** — 30–60s recording attached to a post. Biggest scope, save for v2.
8. **Direct messaging** — v2.
9. **NFC / AirDrop "rig card"** — IRL gimmick, share rig via deep link.

## 9. Open questions

- Monetization model — ads, subscription (extra Rig slots, themes), or none?
- Moderation tier — manual review only, or add automated NSFW detection?
- Web companion (read-only links for sharing posts/profiles outside the app)?
- Internationalization — English-only at launch; revisit at 10K MAU.
