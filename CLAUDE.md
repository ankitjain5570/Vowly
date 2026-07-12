# Vowly — Wedding Invitation Template · AI / Developer Guide

This file is the single source of truth for **how the project works** and **how to
re-skin it for a new couple**. An AI model (or developer) should be able to fully
customize a fresh copy of this template using only this document plus the
customer's answers to `CUSTOMER-INTAKE.md`.

> **Golden rule:** almost all customer-specific content lives in **one file**,
> [`src/wedding.config.ts`](src/wedding.config.ts). Editing that file + swapping
> the media assets in `public/media/` (and the `Photobook/` folder) re-skins the
> entire site. Components never hardcode couple details — they read from config.

---

## 1. Tech stack & how to run

- **React 19 + TypeScript + Vite** (build tool / dev server)
- **Tailwind CSS v4** (via the `@tailwindcss/vite` plugin; theme tokens in `src/index.css`)
- **Framer Motion** for all animation
- **No router library.** Routing is decided in `src/main.tsx` by inspecting `window.location.pathname` (see §4).
- Fonts: **Cormorant Garamond** (headings) + **Jost** (body), loaded from Google Fonts in `index.html`.

```bash
npm install        # once
npm run dev        # local dev server (prints a localhost URL)
npm run build      # type-check (tsc) + production build to dist/
npm run preview    # serve the production build locally
```

Deploy target: **Netlify** (static SPA). `public/_redirects` contains an SPA
fallback (`/*  /index.html  200`) so client-side routes like `/admin` and
`/i/<code>` resolve. Do not remove it.

---

## 2. Repository map

```
src/
  main.tsx                 # entry point; branches: /admin → AdminApp, else → guest App
  App.tsx                  # guest app: entry book → carousel; background music control
  index.css                # Tailwind import + theme tokens + shared CSS (gold-foil, vignette, mobile rules)
  wedding.config.ts        # ⭐ ALL couple content lives here (the file you edit most)
  invite.ts                # resolveInvite(): URL → which sections a guest sees; link builder + section codes

  components/
    EntryScreen.tsx        # opening "invitation book" (tap to open) + Ganesha idol
    Carousel.tsx           # full-screen auto-advancing slide carousel + nav + book page-turn transition
    NavDots.tsx            # right-side slide dots (desktop)
    EngagementSection.tsx  # engagement slide (uses the ring-exchange animation)
    RingExchange.tsx       # pure-SVG animated ring exchange
    FunctionSection.tsx    # ⭐ reusable slide for EVERY function (haldi/mehendi/cocktail/wedding/reception)
    StorySection.tsx       # "Our Story" timeline (horizontal on desktop, vertical on mobile)
    PhotobookSection.tsx   # digital photobook (auto-loads images from /Photobook)
    GuestInfoSection.tsx   # "Good to Know": FAQs + hotels + contacts
    GuestbookSection.tsx   # "Leave Us a Message" (word-limited, sends via WhatsApp)
    RSVPSection.tsx        # RSVP slide (final) + opens RSVPModal
    RSVPModal.tsx          # RSVP form: accept (per-guest, per-function) OR decline (+note)
    decorations.tsx        # ambient animated scenes, one per function vibe (marigolds, henna, lanterns, fairy lights, fireworks, roses)
    royal.tsx              # shared ornaments: palace silhouette, god rays, gold dust, arch panel, diyas, gold-foil letter reveal
    Countdown.tsx          # live countdown (wedding hero)
    Footer.tsx             # ⚠ legacy, currently UNUSED (sign-off now lives in RSVPSection)

  admin/                   # the /admin console (see §6)
    AdminApp.tsx           # login gate + top nav + view switch
    AdminLogin.tsx         # placeholder login form
    auth.ts                # ⚠ placeholder credentials (replace with Supabase Auth)
    Overview.tsx           # KPI tiles + per-celebration headcount + latest RSVPs
    Dashboard.tsx          # RSVP data: List tab + Kanban Board tab + filters
    RsvpTable.tsx          # list view
    RsvpBoard.tsx          # kanban view (drag/tap to move between statuses)
    rsvpData.ts            # ⚠ DUMMY RSVP data (replace getRsvps() with Supabase)
    inviteLinks.ts         # saved custom links (localStorage; replace with Supabase)
    InviteBuilder.tsx      # UI to compose custom section-limited invite links
    ui.tsx                 # shared admin bits: status palette, badges, chips

  hooks/
    useTilt.ts             # parallax (3D tilt): mouse on desktop, gyroscope on phones
    useActiveSection.ts    # (legacy scroll helper; carousel drives active slide now)
  theme/patterns.tsx       # SVG background patterns (mandala/paisley/floral/jaali/marigold)
  utils/calendar.ts        # generates .ics files for "Add to Calendar"

public/
  _redirects               # Netlify SPA fallback (keep!)
  media/                   # ⭐ all served media (see §5)

Photobook/                 # ⭐ drop photobook images here (auto-loaded at build time)
Couple Avatars/, Couple Photos/, Audio File/, Sample Videos/, God Idol/
                           # raw source assets from the customer (git-ignored; NOT served directly)
```

---

## 3. Guest experience flow

1. **Entry book** (`EntryScreen.tsx`): a closed royal "book" with a Ganesha idol
   on top and the couple monogram (auto-derived from the couple's first initials).
   Tapping it swings the cover open; after a beat on the inner page the whole
   entry screen dissolves (slow fade + gentle scale, via AnimatePresence in
   `App.tsx`) into the first slide, whose own entrance animations play
   underneath. The book is larger on desktop (`lg:` sizes). This screen is
   common to every invite variant. **It shows on every page load/refresh**
   (no "already visited" shortcut).
2. **Carousel** (`Carousel.tsx`): full-screen slides that **auto-advance every 15s**
   (`SLIDE_MS` constant) with pause/prev/next controls, right-side nav dots
   (desktop), pagination dots + swipe (mobile), and a persistent "RSVP" button.
   Slide-to-slide uses **varied cinematic transitions** — each slide is
   assigned one of four flavors by position (`drift` dissolve, `rise` lift,
   `bloom` through-zoom, `aperture` frame-reveal, cycling), so consecutive
   pages never transition the same way (see `FLAVORS` in `Carousel.tsx`).
3. **Slide order** = the guest's function slides (chronological, from config) →
   the enabled "extra" slides (Our Story, Photobook, Good to Know, Wishes) →
   **RSVP** (always last). Which of these appear is decided by `resolveInvite()` (§4).

Background music: managed in `App.tsx`. **On by default** from the first
visit; autoplay is browser-gated, so actual playback begins on the guest's
first interaction (normally the opening tap). A floating mute button
toggles it — and it is the ONLY thing allowed to change the music intent;
never add code that force-enables music (it would override a guest's mute).
Music pauses whenever
the tab/app goes to the background and resumes on return (unless muted). The
carousel's auto-advance also freezes while the tab is hidden.

---

## 4. Invite links — who sees which sections (`src/invite.ts`)

`resolveInvite()` turns the opened URL into a `ResolvedInvite` = `{ functions, extras }`.
The carousel, nav, and RSVP form all consume it, so limiting sections is automatic.

Supported URL forms:

| URL | Result |
|-----|--------|
| `/` | Full invitation (everything) |
| `/i/<code-code-code>` | **Custom link** built in the admin console. Section ids are encoded as **opaque codes** so guests can't read or tamper with their invite. |
| `/?invite=<slug>` | Named preset from `weddingConfig.invites` |
| `/?events=haldi,wedding&extras=story,info` | Ad-hoc combination (plain ids) |

**Opaque codes:** each section id (`engagement`, `haldi`, …, plus extras
`story`/`photobook`/`info`/`wishes`) maps to a stable 5-char code via `codeFor()`
using `CODE_SALT` (currently `'vowly-2026'`). Changing `CODE_SALT` rotates every
code and invalidates old custom links. `buildInvitePath()` / `buildInviteUrl()`
generate links; the admin **Invite Builder** uses them.

Unknown/garbage links **fail open to the full invitation** (never a broken page).
This is obfuscation, not security — the full invite is still public at `/`.

---

## 5. Media assets — exact paths & conventions

All **served** media lives in `public/media/` and is referenced from config by
site-root-relative path (e.g. `/media/photos/couple-main.jpeg`). Filenames matter —
keep them or update the config paths to match.

| Purpose | File path (in `public/media/`) | Referenced by |
|---|---|---|
| Couple hero photo | `photos/couple-main.jpeg` | `couplePhoto` |
| Engagement photos (polaroids) | `photos/engagement-1.jpeg` … `-3.jpeg` | engagement `photos[]` |
| Our Story chapter photos | `photos/story-1.jpeg` … `-3.jpeg` | `loveStory.chapters[].photo` |
| Per-function couple avatars | `avatars/<functionId>.jpg` (`engagement.jpg`, `haldi.jpg`, `mehendi.jpg`, `cocktail.jpg`, `wedding.jpg`, `reception.jpg`) | function `avatar` |
| Entry video (optional) | `entry-video.mp4` | `entryVideo` (currently the book entry is used; video code is commented out in `EntryScreen.tsx`) |
| Background music | `wedding-music.m4a` (or `.mp3`) | `music` |
| Ganesha idol | `ganesha.png` (transparent PNG) | hardcoded in `EntryScreen.tsx` |

**Photobook images:** drop any `.jpg/.jpeg/.png/.webp` into the **root `Photobook/`
folder** (NOT `public/`). They are auto-bundled via `import.meta.glob` in
`PhotobookSection.tsx`, ordered by filename. After adding files, **restart the dev
server** (the folder is excluded from live file-watching in `vite.config.ts`).

Raw customer uploads (unprocessed) can live in `Couple Avatars/`, `Couple Photos/`,
`Audio File/`, `Sample Videos/`, `God Idol/` — these are **git-ignored** working
folders. Process/rename them into `public/media/` (and `Photobook/`) as above.
When resizing images, ~900px wide JPEG at ~85% quality is a good target for phones.

---

## 6. Admin console (`/admin`)

- Reached only at the `/admin` path; guests never see it. Gated by
  `AdminLogin.tsx` using **placeholder** credentials in `src/admin/auth.ts`
  (`DEMO_USER` / `DEMO_PASSWORD`, currently `admin` / `vowly2026`).
  ⚠ This is client-side only — **not real security**. Replace with Supabase Auth
  before real guest data is stored.
- **Overview**: KPI stat tiles, per-celebration expected headcount, latest RSVPs.
- **Dashboard**: RSVP records in a **List** tab (sortable/searchable table) and a
  **Board** tab (Kanban: Pending / Confirmed / Declined, drag or tap to move).
- **Invites**: the Invite Builder — toggle functions + extra sections, generate a
  copyable opaque `/i/<code>` link, preview it, and save it (localStorage).

**Data is DUMMY.** `src/admin/rsvpData.ts` `getRsvps()` returns hardcoded sample
RSVPs (shape = `RsvpRecord`). To go live, replace that function body with a
Supabase query and replace `login()` in `auth.ts` with `supabase.auth`. The RSVP
form payload in `RSVPModal.tsx` already carries `attending: true/false` (+ decline
`note`), which map to the dashboard's `confirmed`/`declined` statuses and `message`.

---

## 7. Theming & animation knobs

Each function has a `theme` with: `primary` (bright motif color), `accent` (gold),
`bgFrom`/`bgTo` (deep radial background gradient edge→center), `backgroundPattern`
(`mandala|paisley|floral|jaali|marigold`), and `decoration`
(`marigold-petals|henna-vine|gold-particles|starlit-night|fireworks|rose-petals|none`).
Each function should use a distinct decoration so no two slides feel alike:
engagement=rose-petals, haldi=marigold-petals, mehendi=henna-vine,
cocktail=starlit-night, wedding=gold-particles, reception=fireworks.
Story/Photobook/Guestbook/
GuestInfo each have a smaller `{accent,bgFrom,bgTo}` theme.

Desktop layout per function is set by `layout`:
`panel-right` (default), `panel-left` (mirrored), or `centered`. Mix these across
consecutive functions so slides don't look identical. `hero: true` marks the
grandest slide (larger type, countdown, diyas) — normally the Wedding.

Global palette tokens (royal maroon/gold/ivory) + fonts live in `src/index.css`
under `@theme`. Carousel timing = `SLIDE_MS` in `Carousel.tsx`.

---

## 8. ⭐ Customization playbook (read customer answers → change these)

When a customer returns a filled `CUSTOMER-INTAKE.md`, do the following. **Almost
everything is in `src/wedding.config.ts`.** After edits, run `npm run build` to
confirm it compiles, then (if asked) commit & push.

**A. Couple & global**
- Names → `couple.bride`, `couple.groom` (first names; the entry monogram derives
  initials automatically).
- `tagline`, `hashtag`, `footer.message`, `footer.familyLine`.

**B. Events / functions** — the `functions[]` array. For each event the customer is
having, create/keep an entry with a unique `id` (lowercase, no spaces) and set:
`name`, `date` (human text), `time` (human text), `startISO`/`endISO` (real
ISO-8601 with timezone — drives the countdown + calendar file), `venueName`,
`venueAddress`, `mapsUrl` (a Google Maps search/place URL), `dressCode`,
`description`, optional `story` (engagement), optional `photos[]`, `avatar`,
`layout`, `hero`, and a `theme`.
- **Add an event:** copy an existing block, give it a new `id`, adjust everything.
  Order the array chronologically. No component changes needed — everything is
  config-driven. (Add a matching avatar image if you have one.)
- **Remove an event:** delete its block (and any `invites`/link references to its id).

**C. Our Story** → `loveStory` (`eyebrow`, `title`, `chapters[]` with
`label`/`title`/`text`/optional `photo`). Any number of chapters.

**D. Good to Know** → `guestInfo` (`faqs[]`, `hotels[]`, `contacts[]`). Contact
`phone` = country code + number, digits only (used for tel:/WhatsApp).

**E. Photobook** → text in `photobook`; **images go in the root `Photobook/` folder**
(see §5), not config.

**F. Guestbook** → `guestbook` (`prompt`, `maxWords`).

**G. RSVP** → `rsvp.title`, `rsvp.message`. `rsvp.whatsappNumber` (country code +
number, digits only) is used by the Guestbook's WhatsApp send. (The RSVP *form*
itself is `RSVPModal.tsx`; it currently logs/stores locally — real submission
needs the Supabase step in §6.)

**H. Media** → replace files in `public/media/**` following §5's exact names, or
update the config paths to match new names. Music can be `.mp3` or `.m4a` — set
`music` accordingly.

**I. Named presets (optional)** → `invites[]` for `/?invite=<slug>` links. Most
custom links will instead be generated in the admin **Invite Builder** (opaque
`/i/<code>` links), which needs no config edit.

**J. Admin credentials** → `src/admin/auth.ts` (until Supabase).

**K. Colors/vibe** → per-function `theme` blocks + global tokens in `src/index.css`.

**Do NOT** hardcode names/dates in components — always route content through
`wedding.config.ts`. If a needed field doesn't exist, add it to the config
interface + object and read it in the relevant component.

---

## 9. Deploy checklist

1. `npm run build` passes (no TS errors).
2. Assets present in `public/media/**` and `Photobook/`.
3. `public/_redirects` present (for `/admin` and `/i/...`).
4. Push to the connected Git repo → Netlify auto-builds.
5. Smoke test on the deploy: `/` (full), `/admin` (login), and a built `/i/<code>`
   link (only selected sections show).
