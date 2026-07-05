import { motion, useTransform } from 'framer-motion'
import { weddingConfig, type WeddingFunction } from '../wedding.config'
import { BackgroundPattern } from '../theme/patterns'
import { SectionDecoration } from './decorations'
import { Countdown } from './Countdown'
import { downloadICS } from '../utils/calendar'
import { useTilt } from '../hooks/useTilt'
import { ArchPanel, DiyaRow, GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

type Layout = 'panel-right' | 'panel-left' | 'centered'
type Align = 'left' | 'right' | 'center'

/* ------------------------- shared building blocks ------------------------- */

function Divider({ accent, align, tight }: { accent: string; align: Align; tight?: boolean }) {
  const margin = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'lg:mx-0 mx-auto'
  return (
    <div className={`${tight ? 'my-4' : 'my-6'} flex max-w-60 items-center gap-3 ${margin}`}>
      <span className="h-px flex-1" style={{ backgroundColor: `${accent}88` }} />
      <span className="h-2 w-2 rotate-45" style={{ backgroundColor: accent }} />
      <span className="h-px flex-1" style={{ backgroundColor: `${accent}88` }} />
    </div>
  )
}

function DressChip({ fn }: { fn: WeddingFunction }) {
  return (
    <span
      className="inline-block rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-royal-ivory/85"
      style={{ borderColor: `${fn.theme.accent}60`, backgroundColor: '#ffffff0d' }}
    >
      Dress code · {fn.dressCode}
    </span>
  )
}

function AvatarArch({ fn, size }: { fn: WeddingFunction; size: 'xs' | 'sm' | 'lg' }) {
  const { theme } = fn
  const hero = Boolean(fn.hero)
  const width =
    size === 'lg' ? 'w-44 sm:w-52' : size === 'sm' ? 'w-40 sm:w-44' : 'w-28 sm:w-32'
  return (
    <motion.div
      className="relative mx-auto w-fit"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 1, ease: 'easeOut' }}
    >
      <span
        className="absolute -top-3 left-1/2 z-20 h-3 w-3 -translate-x-1/2 rotate-45"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className={`relative z-10 overflow-hidden rounded-t-full border-4 p-1.5 ${width}`}
        style={{ borderColor: theme.accent, backgroundColor: '#00000040' }}
      >
        <div className="overflow-hidden rounded-t-full border" style={{ borderColor: `${theme.accent}70` }}>
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
      {hero && null}
    </motion.div>
  )
}

function ActionButtons({ fn, compact }: { fn: WeddingFunction; compact?: boolean }) {
  const { theme } = fn
  const pad = compact ? 'px-5 py-2' : 'px-6 py-2.5'
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href={fn.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-full ${pad} text-xs font-medium uppercase tracking-[0.2em] text-royal-maroon-deep shadow-lg transition-transform hover:scale-105 active:scale-95`}
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
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border ${pad} text-xs uppercase tracking-[0.2em] transition-colors hover:bg-white/10`}
        style={{ borderColor: `${theme.accent}90`, color: theme.accent }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18M12 13v6m-3-3h6" />
        </svg>
        Add to Calendar
      </button>
    </div>
  )
}

function DateVenue({ fn, size }: { fn: WeddingFunction; size: 'md' | 'lg' }) {
  const { theme } = fn
  return (
    <>
      <div
        className={`flex items-center justify-center gap-2.5 font-heading ${
          size === 'lg' ? 'text-2xl' : 'text-xl sm:text-2xl'
        }`}
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
      <div className="mt-5 space-y-1 text-sm">
        <p className="font-medium text-royal-ivory/95">{fn.venueName}</p>
        <p className="font-light text-royal-ivory/70">{fn.venueAddress}</p>
      </div>
    </>
  )
}

/** Editorial title block, alignable left/right for mirrored layouts. */
function TitleBlock({ fn, align }: { fn: WeddingFunction; align: Align }) {
  const hero = Boolean(fn.hero)
  const alignCls =
    align === 'right' ? 'text-center lg:text-right' : 'text-center lg:text-left'
  const fromX = align === 'right' ? 50 : -50
  const justify =
    align === 'right' ? 'justify-center lg:justify-end' : 'justify-center lg:justify-start'
  return (
    <motion.div
      initial={{ opacity: 0, x: fromX, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={alignCls}
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
      <Divider accent={fn.theme.accent} align={align === 'right' ? 'right' : 'left'} />
      <p
        className={`max-w-xl text-sm font-light leading-relaxed text-royal-ivory/80 sm:text-base lg:text-lg ${
          align === 'right' ? 'mx-auto lg:ml-auto lg:mr-0' : 'mx-auto lg:mx-0'
        }`}
      >
        {fn.description}
      </p>
      <div className="mt-6">
        <DressChip fn={fn} />
      </div>
      {hero && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className={`mt-8 flex ${justify}`}
        >
          <Countdown targetISO={fn.startISO} color={fn.theme.accent} />
        </motion.div>
      )}
    </motion.div>
  )
}

/** The ornate arch details panel, with pointer tilt and side-aware entrance. */
function DetailsPanel({ fn, side }: { fn: WeddingFunction; side: 'left' | 'right' }) {
  const { theme } = fn
  const hero = Boolean(fn.hero)
  const { nx, ny } = useTilt()
  const cardRotateY = useTransform(nx, [-1, 1], [-5, 5])
  const cardRotateX = useTransform(ny, [-1, 1], [4, -4])
  const fromX = side === 'left' ? -60 : 60
  return (
    <div
      className={`flex justify-center ${side === 'left' ? 'lg:justify-start' : 'lg:justify-end'}`}
      style={{ perspective: 1300 }}
    >
      <motion.div
        initial={{ opacity: 0, x: fromX, y: 40, rotateX: 12, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div style={{ rotateX: cardRotateX, rotateY: cardRotateY }}>
          <ArchPanel accent={theme.accent}>
            {(fn.avatar || hero) && (
              <div className="mb-6">
                <AvatarArch fn={fn} size={hero ? 'lg' : 'sm'} />
              </div>
            )}
            <DateVenue fn={fn} size={hero ? 'lg' : 'md'} />
            <div className="mt-6">
              <ActionButtons fn={fn} />
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
  )
}

/** Symmetric center composition: avatar crowning a wide gold info band. */
function CenteredLayout({ fn }: { fn: WeddingFunction }) {
  const { theme } = fn
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
      >
        <AvatarArch fn={fn} size="xs" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3"
      >
        <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70 sm:text-xs">
          You are invited to the
        </p>
        <h2 className="text-6xl leading-none sm:text-7xl">
          <LetterReveal text={fn.name} delay={0.6} />
        </h2>
        <Divider accent={theme.accent} align="center" tight />
        <p className="mx-auto max-w-xl text-sm font-light leading-relaxed text-royal-ivory/80 sm:text-base">
          {fn.description}
        </p>
      </motion.div>

      {/* horizontal gold info band */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 flex w-full flex-col items-center gap-5 rounded-2xl border px-8 py-4 backdrop-blur-[2px] lg:flex-row lg:justify-between lg:gap-8"
        style={{
          borderColor: `${theme.accent}55`,
          background: 'rgba(0,0,0,0.28)',
          boxShadow: `0 30px 70px -30px #000c, 0 0 36px -18px ${theme.accent}55`,
        }}
      >
        <div className="text-center lg:text-left">
          <p className="text-[10px] uppercase tracking-[0.3em] text-royal-ivory/60">When</p>
          <p className="mt-1 font-heading text-xl" style={{ color: theme.accent }}>
            {fn.date}
          </p>
          <p className="text-xs font-light" style={{ color: theme.accent }}>
            {fn.time}
          </p>
        </div>
        <span className="hidden h-12 w-px lg:block" style={{ backgroundColor: `${theme.accent}40` }} />
        <div className="text-center lg:text-left">
          <p className="text-[10px] uppercase tracking-[0.3em] text-royal-ivory/60">Where</p>
          <p className="mt-1 text-sm font-medium text-royal-ivory/95">{fn.venueName}</p>
          <p className="text-xs font-light text-royal-ivory/70">{fn.venueAddress}</p>
        </div>
        <span className="hidden h-12 w-px lg:block" style={{ backgroundColor: `${theme.accent}40` }} />
        <ActionButtons fn={fn} compact />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-4"
      >
        <DressChip fn={fn} />
      </motion.div>
    </div>
  )
}

/* --------------------------------- slide --------------------------------- */

/**
 * Cinematic full-viewport slide for any wedding function. The desktop
 * composition is chosen per function via `fn.layout` (panel-right,
 * panel-left, or centered) so consecutive slides don't repeat the same
 * arrangement; mobile always uses the compact single-screen stack.
 * Everything renders from config.
 */
export function FunctionSection({ fn }: { fn: WeddingFunction }) {
  const { theme } = fn
  const hero = Boolean(fn.hero)
  const layout: Layout = hero ? 'panel-right' : (fn.layout ?? 'panel-right')

  const { nx, ny } = useTilt()
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

      {/* ============ Tablet / desktop: per-function composition ============ */}
      {layout === 'centered' ? (
        <div className="relative z-10 mx-auto hidden w-full max-w-6xl px-6 py-10 sm:block lg:px-10">
          <CenteredLayout fn={fn} />
        </div>
      ) : layout === 'panel-left' ? (
        <div className="relative z-10 mx-auto hidden w-full max-w-6xl items-center gap-10 px-6 py-14 sm:grid lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10">
          <DetailsPanel fn={fn} side="left" />
          <TitleBlock fn={fn} align="right" />
        </div>
      ) : (
        <div className="relative z-10 mx-auto hidden w-full max-w-6xl items-center gap-10 px-6 py-14 sm:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10">
          <TitleBlock fn={fn} align="left" />
          <DetailsPanel fn={fn} side="right" />
        </div>
      )}
    </section>
  )
}
