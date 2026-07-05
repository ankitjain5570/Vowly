import { useMemo, useState } from 'react'
import type { RsvpRecord, RsvpStatus } from './rsvpData'
import { RsvpTable } from './RsvpTable'
import { RsvpBoard } from './RsvpBoard'
import { STATUS_META, STATUS_ORDER } from './ui'

type Tab = 'list' | 'board'
type StatusFilter = RsvpStatus | 'all'

/** RSVP dashboard — filters + tabbed List / Kanban views of the same data. */
export function Dashboard({
  records,
  onMove,
}: {
  records: RsvpRecord[]
  onMove: (id: string, status: RsvpStatus) => void
}) {
  const [tab, setTab] = useState<Tab>('list')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.guests.some((g) => g.toLowerCase().includes(q))
      )
    })
  }, [records, query, statusFilter])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl text-royal-ivory">RSVP Dashboard</h1>

        {/* view tabs */}
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
          {(['list', 'board'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                tab === t ? 'text-[#241109]' : 'text-royal-ivory/60 hover:text-royal-ivory'
              }`}
              style={tab === t ? { background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 60%, #C9A227)' } : undefined}
            >
              {t === 'list' ? 'List' : 'Board'}
            </button>
          ))}
        </div>
      </div>

      {/* filters — one row above the data */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-royal-ivory/40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3-3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guests…"
            className="w-full rounded-full border border-white/12 bg-black/30 py-2 pl-9 pr-4 text-sm text-royal-ivory outline-none placeholder:text-royal-ivory/35 focus:border-royal-gold"
          />
        </div>

        <div className="inline-flex flex-wrap gap-1.5">
          <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} label="All" />
          {STATUS_ORDER.map((s) => (
            <FilterPill
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              label={STATUS_META[s].label}
              color={STATUS_META[s].color}
            />
          ))}
        </div>

        <span className="ml-auto text-xs text-royal-ivory/50">
          {filtered.length} of {records.length}
        </span>
      </div>

      {tab === 'list' ? (
        <RsvpTable records={filtered} />
      ) : (
        <RsvpBoard records={filtered} onMove={onMove} />
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors"
      style={{
        borderColor: active ? color ?? '#E8CF7A' : 'rgba(255,255,255,0.12)',
        color: active ? color ?? '#E8CF7A' : 'rgba(253,246,236,0.6)',
        backgroundColor: active ? `${color ?? '#E8CF7A'}1a` : 'transparent',
      }}
    >
      {label}
    </button>
  )
}
