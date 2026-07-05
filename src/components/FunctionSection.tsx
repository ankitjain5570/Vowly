import { motion, useTransform } from 'framer-motion'
import { weddingConfig, type WeddingFunction } from '../wedding.config'
import { BackgroundPattern } from '../theme/patterns'
import { SectionDecoration } from './decorations'
import { Countdown } from './Countdown'
import { downloadICS } from '../utils/calendar'
import { useTilt } from '../hooks/useTilt'
import { ArchPanel, DiyaRow, GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

/**
 * Cinematic full-viewport slide for any wedding function.
 *
 * Desktop: editorial two-column composition — oversized gold-foil title,
 * description and countdown on the left; an ornate arch panel with the
 * date/venue/actions (and hero photo) on the right. Mobile: stacked and
 * centered. Everything renders from config.
 */
export function FunctionSection({ fn }: { fn: WeddingFunction }) {
  const { theme } = fn
  const hero = Boolean(fn.hero)

  const { nx, ny } = useTilt()
  const cardRotateY = useTransform(nx, [-1, 1], [-5, 5])
  const cardRotateX = useTransform(ny, [-1, 1], [4, -4])
  const bgX = useTransform(nx, [-1, 1], [16, -16])
  const bgY = useTransform(ny, [-1, 1], [10, -10])
  const sceneX = useTransform(nx, [-1, 1], [28, -28])

  return (
    <section
      id={fn.id}
      className="invite-section flex items-center justify-center text-royal-ivory"
      style={{
        background: `radial-gradient(ellipse at 50% 26%, ${theme.bgTo} 0%, ${theme.bgFrom} 72%)`,
      }}
    >
      {/* depth layer 1: motif pattern */}
      <motion.div className="absolute inset-[-4%]" style={{ x: bgX, y: bgY }}>
        <BackgroundPattern pattern={theme.backgroundPattern} color={theme.accent} opacity={0.05} />
      </motion.div>

      <GodRays color={theme.accent} />

      {/* depth layer 2: animated scene */}
      <motion.div className="absolute inset-0" style={{ x: sceneX }}>
        <SectionDecoration
          decoration={theme.decoration}
          primary={theme.primary}
          accent={theme.accent}
        />
      </motion.div>

      <PalaceSilhouette windows={theme.accent} />
      <GoldDust />
      <div className="vignette" />

      {/* ============ Phone: compact single-screen stack ============ */}
      <div className="mobile-safe relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center sm:hidden">
        <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70">
          You are invited to the
        </p>

        {(fn.avatar || hero) && (
          <div className="relative mb-4">
            <span
              className="absolute -top-2.5 left-1/2 z-20 h-2.5 w-2.5 -translate-x-1/2 rotate-45"
              style={{ backgroundColor: theme.accent }}
            />
            <div
              className="relative z-10 w-24 overflow-hidden rounded-t-full border-[3px] p-1"
              style={{ borderColor: theme.accent, backgroundColor: '#00000040' }}
            >
              <img
                src={fn.avatar ?? weddingConfig.couplePhoto}
                alt={`${weddingConfig.couple.bride} and ${weddingConfig.couple.groom} — ${fn.name}`}
                loading="lazy"
                className="aspect-3/4 w-full rounded-t-full object-cover object-top"
              />
            </div>
          </div>
        )}

        <h2 className="text-5xl leading-none">
          <LetterReveal text={fn.name} delay={0.4} />
        </h2>

        <div className="my-3 flex w-40 items-center gap-2">
          <span className="h-px flex-1" style={{ backgroundColor: `${theme.accent}88` }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: theme.accent }} />
          <span className="h-px flex-1" style={{ backgroundColor: `${theme.accent}88` }} />
        </div>

        <p className="font-heading text-xl" style={{ color: theme.accent }}>
          {fn.date}
        </p>
        <p className="text-xs font-light" style={{ color: theme.accent }}>
          {fn.time}
        </p>

        <p className="mt-3 text-sm font-medium text-royal-ivory/95">{fn.venueName}</p>

        {hero && (
          <div className="mt-3">
            <Countdown targetISO={fn.startISO} color={theme.accent} />
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2.5">
          <a
            href={fn.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-royal-maroon-deep shadow-lg active:scale-95"
            style={{ background: `linear-gradient(120deg, #F5E08A, ${theme.accent} 55%, #C9A227)` }}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Directions
          </a>
          <button
            type="button"
            onClick={() => downloadICS(fn)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.15em] active:scale-95"
            style={{ borderColor: `${theme.accent}90`, color: theme.accent }}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18M12 13v6m-3-3h6" />
            </svg>
            Calendar
          </button>
        </div>

        <span
          className="mt-3 inline-block rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-royal-ivory/85"
          style={{ borderColor: `${theme.accent}60`, backgroundColor: '#ffffff0d' }}
        >
          Dress code · {fn.dressCode}
        </span>
      </div>

      {/* ============ Tablet / desktop: two-column editorial ============ */}
      <div className="relative z-10 mx-auto hidden w-full max-w-6xl items-center gap-10 px-6 py-14 sm:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10">
        {/* ---------------- Left: editorial title block ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          className="text-center lg:text-left"
        >
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70 sm:text-xs">
            You are invited to the
          </p>

          <h2
            className={
              hero
                ? 'text-6xl leading-none sm:text-8xl lg:text-9xl'
                : 'text-6xl leading-none sm:text-7xl lg:text-8xl'
            }
          >
            <LetterReveal text={fn.name} delay={0.6} />
          </h2>

          {/* Ornamental divider */}
          <div className="mx-auto my-6 flex max-w-60 items-center gap-3 lg:mx-0">
            <span className="h-px flex-1" style={{ backgroundColor: `${theme.accent}88` }} />
            <span className="h-2 w-2 rotate-45" style={{ backgroundColor: theme.accent }} />
            <span className="h-px flex-1" style={{ backgroundColor: `${theme.accent}88` }} />
          </div>

          <p className="mx-auto max-w-xl text-sm font-light leading-relaxed text-royal-ivory/80 sm:text-base lg:mx-0 lg:text-lg">
            {fn.description}
          </p>

          {/* Dress code chip */}
          <div className="mt-6">
            <span
              className="inline-block rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-royal-ivory/85"
              style={{ borderColor: `${theme.accent}60`, backgroundColor: '#ffffff0d' }}
            >
              Dress code · {fn.dressCode}
            </span>
          </div>

          {/* Hero: countdown lives in the wide column */}
          {hero && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-8 flex justify-center lg:justify-start"
            >
              <Countdown targetISO={fn.startISO} color={theme.accent} />
            </motion.div>
          )}
        </motion.div>

        {/* ---------------- Right: arch details panel ---------------- */}
        <div className="flex justify-center lg:justify-end" style={{ perspective: 1300 }}>
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div style={{ rotateX: cardRotateX, rotateY: cardRotateY }}>
              <ArchPanel accent={theme.accent}>
                {/* Couple avatar (or hero couple photo) in a jharokha arch */}
                {(fn.avatar || hero) && (
                  <motion.div
                    className="relative mx-auto mb-6 w-fit"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, delay: 1, ease: 'easeOut' }}
                  >
                    <span
                      className="absolute -top-3 left-1/2 z-20 h-3 w-3 -translate-x-1/2 rotate-45"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <div
                      className={`relative z-10 overflow-hidden rounded-t-full border-4 p-1.5 ${
                        hero ? 'w-44 sm:w-52' : 'w-40 sm:w-48'
                      }`}
                      style={{ borderColor: theme.accent, backgroundColor: '#00000040' }}
                    >
                      <div
                        className="overflow-hidden rounded-t-full border"
                        style={{ borderColor: `${theme.accent}70` }}
                      >
                        <img
                          src={fn.avatar ?? weddingConfig.couplePhoto}
                          alt={`${weddingConfig.couple.bride} and ${weddingConfig.couple.groom} — ${fn.name}`}
                          loading="lazy"
                          className="aspect-3/4 w-full object-cover object-top"
                        />
                      </div>
                    </div>
                    <span
                      className="absolute -left-2 bottom-0 z-0 h-2/5 w-2 rounded-t-full"
                      style={{ backgroundColor: `${theme.accent}99` }}
                    />
                    <span
                      className="absolute -right-2 bottom-0 z-0 h-2/5 w-2 rounded-t-full"
                      style={{ backgroundColor: `${theme.accent}99` }}
                    />
                  </motion.div>
                )}

                {/* Date & time */}
                <div
                  className="flex items-center justify-center gap-2.5 font-heading text-xl sm:text-2xl"
                  style={{ color: theme.accent }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18" />
                  </svg>
                  <span>{fn.date}</span>
                </div>
                <div
                  className="mt-1.5 flex items-center justify-center gap-2 text-sm font-light"
                  style={{ color: theme.accent }}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" d="M12 7v5l3 2" />
                  </svg>
                  <span>{fn.time}</span>
                </div>

                {/* Venue */}
                <div className="mt-5 space-y-1 text-sm">
                  <p className="font-medium text-royal-ivory/95">{fn.venueName}</p>
                  <p className="font-light text-royal-ivory/70">{fn.venueAddress}</p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
                </div>

                {hero && (
                  <div className="mt-7">
                    <DiyaRow count={3} />
                  </div>
                )}
              </ArchPanel>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
