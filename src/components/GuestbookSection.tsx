import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { weddingConfig } from '../wedding.config'
import { DiyaRow, GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Guestbook slide: guests write a message for the couple (word-limited via
 * config) and send it straight to the couple's WhatsApp — no backend needed.
 */
export function GuestbookSection() {
  const { guestbook, couple, rsvp } = weddingConfig
  const { theme } = guestbook

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const words = useMemo(() => countWords(message), [message])
  const overLimit = words > guestbook.maxWords
  const canSend = message.trim().length > 0 && !overLimit

  const waText = encodeURIComponent(
    `💌 A message for ${couple.bride} & ${couple.groom}${name.trim() ? ` from ${name.trim()}` : ''}:\n\n${message.trim()}`,
  )

  return (
    <section
      id="wishes"
      className="invite-section flex items-center justify-center text-royal-ivory"
      style={{
        background: `radial-gradient(ellipse at 50% 26%, ${theme.bgTo} 0%, ${theme.bgFrom} 72%)`,
      }}
    >
      <GodRays color={theme.accent} />
      <PalaceSilhouette windows={theme.accent} />
      <GoldDust />
      <div className="vignette" />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        {/* ---------------- Left: invitation to write ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-center lg:text-left"
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70 sm:text-xs">
            {guestbook.eyebrow}
          </p>
          <h2 className="text-5xl leading-none sm:text-6xl">
            <LetterReveal text={guestbook.title} delay={0.55} step={0.05} />
          </h2>
          <div className="mx-auto my-5 flex max-w-60 items-center gap-3 lg:mx-0">
            <span className="h-px flex-1 bg-royal-gold/60" />
            <span className="h-2 w-2 rotate-45 bg-royal-gold" />
            <span className="h-px flex-1 bg-royal-gold/60" />
          </div>
          <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-royal-ivory/80 sm:text-base lg:mx-0">
            {guestbook.prompt}
          </p>
          <div className="mt-8 hidden justify-center lg:flex lg:justify-start">
            <DiyaRow count={2} />
          </div>
        </motion.div>

        {/* ---------------- Right: the letter ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="rounded-2xl border p-5 sm:p-7"
            style={{
              borderColor: `${theme.accent}55`,
              backgroundColor: '#ffffff0a',
              boxShadow: `0 30px 70px -30px #000c, 0 0 36px -18px ${theme.accent}55`,
            }}
          >
            <label className="block text-left">
              <span
                className="mb-1.5 block text-[10px] uppercase tracking-[0.25em]"
                style={{ color: theme.accent }}
              >
                Your name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meera & family"
                className="w-full rounded-lg border bg-black/25 px-4 py-2.5 text-sm text-royal-ivory placeholder:text-royal-ivory/35 focus:outline-none"
                style={{ borderColor: '#ffffff26' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${theme.accent}90`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ffffff26')}
              />
            </label>

            <label className="mt-4 block text-left">
              <span
                className="mb-1.5 block text-[10px] uppercase tracking-[0.25em]"
                style={{ color: theme.accent }}
              >
                Your message
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Dear Aarohi & Vihaan…"
                className="w-full resize-none rounded-lg border bg-black/25 px-4 py-3 text-sm font-light leading-relaxed text-royal-ivory placeholder:text-royal-ivory/35 focus:outline-none"
                style={{ borderColor: overLimit ? '#e05c5c' : '#ffffff26' }}
                onFocus={(e) => {
                  if (!overLimit) e.currentTarget.style.borderColor = `${theme.accent}90`
                }}
                onBlur={(e) => {
                  if (!overLimit) e.currentTarget.style.borderColor = '#ffffff26'
                }}
              />
            </label>

            <div className="mt-2 flex items-center justify-between gap-4">
              <span
                className="text-xs tabular-nums"
                style={{ color: overLimit ? '#F08A8A' : '#fdf6ec99' }}
              >
                {words} / {guestbook.maxWords} words
                {overLimit && ' — a little too long, trim it down'}
              </span>

              <a
                href={canSend ? `https://wa.me/${rsvp.whatsappNumber}?text=${waText}` : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!canSend}
                onClick={(e) => {
                  if (!canSend) e.preventDefault()
                }}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] shadow-lg transition-transform ${
                  canSend
                    ? 'cursor-pointer text-royal-maroon-deep hover:scale-105 active:scale-95'
                    : 'cursor-not-allowed text-royal-maroon-deep/60 opacity-50'
                }`}
                style={{
                  background: `linear-gradient(120deg, #F5E08A, ${theme.accent} 55%, #C9A227)`,
                  boxShadow: canSend ? `0 8px 24px -8px ${theme.accent}aa` : 'none',
                }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                </svg>
                Send with love
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
