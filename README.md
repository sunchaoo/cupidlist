# 💘 CupidList

Be the matchmaker for your single friends. CupidList lets you organize your
contacts, tag the single ones, and generate a friendly, shareable introduction
in a couple of taps.

> **MVP note:** This first iteration is fully self-contained — all data is saved
> in your browser's **Local Storage**, so you can run and test it instantly with
> no backend or accounts. The data layer is abstracted (`src/lib/storage.ts`) so
> a real backend (e.g. Supabase) can drop in later without touching the UI.

## ✨ Features

- **All Friends** — a dashboard of every contact. Add friends manually
  (name, platform source, Instagram handle, "is single?" toggle) or click
  **Import sample** to populate a realistic test crew.
- **Single Pool** — a filtered view of only the friends you've marked single.
- **Matchmaker tool** — pick a single friend, choose a compatible person to
  introduce them to, and get a pre-written **shareable match card** with
  **Copy to clipboard** plus **WhatsApp / Instagram DM** deep links.
- **Match History** — a log of every introduction you've made.
- Warm, mobile-first design (Tinder-meets-Notion) with a sidebar on desktop and
  a bottom tab bar on mobile.

## 🧱 Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **lucide-react** for icons
- **Local Storage** data layer (swappable for Supabase)

## 🚀 Run it locally

You'll need **Node.js 18.18+** (Node 20+ recommended).

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open the app
#    Visit http://localhost:3000
```

That's it. On first load, click **Import sample** on the All Friends page to get
8 demo friends, then try marking people single and matchmaking them.

### Other commands

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # run ESLint
```

## 📁 Project structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: fonts, provider, app shell
│   ├── page.tsx            # View 1 — All Friends dashboard
│   ├── single/page.tsx     # View 2 — Single Pool
│   └── matches/page.tsx    # View 3 — Match History
├── components/
│   ├── AppShell.tsx        # Sidebar + mobile bottom nav
│   ├── AddFriendModal.tsx  # Add-friend form
│   ├── MatchmakeModal.tsx  # Matchmaker tool + shareable card
│   ├── FriendCard.tsx
│   ├── PlatformIcon.tsx
│   ├── Avatar.tsx
│   ├── Modal.tsx
│   ├── EmptyState.tsx
│   └── PageHeader.tsx
├── context/
│   └── FriendsContext.tsx  # App state, wired to the data store
└── lib/
    ├── types.ts            # Domain types (backend-agnostic)
    ├── mockData.ts         # Sample friends for "Import sample"
    ├── match.ts            # Match message + compatibility helpers
    └── storage.ts          # DataStore interface + Local Storage impl
```

## 🔌 Swapping in a real backend (Supabase)

The whole app talks to the `DataStore` interface in `src/lib/storage.ts` — it
never touches Local Storage directly. To go live:

1. Create `friends` and `matches` tables in Supabase mirroring `src/lib/types.ts`.
2. Implement `SupabaseStore implements DataStore` (a sketch is included in the
   file).
3. Return it from `getStore()`.

Because `FriendsContext` already `await`s every store call, no component changes
are needed.
