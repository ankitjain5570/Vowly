import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { weddingConfig } from '../wedding.config'
import { EngagementSection } from './EngagementSection'
import { FunctionSection } from './FunctionSection'
import { StorySection } from './StorySection'
import { PhotobookSection } from './PhotobookSection'
import { GuestInfoSection } from './GuestInfoSection'
import { GuestbookSection } from './GuestbookSection'
import { RSVPSection } from './RSVPSection'
import { NavDots } from './NavDots'

const SLIDE_MS = 15_000

/** 3D coverflow-style slide transition, direction-aware. */
const variants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '55%' : '-55%',
    opacity: 0,
    rotateY: dir >= 0 ? 16 : -16,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '-45%' : '45%',
    opacity: 0,
    rotateY: dir >= 0 ? -13 : 13,
    scale: 0.94,
    transition: { duration: 0.6, ease: 'easeIn' },
  }),
}

/** Ornate rotated-diamond edge arrow. */
function EdgeArrow({
  dir,
  label,
  onClick,
}: {
  dir: 1 | -1
  label: string
  onClick: () => void
}) {
  const next = dir === 1
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={next ? `Next: ${label}` : `Previous: ${label}`}
      className={`group fixed top-1/2 z-40 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-2 ${
        next ? 'right-2 sm:right-5' : 'left-2 sm:left-5'
      }`}
    >
      <span className="h-1.5 w-1.5 rotate-45 bg-royal-gold/50 transition-colors group-hover:bg-royal-gold" />
      <span
        className="relative flex h-9 w-9 rotate-45 items-center justify-center border border-royal-gold/50 bg-black/30 backdrop-blur-sm transition-all duration-300 group-hover:border-royal-gold group-hover:bg-royal-gold group-hover:shadow-[0_0_24px_rgba(201,162,39,0.6)] sm:h-11 sm:w-11"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 -rotate-45 text-royal-gold-light transition-colors group-hover:text-royal-maroon-deep ${
            next ? '' : 'scale-x-[-1]'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
      <span className="h-1.5 w-1.5 rotate-45 bg-royal-gold/50 transition-colors group-hover:bg-royal-gold" />
      {/* label on hover (desktop) */}
      <span
        className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded bg-royal-maroon-deep/85 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-royal-gold-light opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:block ${
          next ? 'right-full mr-3' : 'left-full ml-3'
        }`}
      >
        {label}
      </span>
    </button>
  )
}

/**
 * Auto-playing full-screen carousel of invitation slides. Advances every
 * 15s with a progress ring; supports pause/play, ornate edge arrows,
 * clickable side dots, arrow keys, spacebar (pause) and swipe. A persistent
 * RSVP button rides along on every slide.
 */
export function InviteCarousel({ onReplayEntry }: { onReplayEntry: () => void }) {
  const slides = [
    { id: 'story', label: weddingConfig.loveStory.title, node: <StorySection /> },
    ...weddingConfig.functions.map((fn) => ({
      id: fn.id,
      label: fn.name,
      node:
        fn.id === 'engagement' ? <EngagementSection fn={fn} /> : <FunctionSection fn={fn} />,
    })),
    { id: 'photobook', label: weddingConfig.photobook.title, node: <PhotobookSection /> },
    { id: 'info', label: weddingConfig.guestInfo.title, node: <GuestInfoSection /> },
    { id: 'wishes', label: 'Wishes', node: <GuestbookSection /> },
    { id: 'rsvp', label: 'RSVP', node: <RSVPSection onReplayEntry={onReplayEntry} /> },
  ]

  const [[index, dir], setIndexDir] = useState<[number, number]>([0, 0])
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const touchX = useRef<number | null>(null)

  const go = useCallback(
    (next: number, d: number) => {
      setIndexDir([((next % slides.length) + slides.length) % slides.length, d])
      setProgress(0)
    },
    [slides.length],
  )

  // auto-advance timer (restarts on slide change / resume)
  useEffect(() => {
    if (paused) return
    const started = Date.now()
    const t = setInterval(() => {
      const p = (Date.now() - started) / SLIDE_MS
      if (p >= 1) {
        go(index + 1, 1)
      } else {
        setProgress(p)
      }
    }, 100)
    return () => clearInterval(t)
  }, [paused, index, go])

  // keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // don't hijack keys while typing in the guestbook
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight') go(index + 1, 1)
      else if (e.key === 'ArrowLeft') go(index - 1, -1)
      else if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, go])

  const C = 2 * Math.PI * 21 // progress ring circumference
  const rsvpIndex = slides.length - 1
  const prevLabel = slides[(index - 1 + slides.length) % slides.length].label
  const nextLabel = slides[(index + 1) % slides.length].label

  return (
    <div className="fixed inset-0 overflow-hidden bg-royal-maroon-deep" style={{ perspective: 1400 }}>
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={slides[index].id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (dx < -50) go(index + 1, 1)
            else if (dx > 50) go(index - 1, -1)
          }}
        >
          {slides[index].node}
        </motion.div>
      </AnimatePresence>

      {/* persistent RSVP button */}
      {index !== rsvpIndex && (
        <motion.button
          type="button"
          onClick={() => go(rsvpIndex, 1)}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="fixed left-1/2 top-4 z-50 inline-flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-[11px] font-medium uppercase tracking-[0.25em] text-royal-maroon-deep shadow-lg transition-transform hover:scale-105 active:scale-95 sm:left-auto sm:right-16 sm:translate-x-0"
          style={{
            background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)',
            boxShadow: '0 8px 24px -8px #c9a227cc',
          }}
        >
          <svg viewBox="0 0 24 22" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M12 6 C 7 -3 -3 3 12 16 C 27 3 17 -3 12 6 Z" />
          </svg>
          RSVP
        </motion.button>
      )}

      <NavDots
        sections={slides.map(({ id, label }) => ({ id, label }))}
        activeId={slides[index].id}
        onSelect={(id) => {
          const i = slides.findIndex((s) => s.id === id)
          if (i !== -1 && i !== index) go(i, i > index ? 1 : -1)
        }}
      />

      {/* ornate edge arrows */}
      <EdgeArrow dir={-1} label={prevLabel} onClick={() => go(index - 1, -1)} />
      <EdgeArrow dir={1} label={nextLabel} onClick={() => go(index + 1, 1)} />

      {/* pause/play with progress ring */}
      <div className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
          className="relative flex h-13 w-13 cursor-pointer items-center justify-center rounded-full border border-royal-gold/60 bg-royal-maroon-deep/85 text-royal-gold-light backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="24" cy="24" r="21" fill="none" stroke="#c9a22733" strokeWidth="2.5" />
            <circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              stroke="#c9a227"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - (paused ? 0 : progress))}
            />
          </svg>
          {paused ? (
            <svg viewBox="0 0 24 24" className="relative h-5 w-5" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="relative h-5 w-5" fill="currentColor">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
