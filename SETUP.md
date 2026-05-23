# Personal site — FX revamp setup

## What changed

- **Background FX system** — every page now mounts a `<SceneBackground />` that layers a video + ASCII animation overlay (ported from king-of-hearts).
- **Admin panel** at `/admin` — manages scenes (video + FX combos) and master settings.
- **Supabase** is the new tiny DB. Two tables: `site_settings` (single row) and `scenes`.
- **Stash uploads** — videos are uploaded straight to Arweave via the existing Aeter/Stash backend.
- **Magic-link auth** for admin, gated by an email allow-list.
- TypeScript added alongside the existing JS pages — both compile.

## One-time setup

### 1. Create the Supabase project

1. https://supabase.com → New project
2. Project Settings → API → copy `URL`, `anon key`, `service_role key`
3. SQL Editor → New query → paste the contents of [`db/schema.sql`](./db/schema.sql) → run
4. Authentication → Providers → make sure Email is on (default)
5. Authentication → URL Configuration → add `http://localhost:3000/api/auth/callback` and your prod URL `https://your-domain/api/auth/callback` to **Redirect URLs**

### 2. Env vars

Copy `.env.example` → `.env.local` (or `.env`) and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=gasolomonc@gmail.com
NEXT_PUBLIC_STASH_SERVER=https://stash-production-47fc.up.railway.app
```

### 3. Vercel deploy

Add the same env vars to the Vercel project. The service-role key must NOT be exposed (no `NEXT_PUBLIC_` prefix) — it stays server-side and is used by `/api/admin/*` and `/api/scenes/public`.

## Architecture map

```
Layout (components/components/layout.js)
  └─ BackgroundMount.tsx
        └─ usePublicConfig() → GET /api/scenes/public
        └─ SceneBackground
              ├─ VideoLayer  (z=0, position:fixed)
              └─ AsciiOverlay (z=1, position:fixed)

Layout content (relative z-10) sits above both layers.
```

```
/admin                 — scene list, public toggles, sort, delete
/admin/scenes/[id]     — full editor with live preview + Stash upload
/admin/settings        — master FX kill switch, default theme, rotation
/admin/login           — magic link sign-in
```

```
GET    /api/scenes/public          — public, returns visible scenes + settings
GET    /api/admin/scenes           — list all (admin-only)
POST   /api/admin/scenes           — create (admin-only)
GET    /api/admin/scenes/[id]      — read one (admin-only)
PATCH  /api/admin/scenes/[id]      — update (admin-only)
DELETE /api/admin/scenes/[id]      — delete (admin-only)
GET    /api/admin/settings         — read settings (admin-only)
PATCH  /api/admin/settings         — update settings (admin-only)
GET    /api/auth/callback          — Supabase magic link landing
```

## Day-to-day

1. Run `npm run dev`
2. Visit `/admin/login`, enter `gasolomonc@gmail.com`
3. Click magic link in email → land on `/admin`
4. Click `+ New scene`, upload a video, pick a preset, tweak sliders, watch the live preview, flip `public` on
5. Visit `/` — scene plays as background. The `FX` button in the top-left toggles it off; arrow cycles to next public scene.

## Notes / caveats

- **Anonymous Stash uploads** are rate-limited to 3 per browser session per the Aeter README. If you upload more than that you'll need to re-open Stash with a fresh session or paste a URL manually into `videoUrl` via Supabase.
- **Arweave is permanent**. Deleting a scene only removes the DB row — the video file itself remains on Arweave forever.
- **Frame-skip**: ASCII anims default to `3` (≈20 fps). Bump to `5–10` if you see CPU heat on mobile.
- **Theme override** on a scene forces light/dark text contrast regardless of user preference — useful when the video is very bright or very dark.
- **Mixed JS/TS**: existing pages stay JS. New code is TS. Both are picked up by Next 15 — no migration churn.
