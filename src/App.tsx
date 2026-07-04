import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { weddingConfig } from './wedding.config'
import { EntryScreen } from './components/EntryScreen'
import { InviteCarousel } from './components/Carousel'

function App() {
  // 1. Revisit check & state management
  const [entryCompleted, setEntryCompleted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wedding_invite_visited') === 'true'
    }
    return false
  })

  const [showCover, setShowCover] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wedding_invite_visited') !== 'true'
    }
    return true
  })

  const [musicPlaying, setMusicPlaying] = useState<boolean>(false)
  const [transitionState, setTransitionState] = useState<'idle' | 'fading-in' | 'fading-out'>('idle')

  // 2. Audio object initialization
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(weddingConfig.music)
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio

    const handlePlay = () => setMusicPlaying(true)
    const handlePause = () => setMusicPlaying(false)
    
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.pause()
      audioRef.current = null
    }
  }, [])

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Audio playback failed:', err)
      })
    }
  }, [musicPlaying])

  // 3. Golden transition handler
  const triggerGoldenTransition = useCallback(() => {
    setTransitionState('fading-in')
    setTimeout(() => {
      // Unmount the cover & video layout by setting entryCompleted = true
      setEntryCompleted(true)
      localStorage.setItem('wedding_invite_visited', 'true')
      
      // Reset scroll position so the user starts at the top of the Engagement section
      window.scrollTo({ top: 0, behavior: 'auto' })

      setTransitionState('fading-out')
      setTimeout(() => {
        setTransitionState('idle')
      }, 600)
    }, 400)
  }, [])

  // 4. Autoplay music once the invitation is open. Browsers block autoplay
  // without a user gesture (e.g. returning visitors who skip the cover), so
  // if play() is rejected we start on the first interaction instead.
  useEffect(() => {
    if (!entryCompleted) return
    const audio = audioRef.current
    if (!audio || !audio.paused) return

    const resume = () => {
      audio.play().catch(() => {})
      cleanup()
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
  }, [entryCompleted])

  const handleReplay = useCallback(() => {
    // Pause background music before replaying
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setEntryCompleted(false)
    setShowCover(true)
    // Scroll smoothly back to top where entry screen will show
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }, [])

  return (
    <>
      <main>
        {!entryCompleted ? (
          <EntryScreen
            showCover={showCover}
            setShowCover={setShowCover}
            audioElement={audioRef.current}
            onTransitionTrigger={triggerGoldenTransition}
          />
        ) : (
          <InviteCarousel onReplayEntry={handleReplay} />
        )}
      </main>

      {/* Floating music toggle button (persistent across all sections) */}
      <button
        onClick={toggleMusic}
        aria-label={musicPlaying ? 'Mute background music' : 'Unmute background music'}
        className="fixed bottom-6 right-6 z-[999] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-royal-gold bg-royal-maroon-deep/90 text-royal-gold shadow-lg shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-royal-gold-light active:scale-95"
      >
        {musicPlaying ? (
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

