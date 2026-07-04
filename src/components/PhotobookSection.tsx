import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { weddingConfig } from '../wedding.config'
import { GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

/**
 * Every image dropped into src/photobook/ becomes a page automatically —
 * Vite bundles whatever matches the glob at build time, ordered by filename.
 */
const PHOTOS = Object.entries(
  import.meta.glob('../photobook/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url as string)

const PAGE_MS = 5000

/**
 * Digital photobook slide: an open album spread (two pages on desktop, one
 * on mobile) with 3D page-turn transitions, auto-flipping while the slide
 * is on screen, plus manual page arrows.
 */
export function PhotobookSection() {
  const { photobook, couple } = weddingConfig
  const { theme } = photobook

  // pages per spread: index steps by 2 (desktop shows i and i+1)
  const [spread, setSpread] = useState(0)
  const [dir, setDir] = useState(1)
  const spreadCount = Math.max(1, Math.ceil(PHOTOS.length / 2))

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

  const left = PHOTOS[spread * 2]
  const right = PHOTOS[spread * 2 + 1]

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

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-12 text-center sm:px-8">
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

        {/* The open book */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 14 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-fit"
          style={{ perspective: 1600 }}
        >
          <div
            className="relative flex rounded-lg border p-2 sm:p-3"
            style={{
              borderColor: `${theme.accent}70`,
              background: 'linear-gradient(160deg, #2A1708, #150B03)',
              boxShadow: `0 40px 90px -30px #000d, 0 0 50px -20px ${theme.accent}55`,
            }}
          >
            {/* spine */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-2 bottom-2 z-20 hidden w-px -translate-x-1/2 sm:block"
              style={{ background: `linear-gradient(to bottom, transparent, ${theme.accent}88, transparent)` }}
            />

            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={spread}
                custom={dir}
                initial={{ rotateY: dir > 0 ? 55 : -55, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: dir > 0 ? -55 : 55, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-2 sm:gap-3"
                style={{ transformOrigin: 'center center' }}
              >
                {/* left page (always) */}
                <figure className="bg-[#FBF3E4] p-2 pb-5 shadow-inner sm:p-2.5 sm:pb-6">
                  {left && (
                    <img
                      src={left}
                      alt={`Photobook page ${spread * 2 + 1}`}
                      className="h-56 w-40 object-cover sm:h-80 sm:w-60"
                      loading="lazy"
                    />
                  )}
                  <figcaption className="mt-1.5 font-heading text-xs italic text-[#8A6A3B]">
                    {couple.bride} &amp; {couple.groom}
                  </figcaption>
                </figure>
                {/* right page (desktop) */}
                {right && (
                  <figure className="hidden bg-[#FBF3E4] p-2 pb-5 shadow-inner sm:block sm:p-2.5 sm:pb-6">
                    <img
                      src={right}
                      alt={`Photobook page ${spread * 2 + 2}`}
                      className="h-56 w-40 object-cover sm:h-80 sm:w-60"
                      loading="lazy"
                    />
                    <figcaption className="mt-1.5 font-heading text-xs italic text-[#8A6A3B]">
                      {photobook.title}
                    </figcaption>
                  </figure>
                )}
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
      </div>
    </section>
  )
}
