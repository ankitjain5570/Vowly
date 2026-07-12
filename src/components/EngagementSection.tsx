import { useState } from 'react'
import { motion, useTransform, type Variants } from 'framer-motion'
import { weddingConfig, type WeddingFunction } from '../wedding.config'
import { BackgroundPattern } from '../theme/patterns'
import { SectionDecoration } from './decorations'
import { RingExchange } from './RingExchange'
import { useTilt } from '../hooks/useTilt'
import { downloadICS } from '../utils/calendar'
import { GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.35 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

const POLAROID_TILT = [-6, 4, -2]

/**
 * Engagement slide. Desktop: two-column — headline, story and polaroids on
 * the left, the cinematic ring-exchange scene large on the right. Mobile:
 * stacked and centered. Deep-rose night theme from the config entry.
 */
export function EngagementSection({ fn }: { fn: WeddingFunction }) {
  const { theme } = fn
  const [replayKey, setReplayKey] = useState(0)
  const { nx, ny } = useTilt()
  const sceneRotateY = useTransform(nx, [-1, 1], [-6, 6])
  const sceneRotateX = useTransform(ny, [-1, 1], [5, -5])
  const decorX = useTransform(nx, [-1, 1], [24, -24])
  const initials: [string, string] = [
    weddingConfig.couple.bride.charAt(0),
    weddingConfig.couple.groom.charAt(0),
  ]

  return (
    <section
      id={fn.id}
      className="invite-section flex items-center justify-center text-royal-ivory"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${theme.bgTo} 0%, ${theme.bgFrom} 72%)`,
      }}
    >
      <BackgroundPattern pattern={theme.backgroundPattern} color={theme.accent} opacity={0.05} />
      <GodRays color={theme.accent} />
      <motion.div className="absolute inset-0" style={{ x: decorX }}>
        <SectionDecoration
          decoration={theme.decoration}
          primary={theme.primary}
          accent={theme.accent}
        />
      </motion.div>
      <PalaceSilhouette windows={theme.accent} />
      <GoldDust />
      <div className="vignette" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mobile-safe relative z-10 mx-auto grid w-full max-w-6xl items-center gap-4 px-5 py-6 sm:gap-8 sm:py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-10"
      >
        {/* ---------------- Left: headline, story, polaroids ---------------- */}
        <div className="text-center lg:text-left">
          <motion.p
            variants={fadeUp}
            className="mb-3 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70 sm:text-xs"
          >
            Where it all begins
          </motion.p>
          <h2 className="text-5xl leading-none sm:text-7xl lg:text-8xl">
            <LetterReveal text={fn.name} delay={0.6} />
          </h2>

          <motion.div
            variants={fadeUp}
            className="mx-auto my-3 flex max-w-60 items-center gap-3 sm:my-5 lg:mx-0"
          >
            <span className="h-px flex-1 bg-royal-gold/60" />
            <span className="h-2 w-2 rotate-45 bg-royal-gold" />
            <span className="h-px flex-1 bg-royal-gold/60" />
          </motion.div>

          <motion.p variants={fadeUp} className="font-heading text-xl" style={{ color: theme.accent }}>
            {fn.date} · {fn.time}
          </motion.p>

          {fn.story && (
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 hidden max-w-xl text-sm font-light leading-relaxed text-royal-ivory/80 sm:block sm:text-base lg:mx-0"
            >
              {fn.story}
            </motion.p>
          )}

          {/* Venue */}
          <motion.div variants={fadeUp} className="mt-3 space-y-1 text-sm sm:mt-5">
            <p className="font-medium text-royal-ivory/95">{fn.venueName}</p>
            <p className="hidden font-light text-royal-ivory/70 sm:block">{fn.venueAddress}</p>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={fadeUp}
            className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-5 lg:justify-start"
          >
            <a
              href={fn.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-royal-maroon-deep shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(120deg, #F5E08A, ${theme.accent} 55%, #C9A227)`,
                boxShadow: `0 8px 24px -8px ${theme.accent}aa`,
              }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              Get Directions
            </a>
            <button
              type="button"
              onClick={() => downloadICS(fn)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-white/10"
              style={{ borderColor: `${theme.accent}90`, color: theme.accent }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18M12 13v6m-3-3h6" />
              </svg>
              Add to Calendar
            </button>
          </motion.div>

          {/* Dress code chip */}
          <motion.div variants={fadeUp} className="mt-4 hidden sm:mt-5 sm:block">
            <span
              className="inline-block rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-royal-ivory/85"
              style={{ borderColor: `${theme.accent}60`, backgroundColor: '#ffffff0d' }}
            >
              Dress code · {fn.dressCode}
            </span>
          </motion.div>

          {/* Overlapping polaroid photos (hidden on phones for fit) */}
          {fn.photos && fn.photos.length > 0 && (
            <motion.div
              variants={fadeUp}
              className="mt-7 hidden items-center justify-center sm:flex lg:justify-start"
            >
              {fn.photos.slice(0, 3).map((src, i) => (
                <motion.figure
                  key={src}
                  initial={{ rotate: POLAROID_TILT[i % POLAROID_TILT.length] }}
                  whileHover={{ rotate: 0, y: -12, scale: 1.06, zIndex: 20 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="relative -mx-3 w-28 cursor-pointer bg-white p-2 pb-6 sm:-mx-4 sm:w-36 sm:p-2.5 sm:pb-7"
                  style={{ zIndex: i, boxShadow: '0 18px 40px -12px #000a' }}
                >
                  <img
                    src={src}
                    alt={`${fn.name} photo ${i + 1}`}
                    loading="lazy"
                    className="aspect-3/4 w-full object-cover"
                  />
                  <figcaption
                    className="absolute inset-x-0 bottom-1 text-center font-heading text-xs italic sm:text-sm"
                    style={{ color: '#8E3B52' }}
                  >
                    {i === 1 ? 'she said yes' : '❤'}
                  </figcaption>
                </motion.figure>
              ))}
            </motion.div>
          )}
        </div>

        {/* ---------------- Right: avatar + ring exchange scene ---------------- */}
        <motion.div variants={fadeUp} className="relative">
          {fn.avatar && (
            <div className="mb-4 hidden justify-center sm:flex">
              <div className="relative">
                <span
                  className="absolute -top-3 left-1/2 z-20 h-3 w-3 -translate-x-1/2 rotate-45"
                  style={{ backgroundColor: theme.accent }}
                />
                <div
                  className="relative z-10 w-36 overflow-hidden rounded-t-full border-4 p-1.5 sm:w-44"
                  style={{ borderColor: theme.accent, backgroundColor: '#00000040' }}
                >
                  <div
                    className="overflow-hidden rounded-t-full border"
                    style={{ borderColor: `${theme.accent}70` }}
                  >
                    <img
                      src={fn.avatar}
                      alt={`${weddingConfig.couple.bride} and ${weddingConfig.couple.groom} — ${fn.name}`}
                      loading="lazy"
                      className="aspect-3/4 w-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <motion.div style={{ rotateY: sceneRotateY, rotateX: sceneRotateX }}>
            <div className="mx-auto w-full max-w-[240px] sm:max-w-xl lg:max-w-none">
              <RingExchange key={replayKey} play initials={initials} primary={theme.primary} />
            </div>
          </motion.div>
          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            aria-label="Replay ring exchange animation"
            title="Replay"
            className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-black/30 backdrop-blur-sm transition-transform hover:rotate-180 active:scale-90"
            style={{ borderColor: `${theme.accent}80`, color: theme.accent }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v6h6M20 20v-6h-6M20 9A8 8 0 0 0 6.3 6.3L4 10m0 4l2.3 3.7A8 8 0 0 0 20 14"
              />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}
