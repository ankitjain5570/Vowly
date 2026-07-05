import { motion } from 'framer-motion'
import { weddingConfig, type StoryChapter } from '../wedding.config'
import { GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

/** Deterministic pseudo-random in [0,1) so renders are stable across mounts. */
function prand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const HEART_PATH = 'M12 21s-8.5-6.2-8.5-12.2A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.5 2.8C20.5 14.8 12 21 12 21Z'

/** A glowing, gently beating heart used as each timeline stop. */
function HeartNode({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: 'backOut' }}
    >
      <motion.path
        d={HEART_PATH}
        fill={color}
        stroke="#fff8"
        strokeWidth="0.8"
        animate={{ scale: [1, 1.14, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 }}
        style={{ originX: '12px', originY: '13px' }}
      />
    </motion.svg>
  )
}

/** Ambient hearts drifting up and gently swaying — the "love in the air". */
function FloatingHearts() {
  const colors = ['#D98A96', '#E8CF7A', '#C75B6E']
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 11 }).map((_, i) => {
        const size = 10 + prand(i, 3) * 16
        const sway = 16 + prand(i, 5) * 34
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            style={{
              position: 'absolute',
              left: `${prand(i, 1) * 100}%`,
              bottom: -30,
              width: size,
              height: size,
              color: colors[i % colors.length],
            }}
            animate={{
              y: ['0vh', '-108vh'],
              x: [0, sway, -sway * 0.6, 0],
              rotate: [0, i % 2 ? 18 : -18, 0],
              opacity: [0, 0.4, 0.4, 0],
            }}
            transition={{
              duration: 11 + prand(i, 4) * 9,
              delay: prand(i, 2) * 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <path d={HEART_PATH} fill="currentColor" />
          </motion.svg>
        )
      })}
    </div>
  )
}

/** Chapter content — shared by the horizontal (desktop) and vertical layouts. */
function ChapterBody({
  ch,
  accent,
  align,
}: {
  ch: StoryChapter
  accent: string
  align: 'center' | 'left'
}) {
  const centered = align === 'center'
  return (
    <div className={centered ? 'text-center' : 'min-w-0 text-left'}>
      {ch.photo && centered && (
        <img
          src={ch.photo}
          alt={ch.title}
          loading="lazy"
          className="mx-auto mb-2 h-16 w-14 rounded-t-full border-2 object-cover"
          style={{ borderColor: `${accent}90` }}
        />
      )}
      <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
        {ch.label}
      </p>
      <h3 className="mt-0.5 font-heading text-xl leading-tight text-royal-gold-light sm:mt-1 sm:text-2xl">
        {ch.title}
      </h3>
      <p
        className={`mt-1 text-xs font-light leading-relaxed text-royal-ivory/75 sm:text-sm ${
          centered ? 'mx-auto max-w-[15rem] line-clamp-3 lg:line-clamp-4' : 'max-w-md'
        }`}
      >
        {ch.text}
      </p>
    </div>
  )
}

/**
 * "Our Story" slide. Desktop (lg+): a horizontal timeline with the chapters
 * zig-zagging above and below a gold line, a beating heart at every stop.
 * Below lg: a vertical left-rail timeline. Hearts drift up in the background
 * throughout to keep the romance in the air.
 */
export function StorySection() {
  const { loveStory } = weddingConfig
  const { theme, chapters } = loveStory

  return (
    <section
      id="story"
      className="invite-section allow-scroll flex items-start justify-center text-royal-ivory sm:items-center lg:items-start"
      style={{
        background: `radial-gradient(ellipse at 50% 26%, ${theme.bgTo} 0%, ${theme.bgFrom} 72%)`,
      }}
    >
      <GodRays color={theme.accent} />
      <PalaceSilhouette windows={theme.accent} />
      <GoldDust />
      <FloatingHearts />
      <div className="vignette" />

      <div className="mobile-safe relative z-10 mx-auto w-full max-w-6xl px-6 py-6 sm:py-14 sm:px-8 lg:py-8">
        {/* Header */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mb-3 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70 sm:text-xs"
          >
            {loveStory.eyebrow}
          </motion.p>
          <h2 className="text-4xl sm:text-6xl">
            <LetterReveal text={loveStory.title} delay={0.55} />
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mx-auto my-3 flex max-w-xs items-center gap-3 sm:my-5"
          >
            <span className="h-px flex-1 bg-royal-gold/60" />
            <HeartMini color={theme.accent} />
            <span className="h-px flex-1 bg-royal-gold/60" />
          </motion.div>
        </div>

        {/* ---------------- Desktop: horizontal zig-zag timeline ---------------- */}
        <div className="relative mt-4 hidden lg:block">
          {/* horizontal gold line through the centre */}
          <motion.span
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
            style={{
              background: `linear-gradient(to right, transparent, ${theme.accent}, ${theme.accent}, transparent)`,
              transformOrigin: 'left center',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.6, delay: 0.8, ease: 'easeInOut' }}
          />

          <div className="flex">
            {chapters.map((ch, i) => {
              const top = i % 2 === 0
              return (
                <div key={ch.title} className="relative flex flex-1 flex-col items-center px-3">
                  {/* top slot */}
                  <div className="flex h-44 w-full items-end justify-center pb-6">
                    {top && (
                      <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.1 + i * 0.3 }}
                      >
                        <ChapterBody ch={ch} accent={theme.accent} align="center" />
                      </motion.div>
                    )}
                  </div>

                  {/* connector + heart node on the line */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 h-6 w-px -translate-x-1/2 ${top ? 'bottom-1/2 mb-3' : 'top-1/2 mt-3'}`}
                    style={{ backgroundColor: `${theme.accent}80` }}
                  />
                  <div className="relative z-10">
                    <HeartNode color={theme.accent} delay={1 + i * 0.3} />
                  </div>

                  {/* bottom slot */}
                  <div className="flex h-44 w-full items-start justify-center pt-6">
                    {!top && (
                      <motion.div
                        initial={{ opacity: 0, y: -24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.1 + i * 0.3 }}
                      >
                        <ChapterBody ch={ch} accent={theme.accent} align="center" />
                      </motion.div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ---------------- Mobile / tablet: vertical timeline ---------------- */}
        <div className="relative mt-4 sm:mt-6 lg:hidden">
          {/* rail */}
          <motion.span
            aria-hidden="true"
            className="absolute left-4 top-0 h-full w-px"
            style={{
              background: `linear-gradient(to bottom, transparent, ${theme.accent}, transparent)`,
              transformOrigin: 'top center',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.8, delay: 0.9, ease: 'easeInOut' }}
          />

          <div className="space-y-5 sm:space-y-9">
            {chapters.map((ch, i) => (
              <motion.article
                key={ch.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.1 + i * 0.3, ease: 'easeOut' }}
                className="relative pl-12"
              >
                {/* heart node on the rail */}
                <span className="absolute left-1 top-1">
                  <HeartNode color={theme.accent} delay={1.1 + i * 0.3} />
                </span>

                <div className="flex items-start gap-4">
                  {ch.photo && (
                    <img
                      src={ch.photo}
                      alt={ch.title}
                      loading="lazy"
                      className="mt-1 h-24 w-20 shrink-0 rounded-t-full border-2 object-cover sm:h-32 sm:w-25"
                      style={{ borderColor: `${theme.accent}90` }}
                    />
                  )}
                  <ChapterBody ch={ch} accent={theme.accent} align="left" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Small heart for the header divider. */
function HeartMini({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" style={{ color }}>
      <path d={HEART_PATH} fill="currentColor" />
    </svg>
  )
}
