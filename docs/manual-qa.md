# Manual QA Checklist

Use this as the lightweight regression pass before a portfolio demo, TestFlight build, or pull request. It is intentionally short enough to run on two devices or one device plus one simulator.

## Setup

- Run `npm run lint` and `npm test`.
- Start Expo with `npm start`.
- Use two test accounts: Account A creates content, Account B discovers and interacts with it.
- Confirm both accounts can sign out and back in before starting the full pass.

## Full Demo Loop

- Sign up as Account A and complete onboarding with username, display name, and optional avatar.
- Add one guitar, amp, or pedal to Account A's Rig.
- Create a post with an image and caption from Account A.
- Sign in as Account B and verify Account A's post appears in Discover.
- From Account B, open Account A's profile and follow Account A.
- Verify Account A's post appears in Account B's Home feed after refresh.
- Like and comment on Account A's post from Account B.
- Return to Account A and verify the like count and comment are visible on the post detail screen.
- Unfollow Account A from Account B and verify the post leaves Home but remains in Discover.

## Safety And Account Controls

- From Account B, report Account A's post and confirm a success toast appears.
- From Account B, block Account A and verify Account A's posts/profile disappear from feed/search.
- Open Settings > Blocked users and unblock Account A.
- Delete a throwaway account from Settings and confirm it returns to auth without leaving visible content behind.

## Polish Smoke Test

- Pull-to-refresh Home and Discover.
- Confirm empty states have working calls to action.
- Confirm avatar, post image, and Rig screens still render after killing and reopening the app.
- Confirm all destructive actions require confirmation.
- Confirm Privacy Policy and Terms links open from Settings.
