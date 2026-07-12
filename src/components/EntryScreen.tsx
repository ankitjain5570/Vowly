import { useState } from 'react'
import { motion } from 'framer-motion'
import { weddingConfig } from '../wedding.config'
import { requestTiltPermission } from '../hooks/useTilt'
import { GodRays, GoldDust, PalaceSilhouette } from './royal'

interface EntryScreenProps {
  /** Called on the opening tap (a user gesture) — App starts the music here */
  onOpen: () => void
  /** Called when the opening animation finishes — App dissolves this screen
   *  away over the carousel's first slide */
  onTransitionTrigger: () => void
}

/** Deterministic pseudo-random in [0,1). */
function prand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Marigold petals + gold sparkles that burst when the book opens. */
function OpeningBurst() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {/* petals raining from the top */}
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.svg
          key={`p${i}`}
          viewBox="0 0 20 20"
          style={{
            position: 'absolute',
            left: `${prand(i, 1) * 100}%`,
            top: -30,
            width: 12 + prand(i, 2) * 12,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0.6], rotate: 200 + prand(i, 3) * 300 }}
          transition={{ duration: 2.6 + prand(i, 4) * 1.6, delay: prand(i, 5) * 0.7, ease: 'easeIn' }}
        >
          {Array.from({ length: 6 }).map((_, p) => {
            const a = (p * Math.PI) / 3
            return (
              <circle
                key={p}
                cx={10 + 5 * Math.cos(a)}
                cy={10 + 5 * Math.sin(a)}
                r="4"
                fill={p % 2 ? '#F5A623' : '#E9A319'}
                opacity="0.85"
              />
            )
          })}
          <circle cx="10" cy="10" r="3" fill="#FFD95E" />
        </motion.svg>
      ))}
      {/* sparkle ring radiating from the book */}
      <div className="absolute left-1/2 top-1/2">
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i * 2 * Math.PI) / 14
          return (
            <motion.span
              key={`s${i}`}
              className="absolute h-2 w-2 rotate-45"
              style={{ backgroundColor: i % 2 ? '#E8CF7A' : '#F5E08A' }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: Math.cos(a) * (130 + (i % 3) * 50),
                y: Math.sin(a) * (130 + (i % 3) * 50),
                opacity: [0, 1, 0],
                scale: [0, 1.4, 0.2],
              }}
              transition={{ duration: 1.3, delay: 0.5, ease: 'easeOut' }}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Opening screen: the invitation as a closed royal book. Tapping it swings
 * the cover open (3D page turn) over a burst of marigold petals and gold
 * sparkles, then hands off to the golden transition → carousel.
 *
 * This screen is common to every invite variant — permutation links all
 * open the same book and land on their own first slide.
 */
export function EntryScreen({ onOpen, onTransitionTrigger }: EntryScreenProps) {
  const { couple, tagline, hashtag } = weddingConfig
  const [opening, setOpening] = useState(false)
  const initials = `${couple.bride.charAt(0)}&${couple.groom.charAt(0)}`

  const handleOpen = () => {
    if (opening) return
    onOpen() // user gesture → music starts here
    requestTiltPermission() // same gesture unlocks the gyroscope parallax on iOS
    setOpening(true)
    // cover swing (~2.05s) + a beat to take in the inner page, then App
    // dissolves this screen into the first slide
    setTimeout(onTransitionTrigger, 2600)
  }

  return (
    <section
      id="entry"
      className="invite-section flex items-center justify-center text-royal-ivory"
      style={{ background: 'radial-gradient(ellipse at 50% 32%, #4A121F 0%, #16030a 74%)' }}
    >
      <GodRays />
      <PalaceSilhouette windows="#E8CF7A" />
      <GoldDust />
      <div className="vignette" />

      {opening && <OpeningBurst />}

      <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-5">
        {/* Ganesha — an auspicious blessing atop the invitation */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
        >
          {/* divine halo glow */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-40 sm:w-40 lg:h-48 lg:w-48"
            style={{ background: 'radial-gradient(circle, rgba(232,207,122,0.4), transparent 65%)', filter: 'blur(6px)' }}
          />
          <motion.img
            src="/media/ganesha.png"
            alt="Lord Ganesha"
            className="h-24 w-24 object-contain sm:h-28 sm:w-28 lg:h-32 lg:w-32"
            style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.55))' }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* The invitation book */}
        <motion.button
          type="button"
          onClick={handleOpen}
          aria-label="Open the wedding invitation"
          className="relative block cursor-pointer"
          style={{ perspective: 2000 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
        >
        <motion.div
          className="relative h-105 w-72 sm:h-120 sm:w-80 lg:h-140 lg:w-94"
          animate={opening ? { y: 0 } : { y: [0, -8, 0] }}
          transition={
            opening ? { duration: 0.3 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* -------- inner page (revealed when the cover opens) -------- */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-r-xl border border-[#D8C49A] px-6 text-center"
            style={{
              background: 'linear-gradient(160deg, #FBF3E4, #F0E2C4)',
              boxShadow: 'inset 0 0 40px #0002',
            }}
          >
            <div className="pointer-events-none absolute inset-2 rounded-r-lg border border-[#C9A227]/50" />
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#8A6A3B]">
              Together with their families
            </p>
            <p className="mt-3 font-heading text-4xl text-[#6B1F2F] sm:text-5xl lg:text-6xl">
              {couple.bride}
              <span className="mx-2 italic text-[#C9A227]">&amp;</span>
              {couple.groom}
            </p>
            <div className="mx-auto my-4 flex w-32 items-center gap-2">
              <span className="h-px flex-1 bg-[#C9A227]/60" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
              <span className="h-px flex-1 bg-[#C9A227]/60" />
            </div>
            <p className="max-w-55 text-xs font-light italic leading-relaxed text-[#6B4A2F] lg:max-w-72 lg:text-sm">
              {tagline}
            </p>
            <p className="mt-4 text-[10px] tracking-[0.3em] text-[#C9A227]">{hashtag}</p>
          </div>

          {/* -------- front cover (swings open on tap) -------- */}
          <motion.div
            className="absolute inset-0"
            style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
            animate={{ rotateY: opening ? -152 : 0 }}
            transition={{ duration: 1.9, delay: opening ? 0.15 : 0, ease: [0.65, 0, 0.35, 1] }}
          >
            {/* cover front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-between rounded-r-xl border py-8"
              style={{
                backfaceVisibility: 'hidden',
                borderColor: '#C9A22799',
                background: 'linear-gradient(150deg, #5C1626 0%, #3A0D18 55%, #24070e 100%)',
                boxShadow: '0 30px 80px -25px #000d, 0 0 45px -18px #C9A22766',
              }}
            >
              <div className="pointer-events-none absolute inset-2.5 rounded-r-lg border border-royal-gold/50" />
              <div className="pointer-events-none absolute inset-4 rounded-r-md border border-royal-gold/25" />
              {/* spine highlight */}
              <span className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-sm bg-gradient-to-r from-black/50 to-transparent" />

              <p className="text-[9px] uppercase tracking-[0.4em] text-royal-gold-light/80">
                Wedding Invitation
              </p>

              {/* mandala monogram */}
              <div className="relative flex items-center justify-center">
                <motion.svg
                  viewBox="0 0 120 120"
                  className="h-36 w-36 text-royal-gold sm:h-40 sm:w-40 lg:h-52 lg:w-52"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                >
                  <g fill="none" stroke="currentColor">
                    <circle cx="60" cy="60" r="54" strokeWidth="0.8" strokeDasharray="3 5" />
                    <circle cx="60" cy="60" r="45" strokeWidth="1" />
                    {Array.from({ length: 16 }).map((_, i) => {
                      const a = (i * Math.PI) / 8
                      return (
                        <path
                          key={i}
                          d={`M${60 + 45 * Math.cos(a)} ${60 + 45 * Math.sin(a)} L${60 + 52 * Math.cos(a)} ${60 + 52 * Math.sin(a)}`}
                          strokeWidth="1"
                          opacity="0.8"
                        />
                      )
                    })}
                  </g>
                </motion.svg>
                <span className="absolute font-heading text-3xl italic text-royal-gold-light sm:text-4xl lg:text-5xl">
                  {initials}
                </span>
              </div>

              <div className="px-6 text-center">
                <p className="font-heading text-2xl text-royal-ivory sm:text-3xl lg:text-4xl">
                  {couple.bride} <span className="italic text-royal-gold">&amp;</span>{' '}
                  {couple.groom}
                </p>
                <motion.p
                  className="mt-4 text-[10px] uppercase tracking-[0.35em] text-royal-gold-light"
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ✦ Tap to open ✦
                </motion.p>
              </div>
            </div>

            {/* inside of the cover (visible mid-swing) */}
            <div
              className="absolute inset-0 rounded-l-xl border border-[#D8C49A]"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(200deg, #F3E7CE, #E4D2AC)',
              }}
            >
              <div className="pointer-events-none absolute inset-2 rounded-l-lg border border-[#C9A227]/40" />
            </div>
          </motion.div>
        </motion.div>
        </motion.button>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Entry video (disabled for now — the invitation opens as a book instead).
 * To bring the video back: restore the props/state below and render this
 * block in place of the book, playing weddingConfig.entryVideo.
 *
 * const videoRef = useRef<HTMLVideoElement | null>(null)
 * const [showSkip, setShowSkip] = useState(false)
 *
 * <div className="absolute inset-0 h-full w-full bg-black">
 *   <video
 *     ref={videoRef}
 *     src={weddingConfig.entryVideo}
 *     preload="auto"
 *     muted
 *     playsInline
 *     className="h-full w-full object-cover"
 *     onEnded={onTransitionTrigger}
 *     onError={() => onTransitionTrigger()}
 *   />
 *   <div className="absolute inset-0 bg-black/35 pointer-events-none" />
 *   {showSkip && (
 *     <button
 *       onClick={onTransitionTrigger}
 *       className="absolute bottom-10 right-6 z-30 rounded-full border border-royal-gold/45
 *                  bg-black/45 px-5 py-2 text-xs uppercase tracking-[0.2em]
 *                  text-royal-gold-light backdrop-blur-md"
 *     >
 *       Skip
 *     </button>
 *   )}
 * </div>
 * ------------------------------------------------------------------------- */
