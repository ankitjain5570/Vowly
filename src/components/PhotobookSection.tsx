import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { weddingConfig } from '../wedding.config'
import { GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

/**
 * Every image dropped into the project's Photobook/ folder becomes part of
 * the album automatically — Vite bundles whatever matches the glob at build
 * time, ordered by filename. (Restart the dev server after adding photos;
 * the folder is excluded from file-watching in vite.config.ts.)
 */
const PHOTOS = Object.entries(
  import.meta.glob('../../Photobook/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url as string)

const PAGE_MS = 6000
// One hero photo + a 2x2 grid of moments per spread.
const PER_SPREAD = 5

/** Cycle through the available photos so collage slots never come up empty. */
function photoAt(i: number): string {
  if (PHOTOS.length === 0) return ''
  return PHOTOS[((i % PHOTOS.length) + PHOTOS.length) % PHOTOS.length]
}

/**
 * Digital photobook slide: a themed album whose spreads are magazine-style
 * collages (a large hero frame beside a grid of moments) with 3D page-turn
 * transitions, auto-flipping while on screen, plus manual page controls.
 * Desktop shows the full open book; mobile shows a compact single-page
 * collage. Photos are read from the project's Photobook/ folder.
 */
export function PhotobookSection() {
  const { photobook, couple } = weddingConfig
  const { theme } = photobook

  const [spread, setSpread] = useState(0)
  const [dir, setDir] = useState(1)
  const spreadCount = Math.max(1, Math.ceil(PHOTOS.length / PER_SPREAD))

  const turn = (d: number) => {
    setDir(d)
    setSpread((s) => (s + d + spreadCount) % spreadCount)
  }

  // auto-flip while mounted (slide is active)
  useEffect(() => {
    const t = setInterval(() => turn(1), PAGE_MS)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadCount])

  // photos for this spread: [hero, ...four moments]
  const base = spread * PER_SPREAD
  const hero = photoAt(base)
  const moments = [photoAt(base + 1), photoAt(base + 2), photoAt(base + 3), photoAt(base + 4)]
  const tilts = ['-2deg', '1.5deg', '2deg', '-1.5deg']

  const heroFrame = (
    <figure
      className="relative bg-[#FBF3E4] p-2.5 pb-7 shadow-inner"
      style={{ boxShadow: 'inset 0 0 22px #0002' }}
    >
      <img
        src={hero}
        alt={`Photobook hero ${spread + 1}`}
        loading="lazy"
        className="h-64 w-48 object-cover sm:h-[28rem] sm:w-80"
      />
      <figcaption className="mt-2 font-heading text-sm italic text-[#8A6A3B]">
        {couple.bride} &amp; {couple.groom}
      </figcaption>
    </figure>
  )

  const momentsFrame = (
    <figure
      className="relative bg-[#FBF3E4] p-2.5 pb-7 shadow-inner"
      style={{ boxShadow: 'inset 0 0 22px #0002' }}
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:h-[28rem] sm:w-80">
        {moments.map((src, i) => (
          <div key={i} className="overflow-hidden bg-white p-1 shadow-sm" style={{ rotate: tilts[i] }}>
            <img
              src={src}
              alt={`Photobook moment ${spread + 1}.${i + 1}`}
              loading="lazy"
              className="h-24 w-full object-cover sm:h-full"
            />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 font-heading text-sm italic text-[#8A6A3B]">
        Moments &amp; memories
      </figcaption>
    </figure>
  )

  return (
    <section
      id="photobook"
      className="invite-section flex items-center justify-center text-royal-ivory"
      style={{
        background: `radial-gradient(ellipse at 50% 26%, ${theme.bgTo} 0%, ${theme.bgFrom} 72%)`,
      }}
    >
      <GodRays color={theme.accent} />
      <PalaceSilhouette windows={theme.accent} />
      <GoldDust />
      <div className="vignette" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-12 text-center sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mb-3 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70 sm:text-xs"
        >
          {photobook.eyebrow}
        </motion.p>
        <h2 className="text-5xl sm:text-6xl">
          <LetterReveal text={photobook.title} delay={0.55} />
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mx-auto my-5 flex max-w-xs items-center gap-3"
        >
          <span className="h-px flex-1 bg-royal-gold/60" />
          <span className="h-2 w-2 rotate-45 bg-royal-gold" />
          <span className="h-px flex-1 bg-royal-gold/60" />
        </motion.div>

        {PHOTOS.length === 0 ? (
          <p className="mt-10 text-sm font-light text-royal-ivory/70">
            Add photos to the <span className="text-royal-gold-light">Photobook/</span> folder to
            fill the album.
          </p>
        ) : (
          <>
            {/* The open album */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 14 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-fit"
              style={{ perspective: 1800 }}
            >
              <div
                className="relative rounded-lg border p-2 sm:p-3"
                style={{
                  borderColor: `${theme.accent}70`,
                  background: 'linear-gradient(160deg, #2A1708, #150B03)',
                  boxShadow: `0 40px 90px -30px #000d, 0 0 50px -20px ${theme.accent}55`,
                }}
              >
                {/* spine (desktop) */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-2 bottom-2 z-20 hidden w-px -translate-x-1/2 sm:block"
                  style={{ background: `linear-gradient(to bottom, transparent, ${theme.accent}88, transparent)` }}
                />

                <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                  <motion.div
                    key={spread}
                    custom={dir}
                    initial={{ rotateY: dir > 0 ? 50 : -50, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: dir > 0 ? -50 : 50, opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: 'center center' }}
                  >
                    {/* desktop: two-page spread */}
                    <div className="hidden gap-3 sm:flex">
                      {heroFrame}
                      {momentsFrame}
                    </div>
                    {/* mobile: stacked single-page collage */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      {heroFrame}
                      {momentsFrame}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* page controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-5 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                onClick={() => turn(-1)}
                aria-label="Previous page"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                style={{ borderColor: `${theme.accent}70`, color: theme.accent }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <span className="text-xs tracking-[0.25em] text-royal-ivory/70">
                {spread + 1} / {spreadCount}
              </span>
              <button
                type="button"
                onClick={() => turn(1)}
                aria-label="Next page"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                style={{ borderColor: `${theme.accent}70`, color: theme.accent }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>

            <p className="mt-3 text-xs font-light text-royal-ivory/60">{photobook.note}</p>
          </>
        )}
      </div>
    </section>
  )
}
