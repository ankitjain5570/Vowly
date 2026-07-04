# Digital Photobook

Drop any `.jpg`, `.jpeg`, `.png` or `.webp` images into this folder and they
automatically appear as pages in the Photobook slide — no code changes needed.

- Pages are ordered by filename.
- Landscape and portrait both work; images are letterboxed into the page frame.
- After adding photos, restart the dev server (`npm run dev`) — this folder is
  excluded from live file-watching to avoid Windows file-lock crashes.
- Titles/captions for the slide itself are edited in `src/wedding.config.ts`
  under `photobook`.
