import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { weddingConfig } from './wedding.config'
import { EntryScreen } from './components/EntryScreen'
import { InviteCarousel } from './components/Carousel'

function App() {
  // Always begin on the invitation book — every page load / refresh opens
  // from the start (no "already visited" shortcut).
  const [entryCompleted, setEntryCompleted] = useState<boolean>(false)

  // `musicOn` is the single source of truth for whether music SHOULD play,
  // and ONLY the mute button changes it — nothing else may flip it back on,
  // or the guest's mute gets overridden (that was a real bug: the entry
  // hand-off used to force music on, undoing a mute tapped moments earlier).
  //
  // Music is ON by default from the very first visit. Browsers block
  // autoplay until a user gesture, so the sync effect's fallback starts
  // playback on the first tap/keypress — in practice the "tap to open".
  const [musicOn, setMusicOn] = useState<boolean>(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Live mirror of `musicOn` so listeners never read a stale intent (e.g. the
  // very tap that mutes must not also re-trigger a pending autoplay-resume).
  const musicOnRef = useRef(musicOn)
  musicOnRef.current = musicOn

  useEffect(() => {
    // Self-healing singleton: if a previous player instance is still alive
    // (dev HMR remounts, a duplicated mount), silence it before creating the
    // new one — otherwise a "phantom" track keeps playing that the mute
    // button no longer controls.
    const w = window as unknown as { __weddingAudio?: HTMLAudioElement }
    w.__weddingAudio?.pause()

    const audio = new Audio(weddingConfig.music)
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio
    w.__weddingAudio = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  // Sync the audio element to the `musicOn` intent.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Hard guarantee: even if some in-flight play() lands after a mute (a
    // pending promise, a stray resume listener), a muted element is silent.
    audio.muted = !musicOn

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

  // Pause music whenever the page goes to the background (tab switch, app
  // switch, screen lock) and resume on return — but only if the guest still
  // wants music on. `pagehide` covers iOS Safari, which can skip
  // visibilitychange when the browser is closed or the user navigates away.
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) audio.pause()
      else if (musicOnRef.current) audio.play().catch(() => {})
    }
    const onPageHide = () => audioRef.current?.pause()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [])

  // Flip the intent AND act on the element immediately, inside the click
  // gesture itself: muting must never depend on effect timing, and calling
  // play() here (a user gesture) always satisfies the autoplay policy.
  const toggleMusic = useCallback(() => {
    const next = !musicOnRef.current
    musicOnRef.current = next
    const audio = audioRef.current
    if (audio) {
      audio.muted = !next
      if (next) audio.play().catch(() => {})
      else audio.pause()
    }
    setMusicOn(next)
  }, [])

  // Called from the book-opening tap — a real user gesture, so play()
  // succeeds immediately instead of waiting for the autoplay fallback.
  // Respects the mute button: if the guest muted, opening stays silent.
  const startMusic = useCallback(() => {
    if (musicOnRef.current) audioRef.current?.play().catch(() => {})
  }, [])

  // The book has finished opening — mount the carousel underneath; the
  // entry screen then dissolves away over it (AnimatePresence exit below).
  const revealInvitation = useCallback(() => {
    setEntryCompleted(true)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const handleReplay = useCallback(() => {
    setEntryCompleted(false)
    // Scroll smoothly back to top where entry screen will show
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }, [])

  return (
    <>
      <main>
        {entryCompleted && <InviteCarousel onReplayEntry={handleReplay} />}

        {/* The entry screen sits above the carousel and, once the book has
            opened, dissolves into it — a slow fade with a gentle drift
            forward, so the first slide's own entrance plays underneath. */}
        <AnimatePresence>
          {!entryCompleted && (
            <motion.div
              key="entry"
              className="fixed inset-0 z-[100] overflow-hidden"
              exit={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <EntryScreen onOpen={startMusic} onTransitionTrigger={revealInvitation} />
            </motion.div>
          )}
        </AnimatePresence>
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
    </>
  )
}

export default App
