import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { weddingConfig, type Faq } from '../wedding.config'
import { GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

function FaqItem({
  faq,
  open,
  onToggle,
  accent,
}: {
  faq: Faq
  open: boolean
  onToggle: () => void
  accent: string
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border transition-colors"
      style={{
        borderColor: open ? `${accent}70` : '#ffffff22',
        backgroundColor: open ? '#ffffff10' : '#ffffff08',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-2 text-left sm:px-5 sm:py-3.5"
      >
        <span className="font-heading text-sm text-royal-gold-light sm:text-xl">{faq.q}</span>
        <motion.svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          fill="none"
          stroke={accent}
          strokeWidth="2"
        >
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <p className="px-5 pb-4 text-sm font-light leading-relaxed text-royal-ivory/75">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Guest info slide: FAQ accordion (routes, shuttles, parking, weather)
 * on the left; hotel recommendations and contact people on the right.
 * Everything renders from `config.guestInfo`.
 */
export function GuestInfoSection() {
  const { guestInfo } = weddingConfig
  const { theme } = guestInfo
  // Start collapsed on phones (space is tight), first-open on larger screens.
  const [openIndex, setOpenIndex] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? -1 : 0,
  )

  return (
    <section
      id="info"
      className="invite-section flex items-center justify-center text-royal-ivory"
      style={{
        background: `radial-gradient(ellipse at 50% 26%, ${theme.bgTo} 0%, ${theme.bgFrom} 72%)`,
      }}
    >
      <GodRays color={theme.accent} />
      <PalaceSilhouette windows={theme.accent} />
      <GoldDust />
      <div className="vignette" />

      <div className="mobile-safe relative z-10 mx-auto w-full max-w-6xl px-5 py-6 sm:py-14 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mb-3 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70 sm:text-xs"
          >
            {guestInfo.eyebrow}
          </motion.p>
          <h2 className="text-4xl sm:text-6xl">
            <LetterReveal text={guestInfo.title} delay={0.55} />
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mx-auto my-3 flex max-w-xs items-center gap-3 sm:my-5"
          >
            <span className="h-px flex-1 bg-royal-gold/60" />
            <span className="h-2 w-2 rotate-45 bg-royal-gold" />
            <span className="h-px flex-1 bg-royal-gold/60" />
          </motion.div>
        </div>

        <div className="mt-3 grid gap-4 sm:mt-4 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* ---------------- FAQs ---------------- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="space-y-1.5 sm:space-y-3"
          >
            {guestInfo.faqs.map((faq, i) => (
              <FaqItem
                key={faq.q}
                faq={faq}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                accent={theme.accent}
              />
            ))}
          </motion.div>

          {/* ---------------- Stay + contacts ---------------- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Hotels — hidden on phones for fit; on tablet/desktop shown */}
            <div className="hidden sm:block">
              <h3
                className="mb-3 text-xs uppercase tracking-[0.3em]"
                style={{ color: theme.accent }}
              >
                Where to stay
              </h3>
              <div className="space-y-3">
                {guestInfo.hotels.map((hotel) => (
                  <div
                    key={hotel.name}
                    className="rounded-xl border p-4"
                    style={{ borderColor: '#ffffff22', backgroundColor: '#ffffff08' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke={theme.accent} strokeWidth="1.6">
                          <path strokeLinecap="round" d="M3 20V9l9-5 9 5v11M3 20h18M9 20v-6h6v6" />
                        </svg>
                        <p className="font-heading text-xl text-royal-gold-light">{hotel.name}</p>
                      </div>
                      <a
                        href={hotel.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors hover:bg-white/10"
                        style={{ borderColor: `${theme.accent}70`, color: theme.accent }}
                      >
                        Map
                      </a>
                    </div>
                    <p className="mt-2 text-sm font-light leading-relaxed text-royal-ivory/75">
                      {hotel.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3
                className="mb-3 text-xs uppercase tracking-[0.3em]"
                style={{ color: theme.accent }}
              >
                Reach out anytime
              </h3>
              <div className="space-y-3">
                {guestInfo.contacts.map((c) => (
                  <div
                    key={c.name}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-2.5 sm:p-4"
                    style={{ borderColor: '#ffffff22', backgroundColor: '#ffffff08' }}
                  >
                    <div>
                      <p className="font-heading text-lg text-royal-gold-light">{c.name}</p>
                      <p className="text-xs font-light text-royal-ivory/65">{c.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:+${c.phone}`}
                        aria-label={`Call ${c.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                        style={{ borderColor: `${theme.accent}70`, color: theme.accent }}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                        </svg>
                      </a>
                      <a
                        href={`https://wa.me/${c.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${c.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                        style={{ borderColor: `${theme.accent}70`, color: theme.accent }}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
                          <path strokeLinecap="round" d="M9 9.5c.5 2.5 3 5 5.5 5.5l1-1.5-2-1-1 .5c-.8-.5-1.5-1.2-2-2l.5-1-1-2Z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
