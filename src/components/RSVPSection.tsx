import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { weddingConfig, type WeddingFunction } from '../wedding.config'
import { BackgroundPattern } from '../theme/patterns'
import { DiyaRow, GoldDust, LetterReveal, PalaceSilhouette } from './royal'
import { RSVPModal } from './RSVPModal'

/**
 * Final slide: RSVP call-to-action plus the sign-off — couple names,
 * family line, hashtag and the replay-entry control. The RSVP button opens
 * a modal form (see RSVPModal); `functions` are the ones in this invite so
 * the form only offers celebrations the guest is actually invited to.
 */
export function RSVPSection({
  onReplayEntry,
  functions,
  onFormOpenChange,
}: {
  onReplayEntry: () => void
  functions: WeddingFunction[]
  /** lets the carousel pause auto-advance while the form is open */
  onFormOpenChange?: (open: boolean) => void
}) {
  const { rsvp, hashtag, couple, footer } = weddingConfig
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    onFormOpenChange?.(formOpen)
  }, [formOpen, onFormOpenChange])

  return (
    <section
      id="rsvp"
      className="invite-section flex items-center justify-center text-royal-ivory"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #5C1626 0%, #170308 72%)',
      }}
    >
      <BackgroundPattern pattern="floral" color="#e8cf7a" opacity={0.05} />
      <PalaceSilhouette windows="#E8CF7A" />
      <GoldDust />
      <div className="vignette" />

      {/* drifting hearts */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 24 22"
            className="absolute w-4 text-royal-gold-light/50"
            style={{ left: `${12 + i * 15}%`, bottom: -20 }}
            animate={{ y: ['0vh', '-110vh'], opacity: [0, 0.7, 0], rotate: [0, i % 2 ? 20 : -20] }}
            transition={{ duration: 11 + i * 2, delay: i * 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M12 6 C 7 -3 -3 3 12 16 C 27 3 17 -3 12 6 Z" fill="currentColor" />
          </motion.svg>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
        className="mobile-safe relative z-10 mx-auto max-w-2xl px-6 py-6 text-center sm:py-14"
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl">
          <LetterReveal text={rsvp.title} delay={0.6} step={0.04} />
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-royal-ivory/85 sm:mt-6 sm:text-base lg:text-lg">
          {rsvp.message}
        </p>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="mt-6 inline-block cursor-pointer rounded-full px-8 py-3 text-sm font-medium uppercase tracking-[0.25em] text-royal-maroon-deep shadow-lg transition-transform hover:scale-105 active:scale-95 sm:mt-9"
          style={{
            background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)',
            boxShadow: '0 8px 28px -8px #c9a227aa',
          }}
        >
          RSVP Now
        </button>

        <div className="mt-6 sm:mt-10">
          <DiyaRow count={3} />
        </div>

        {/* sign-off */}
        <div className="mx-auto mt-6 flex max-w-xs items-center gap-3 sm:mt-8">
          <span className="h-px flex-1 bg-royal-gold/50" />
          <span className="h-1.5 w-1.5 rotate-45 bg-royal-gold" />
          <span className="h-px flex-1 bg-royal-gold/50" />
        </div>
        <p className="mt-6 font-heading text-2xl italic text-royal-gold-light">
          {couple.bride} &amp; {couple.groom}
        </p>
        <p className="mt-2 max-w-md text-sm font-light text-royal-ivory/80">{footer.message}</p>
        <p className="mt-1 text-xs font-light text-royal-ivory/60">{footer.familyLine}</p>
        <p className="mt-3 text-xs tracking-[0.3em] text-royal-gold">{hashtag}</p>
        <button
          onClick={onReplayEntry}
          className="mt-5 cursor-pointer text-xs uppercase tracking-[0.2em] text-royal-gold underline decoration-royal-gold/30 underline-offset-4 transition-colors hover:text-royal-gold-light"
        >
          Replay entry
        </button>
      </motion.div>

      {formOpen && <RSVPModal functions={functions} onClose={() => setFormOpen(false)} />}
    </section>
  )
}
