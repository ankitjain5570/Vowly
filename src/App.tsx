import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { weddingConfig } from './wedding.config'
import { EntryScreen } from './components/EntryScreen'
import { InviteCarousel } from './components/Carousel'

function App() {
  // Always begin on the invitation book — every page load / refresh opens
  // from the start (no "already visited" shortcut).
  const [entryCompleted, setEntryCompleted] = useState<boolean>(false)

  // `musicOn` is the single source of truth for whether music SHOULD play.
  // The mute button flips it; an effect syncs the actual <audio> to match, so
  // nothing (including pending autoplay-resume listeners) can restart audio
  // the guest has muted.
  const [musicOn, setMusicOn] = useState<boolean>(false)
  const [transitionState, setTransitionState] = useState<'idle' | 'fading-in' | 'fading-out'>('idle')

  // 2. Audio object initialization
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Live mirror of `musicOn` so listeners never read a stale intent (e.g. the
  // very tap that mutes must not also re-trigger a pending autoplay-resume).
  const musicOnRef = useRef(musicOn)
  musicOnRef.current = musicOn

  useEffect(() => {
    const audio = new Audio(weddingConfig.music)
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  // Sync the audio element to the `musicOn` intent.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!musicOn) {
      audio.pause()
      return
    }

    // Try to play; if the browser blocks it (no user gesture yet), start on
    // the first interaction — but only while the guest still wants music.
    const resume = () => {
      cleanup()
      if (musicOnRef.current) audio.play().catch(() => {})
    }
    const cleanup = () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
      window.removeEventListener('touchstart', resume)
    }

    audio.play().catch(() => {
      window.addEventListener('pointerdown', resume)
      window.addEventListener('keydown', resume)
      window.addEventListener('touchstart', resume)
    })

    return cleanup
  }, [musicOn])

  const toggleMusic = useCallback(() => setMusicOn((on) => !on), [])

  // Called from the book-opening tap — a real user gesture, so play()
  // succeeds immediately instead of waiting for the autoplay fallback.
  const startMusic = useCallback(() => {
    setMusicOn(true)
    audioRef.current?.play().catch(() => {})
  }, [])

  // 3. Golden transition handler
  const triggerGoldenTransition = useCallback(() => {
    setTransitionState('fading-in')
    setTimeout(() => {
      // Reveal the carousel (the book has finished opening)
      setEntryCompleted(true)

      // Reset scroll position so the user starts at the top of the first slide
      window.scrollTo({ top: 0, behavior: 'auto' })

      setTransitionState('fading-out')
      setTimeout(() => {
        setTransitionState('idle')
      }, 600)
    }, 400)
  }, [])

  // 4. Turn music on once the invitation opens (the sync effect handles the
  // actual playback + autoplay-block fallback).
  useEffect(() => {
    if (entryCompleted) setMusicOn(true)
  }, [entryCompleted])

  const handleReplay = useCallback(() => {
    setMusicOn(false)
    setEntryCompleted(false)
    // Scroll smoothly back to top where entry screen will show
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }, [])

  return (
    <>
      <main>
        {!entryCompleted ? (
          <EntryScreen onOpen={startMusic} onTransitionTrigger={triggerGoldenTransition} />
        ) : (
          <InviteCarousel onReplayEntry={handleReplay} />
        )}
      </main>

      {/* Floating music toggle button (persistent across all sections) */}
      <button
        onClick={toggleMusic}
        aria-label={musicOn ? 'Mute background music' : 'Unmute background music'}
        className="fixed bottom-6 right-6 z-[999] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-royal-gold bg-royal-maroon-deep/90 text-royal-gold shadow-lg shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-royal-gold-light active:scale-95"
      >
        {musicOn ? (
          <div className="flex items-end gap-[3px] h-4">
            <span className="w-[3px] rounded-full bg-royal-gold-light animate-equalizer-bar-1" />
            <span className="w-[3px] rounded-full bg-royal-gold-light animate-equalizer-bar-2" />
            <span className="w-[3px] rounded-full bg-royal-gold-light animate-equalizer-bar-3" />
            <span className="w-[3px] rounded-full bg-royal-gold-light animate-equalizer-bar-4" />
          </div>
        ) : (
          <svg
            className="h-5 w-5 text-royal-gold-light/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z"
            />
          </svg>
        )}
      </button>

      {/* 1s Golden Fade Transition Overlay */}
      <AnimatePresence>
        {transitionState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: transitionState === 'fading-in' ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionState === 'fading-in' ? 0.4 : 0.6 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-royal-maroon-deep via-royal-maroon to-royal-gold-light text-royal-ivory"
          >
            <div className="text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 animate-pulse text-royal-gold-light"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <path
                  d="M50 20 L53 35 L68 38 L55 48 L60 63 L50 53 L40 63 L45 48 L32 38 L47 35 Z"
                  fill="currentColor"
                />
              </svg>
              <h2 className="font-heading text-3xl tracking-[0.2em] text-royal-gold-light">
                Welcome to the Celebration
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-royal-ivory/70">
                {weddingConfig.couple.bride} &amp; {weddingConfig.couple.groom}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App

