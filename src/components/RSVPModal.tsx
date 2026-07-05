import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { weddingConfig, type WeddingFunction } from '../wedding.config'

const GOLD = '#C9A227'
const GOLD_LIGHT = '#E8CF7A'

interface Guest {
  name: string
  fns: string[]
  /** true once the guest's functions were edited by hand — stops auto-sync */
  touched: boolean
}

/**
 * The RSVP form, shown as a modal over the RSVP slide.
 *
 * Flow: the primary guest enters their name and picks which functions they
 * will attend, then says how many others are joining. Each additional guest
 * inherits the primary's function selection by default (so nobody re-picks
 * per person), but can be adjusted individually.
 *
 * No backend yet — on submit the structured payload is logged and stashed in
 * localStorage. When a database is wired up, only `submit()` needs to change.
 */
export function RSVPModal({
  functions,
  onClose,
}: {
  functions: WeddingFunction[]
  onClose: () => void
}) {
  const allIds = functions.map((f) => f.id)
  const [name, setName] = useState('')
  const [primaryFns, setPrimaryFns] = useState<string[]>(allIds)
  const [guests, setGuests] = useState<Guest[]>([])
  const [submitted, setSubmitted] = useState(false)

  const togglePrimary = (id: string) => {
    setPrimaryFns((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      // keep un-customized guests in sync with the primary's picks
      setGuests((gs) => gs.map((g) => (g.touched ? g : { ...g, fns: next })))
      return next
    })
  }

  const setCount = (n: number) => {
    const clamped = Math.max(0, Math.min(15, n))
    setGuests((prev) => {
      const next = prev.slice(0, clamped)
      while (next.length < clamped) {
        next.push({ name: '', fns: [...primaryFns], touched: false })
      }
      return next
    })
  }

  const setGuestName = (i: number, v: string) =>
    setGuests((gs) => gs.map((g, idx) => (idx === i ? { ...g, name: v } : g)))

  const toggleGuestFn = (i: number, id: string) =>
    setGuests((gs) =>
      gs.map((g, idx) => {
        if (idx !== i) return g
        const has = g.fns.includes(id)
        return { ...g, touched: true, fns: has ? g.fns.filter((x) => x !== id) : [...g.fns, id] }
      }),
    )

  const canSubmit = name.trim().length > 0 && primaryFns.length > 0

  const submit = () => {
    const payload = {
      primary: { name: name.trim(), functions: primaryFns },
      guests: guests.map((g, i) => ({
        name: g.name.trim() || `Guest ${i + 2}`,
        functions: g.fns,
      })),
      totalHeadcount: 1 + guests.length,
      hashtag: weddingConfig.hashtag,
      submittedAt: new Date().toISOString(),
    }
    // TODO: replace with a POST to the RSVP backend (e.g. Supabase) later.
    console.log('RSVP submitted:', payload)
    try {
      localStorage.setItem('wedding_rsvp', JSON.stringify(payload))
    } catch {
      /* ignore storage errors */
    }
    setSubmitted(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6 text-royal-ivory shadow-2xl sm:p-8"
          style={{
            borderColor: `${GOLD}66`,
            background: 'linear-gradient(160deg, #3A0D18 0%, #24070e 60%, #16030a 100%)',
            boxShadow: `0 40px 90px -30px #000e, 0 0 50px -20px ${GOLD}55`,
          }}
        >
          {/* close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close RSVP form"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border text-royal-gold-light transition-colors hover:bg-white/10"
            style={{ borderColor: `${GOLD}70` }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {submitted ? (
            <div className="py-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 16 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2"
                style={{ borderColor: GOLD, color: GOLD_LIGHT }}
              >
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="font-heading text-3xl text-royal-gold-light">Thank you!</h3>
              <p className="mx-auto mt-3 max-w-sm text-sm font-light text-royal-ivory/80">
                Your RSVP for {1 + guests.length}{' '}
                {1 + guests.length === 1 ? 'guest' : 'guests'} has been noted. We can’t wait to
                celebrate with you.
              </p>
              <p className="mt-3 text-xs tracking-[0.3em]" style={{ color: GOLD }}>
                {weddingConfig.hashtag}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-7 rounded-full px-8 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-royal-maroon-deep"
                style={{ background: `linear-gradient(120deg, ${GOLD_LIGHT}, ${GOLD})` }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 text-center">
                <h3 className="font-heading text-3xl text-royal-gold-light sm:text-4xl">
                  RSVP
                </h3>
                <p className="mt-1 text-xs font-light text-royal-ivory/70">
                  Tell us who’s coming, and to which celebrations.
                </p>
              </div>

              {/* primary guest */}
              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>
                  Your name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border bg-black/25 px-4 py-2.5 text-sm text-royal-ivory placeholder:text-royal-ivory/35 focus:outline-none"
                  style={{ borderColor: '#ffffff26' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = `${GOLD}90`)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#ffffff26')}
                />
              </label>

              <div className="mt-4">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>
                  Which celebrations will you attend?
                </span>
                <FnChips functions={functions} selected={primaryFns} onToggle={togglePrimary} />
              </div>

              {/* party size */}
              <div className="mt-6 flex items-center justify-between rounded-lg border p-3" style={{ borderColor: '#ffffff20', backgroundColor: '#ffffff08' }}>
                <div>
                  <p className="text-sm font-medium text-royal-ivory/95">Guests joining you</p>
                  <p className="text-xs font-light text-royal-ivory/60">Not counting yourself</p>
                </div>
                <div className="flex items-center gap-3">
                  <Stepper label="−" onClick={() => setCount(guests.length - 1)} disabled={guests.length === 0} />
                  <span className="w-6 text-center font-heading text-2xl" style={{ color: GOLD_LIGHT }}>
                    {guests.length}
                  </span>
                  <Stepper label="+" onClick={() => setCount(guests.length + 1)} disabled={guests.length >= 15} />
                </div>
              </div>

              {/* additional guests */}
              <AnimatePresence initial={false}>
                {guests.map((g, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="rounded-lg border p-3" style={{ borderColor: '#ffffff20', backgroundColor: '#ffffff08' }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-royal-maroon-deep"
                          style={{ backgroundColor: GOLD_LIGHT }}
                        >
                          {i + 2}
                        </span>
                        <input
                          type="text"
                          value={g.name}
                          onChange={(e) => setGuestName(i, e.target.value)}
                          placeholder={`Guest ${i + 2} name`}
                          className="w-full rounded-md border bg-black/25 px-3 py-2 text-sm text-royal-ivory placeholder:text-royal-ivory/35 focus:outline-none"
                          style={{ borderColor: '#ffffff20' }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = `${GOLD}90`)}
                          onBlur={(e) => (e.currentTarget.style.borderColor = '#ffffff20')}
                        />
                      </div>
                      <div className="mt-2.5 pl-8">
                        <FnChips
                          functions={functions}
                          selected={g.fns}
                          onToggle={(id) => toggleGuestFn(i, id)}
                          small
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className={`mt-6 w-full rounded-full py-3 text-sm font-medium uppercase tracking-[0.2em] text-royal-maroon-deep transition-transform ${
                  canSubmit ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : 'cursor-not-allowed opacity-50'
                }`}
                style={{ background: `linear-gradient(120deg, ${GOLD_LIGHT}, ${GOLD} 60%, #8C6D12)` }}
              >
                Send RSVP · {1 + guests.length} {1 + guests.length === 1 ? 'guest' : 'guests'}
              </button>
              {!canSubmit && (
                <p className="mt-2 text-center text-[11px] text-royal-ivory/50">
                  Add your name and pick at least one celebration.
                </p>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Stepper({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label === '+' ? 'Add a guest' : 'Remove a guest'}
      className="flex h-8 w-8 items-center justify-center rounded-full border text-lg leading-none text-royal-gold-light transition-colors enabled:hover:bg-white/10 disabled:opacity-30"
      style={{ borderColor: `${GOLD}70` }}
    >
      {label}
    </button>
  )
}

function FnChips({
  functions,
  selected,
  onToggle,
  small,
}: {
  functions: WeddingFunction[]
  selected: string[]
  onToggle: (id: string) => void
  small?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {functions.map((f) => {
        const on = selected.includes(f.id)
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onToggle(f.id)}
            aria-pressed={on}
            className={`rounded-full border tracking-wide transition-colors ${
              small ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-1.5 text-xs'
            }`}
            style={
              on
                ? { borderColor: GOLD, background: `linear-gradient(120deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#3A0D18' }
                : { borderColor: '#ffffff30', color: '#fdf6eccc', backgroundColor: '#ffffff08' }
            }
          >
            {on && '✓ '}
            {f.name}
          </button>
        )
      })}
    </div>
  )
}
