import { useEffect, useState } from 'react'

interface Remaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function remainingTo(targetISO: string): Remaining | null {
  const diff = new Date(targetISO).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1_000) % 60,
  }
}

/** Live countdown to a config datetime; shows a celebration line once past. */
export function Countdown({ targetISO, color }: { targetISO: string; color: string }) {
  const [left, setLeft] = useState<Remaining | null>(() => remainingTo(targetISO))

  useEffect(() => {
    const t = setInterval(() => setLeft(remainingTo(targetISO)), 1000)
    return () => clearInterval(t)
  }, [targetISO])

  if (!left) {
    return (
      <p className="font-heading text-2xl italic" style={{ color }}>
        The celebrations have begun!
      </p>
    )
  }

  const cells: Array<[number, string]> = [
    [left.days, 'Days'],
    [left.hours, 'Hours'],
    [left.minutes, 'Mins'],
    [left.seconds, 'Secs'],
  ]

  return (
    <div className="flex items-stretch justify-center gap-2 sm:gap-4">
      {cells.map(([value, label], i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-4">
          {i > 0 && (
            <span className="font-heading text-2xl opacity-40" style={{ color }}>
              ·
            </span>
          )}
          <div className="min-w-14 text-center sm:min-w-16">
            <div
              className="font-heading text-3xl font-semibold tabular-nums sm:text-4xl"
              style={{ color }}
            >
              {String(value).padStart(2, '0')}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.25em] opacity-60">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
