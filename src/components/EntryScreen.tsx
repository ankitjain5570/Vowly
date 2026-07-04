import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { weddingConfig } from '../wedding.config'
import { BackgroundPattern } from '../theme/patterns'

interface EntryScreenProps {
  showCover: boolean
  setShowCover: (show: boolean) => void
  audioElement: HTMLAudioElement | null
  onTransitionTrigger: () => void
}

/**
 * Opening full-screen section: invitation cover with custom monogram,
 * preloaded background video backdrop, separate background music track,
 * and 1s transition scroll triggers.
 */
export function EntryScreen({
  showCover,
  setShowCover,
  audioElement,
  onTransitionTrigger,
}: EntryScreenProps) {
  const { couple, tagline, hashtag } = weddingConfig
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [showSkip, setShowSkip] = useState(false)

  // 1. Play video when cover is dismissed
  useEffect(() => {
    if (!showCover && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch((err) => {
        console.error('Video autoplay failed or blocked:', err)
        // Skip directly to the main content if the video fails to play
        onTransitionTrigger()
      })
    }
  }, [showCover, onTransitionTrigger])

  // 2. Show Skip button after 2 seconds of video playback
  useEffect(() => {
    if (!showCover) {
      const timer = setTimeout(() => {
        setShowSkip(true)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setShowSkip(false)
    }
  }, [showCover])

  const handleOpenInvitation = () => {
    // Attempt to play background music to satisfy user gesture policy
    if (audioElement) {
      audioElement.play().catch((err) => {
        console.warn('Audio autoplay blocked or failed:', err)
      })
    }
    // Fade out cover, displaying and playing the video
    setShowCover(false)
  }

  return (
    <section
      id="entry"
      className="invite-section flex items-center justify-center bg-black text-royal-ivory"
    >
      {/* Background preloaded video */}
      <div className="absolute inset-0 h-full w-full bg-black">
        <video
          ref={videoRef}
          src={weddingConfig.entryVideo}
          preload="auto"
          muted
          playsInline
          className="h-full w-full object-cover"
          onEnded={onTransitionTrigger}
          onError={(e) => {
            console.error('Video load failed:', e)
            onTransitionTrigger()
          }}
        />
        
        {/* Soft overlay on video for cinematic style and contrast */}
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />

        {/* Skip button for impatient guests */}
        <AnimatePresence>
          {showSkip && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={onTransitionTrigger}
              className="absolute bottom-10 right-6 z-30 inline-flex items-center gap-1.5 rounded-full border border-royal-gold/45 bg-black/45 px-5 py-2 text-xs uppercase tracking-[0.2em] text-royal-gold-light backdrop-blur-md transition-all duration-300 hover:bg-royal-gold hover:text-royal-maroon-deep cursor-pointer active:scale-95"
            >
              Skip
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Elegant Invitation Cover */}
      <AnimatePresence>
        {showCover && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-royal-maroon-deep text-royal-ivory px-6 text-center"
          >
            <BackgroundPattern pattern="mandala" color="#e8cf7a" opacity={0.08} />

            {/* Custom Monogram */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="mb-8"
            >
              <svg
                className="h-28 w-28 mx-auto text-royal-gold"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Dotted border */}
                <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.5" />
                {/* Inner double line border */}
                <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
                
                {/* Monogram Flourishes */}
                <path d="M50 3 L52.5 8 L50 13 L47.5 8 Z" fill="currentColor" />
                <path d="M50 97 L52.5 92 L50 87 L47.5 92 Z" fill="currentColor" />
                <path d="M3 50 L8 52.5 L13 50 L8 47.5 Z" fill="currentColor" />
                <path d="M97 50 L92 52.5 L87 50 L92 47.5 Z" fill="currentColor" />
                
                {/* Initials Text */}
                <text
                  x="50"
                  y="59"
                  textAnchor="middle"
                  fill="#e8cf7a"
                  fontSize="28"
                  fontFamily="Cormorant Garamond, Georgia, serif"
                  letterSpacing="1"
                  fontWeight="300"
                >
                  {`${couple.bride.charAt(0)}&${couple.groom.charAt(0)}`}
                </text>
              </svg>
            </motion.div>

            {/* Bride & Groom names and tagline */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-xl"
            >
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-royal-gold-light">
                Together with their families
              </p>
              <h1 className="text-5xl leading-tight sm:text-6.5xl font-heading text-royal-ivory">
                {couple.bride}
                <span className="mx-3 font-heading italic text-royal-gold sm:mx-4.5">&amp;</span>
                {couple.groom}
              </h1>
              <div className="mx-auto my-6 h-px w-20 bg-royal-gold/40" />
              <p className="mx-auto max-w-md text-sm font-light text-royal-ivory/80 leading-relaxed italic">
                {tagline}
              </p>
              <p className="mt-6 text-xs uppercase tracking-[0.25em] text-royal-gold/80">{hashtag}</p>
            </motion.div>

            {/* Tap Gesture to Unlock Autoplay */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="mt-10"
            >
              <button
                onClick={handleOpenInvitation}
                className="relative inline-flex items-center justify-center px-9 py-4 border border-royal-gold bg-transparent text-royal-gold font-body text-xs uppercase tracking-[0.25em] cursor-pointer overflow-hidden transition-all duration-300 hover:text-royal-maroon-deep hover:bg-royal-gold hover:scale-105 active:scale-95 group shadow-md"
              >
                <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-royal-gold-light group-hover:border-royal-maroon-deep" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-royal-gold-light group-hover:border-royal-maroon-deep" />
                <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-royal-gold-light group-hover:border-royal-maroon-deep" />
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-royal-gold-light group-hover:border-royal-maroon-deep" />
                Open Invitation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

