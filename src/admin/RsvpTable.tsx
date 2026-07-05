import { useState } from 'react'
import type { RsvpRecord } from './rsvpData'
import { FunctionChips, StatusBadge } from './ui'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

type SortKey = 'name' | 'partySize' | 'submittedAt'

/** List view — a sortable table of RSVPs. */
export function RsvpTable({ records }: { records: RsvpRecord[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: 'submittedAt',
    dir: -1,
  })

  const sorted = [...records].sort((a, b) => {
    const av = a[sort.key]
    const bv = b[sort.key]
    if (av < bv) return -1 * sort.dir
    if (av > bv) return 1 * sort.dir
    return 0
  })

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }))

  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : '')

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.15em] text-royal-ivory/55">
            <th className="cursor-pointer px-4 py-3 select-none" onClick={() => toggle('name')}>
              Guest{arrow('name')}
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-center select-none"
              onClick={() => toggle('partySize')}
            >
              Party{arrow('partySize')}
            </th>
            <th className="px-4 py-3">Attending</th>
            <th className="px-4 py-3">Status</th>
            <th
              className="cursor-pointer px-4 py-3 select-none"
              onClick={() => toggle('submittedAt')}
            >
              Submitted{arrow('submittedAt')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-royal-ivory/95">{r.name}</p>
                {r.guests.length > 0 && (
                  <p className="text-xs text-royal-ivory/50" title={r.guests.join(', ')}>
                    + {r.guests.join(', ')}
                  </p>
                )}
                {r.message && (
                  <p className="mt-0.5 max-w-md text-xs italic text-royal-ivory/45">
                    “{r.message}”
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-royal-gold/30 px-2 text-sm text-royal-gold-light">
                  {r.partySize}
                </span>
              </td>
              <td className="px-4 py-3">
                <FunctionChips ids={r.functions} max={4} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-royal-ivory/70">
                {fmtDate(r.submittedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
