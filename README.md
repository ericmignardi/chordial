# 🎸 chordial

The premier social network for guitar players to showcase their gear, share their sound, and connect with the community.

---

## Features

- **Social Feed**: A curated stream of posts from the community, optimized with offline persistence for seamless browsing.
- **Gear "Rig" Management**: Manage and showcase your personal collection of guitars, amps, and pedals.
- **Community Engagement**: Interact with other players through likes, comments, and follows.
- **Advanced Privacy**: Robust user blocking and reporting systems integrated at the database layer (RLS).
- **Offline-First Experience**: Intelligent caching via React Query and AsyncStorage ensures your feed is always available.

## Tech Stack

- **Expo & React Native**: High-performance cross-platform mobile development with Expo SDK 54 and React 19.
- **Supabase**: Enterprise-grade backend-as-a-service providing Authentication, PostgreSQL database, and S3-compatible Storage.
- **React Query**: Sophisticated server-state management with automatic persistence and optimistic updates.
- **NativeWind (Tailwind CSS)**: Utility-first styling for a polished "Editorial Classic" design system.
- **Zod & React Hook Form**: Type-safe schema validation and robust form management.

---

## Installation & Setup

**Prerequisites:**

- Node.js 18+
- [Supabase](https://supabase.com/) Account & Project
- [Expo Go](https://expo.dev/go) or an Emulator/Simulator

```bash
# Clone the repository
git clone https://github.com/yourusername/chordial.git
cd chordial

# Install dependencies
npm install

# Setup environment variables
# Create a .env.local file with the following:
# EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
# EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# Generate Supabase types
npm run types:gen
```

## Usage

**Start Development Server:**

```bash
npm start
```

**Run on iOS/Android:**

```bash
npm run ios
# or
npm run android
```

**Lint Codebase:**

```bash
npm run lint
```

**Run Tests:**

```bash
npm test
```

The test suite uses Vitest for focused unit/integration coverage of the Zod validators and React Query cache behavior. For the end-to-end product smoke pass, see [docs/manual-qa.md](docs/manual-qa.md).

---

## Things Learned

Throughout the development of chordial, several advanced mobile and backend concepts were explored:

- **Row Level Security (RLS)**: Implementing complex relational security policies to enforce user privacy and block lists at the database layer.
- **Infinite Scroll & Persistence**: Mastering `useInfiniteQuery` with AsyncStorage to build a high-performance, offline-ready social feed.
- **New Architecture & React Compiler**: Leveraging the latest React Native 0.81 features and the React Compiler for optimal rendering performance.
- **File-Based Routing**: Utilizing Expo Router for a web-like navigation experience in a native mobile environment.
- **Design System Consistency**: Orchestrating a custom design system ("Editorial Classic") using NativeWind and custom font families.
