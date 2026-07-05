import type { RsvpStatus } from './rsvpData'
import { functionName } from './rsvpData'

/**
 * Status palette — reserved for state, never reused for categorical series.
 * Each status always ships with an icon + label, so meaning is never carried
 * by color alone (colorblind- and print-safe).
 */
export const STATUS_META: Record<
  RsvpStatus,
  { label: string; color: string; tint: string; icon: string }
> = {
  confirmed: { label: 'Confirmed', color: '#57BD8A', tint: 'rgba(87,189,138,0.14)', icon: '✓' },
  pending: { label: 'Pending', color: '#E3B24C', tint: 'rgba(227,178,76,0.14)', icon: '◷' },
  declined: { label: 'Declined', color: '#E0736B', tint: 'rgba(224,115,107,0.14)', icon: '✕' },
}

export const STATUS_ORDER: RsvpStatus[] = ['pending', 'confirmed', 'declined']

export function StatusBadge({ status }: { status: RsvpStatus }) {
  const m = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{ color: m.color, borderColor: `${m.color}66`, backgroundColor: m.tint }}
    >
      <span aria-hidden="true">{m.icon}</span>
      {m.label}
    </span>
  )
}

export function FunctionChips({ ids, max }: { ids: string[]; max?: number }) {
  const shown = max ? ids.slice(0, max) : ids
  const extra = max ? ids.length - shown.length : 0
  return (
    <span className="flex flex-wrap gap-1">
      {shown.map((id) => (
        <span
          key={id}
          className="rounded border border-royal-gold/25 bg-royal-gold/10 px-1.5 py-0.5 text-[11px] text-royal-gold-light"
        >
          {functionName(id)}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded border border-white/15 px-1.5 py-0.5 text-[11px] text-royal-ivory/55">
          +{extra}
        </span>
      )}
    </span>
  )
}
