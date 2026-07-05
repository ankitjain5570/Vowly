import type { RsvpRecord } from './rsvpData'
import { allFunctionIds, functionName } from './rsvpData'
import { StatusBadge } from './ui'

const GOLD = '#E8CF7A'

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: number | string
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-royal-ivory/55">{label}</p>
      <p className="mt-2 font-heading text-4xl leading-none" style={{ color: accent ?? GOLD }}>
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-royal-ivory/50">{sub}</p>}
    </div>
  )
}

/** Post-login landing: headline stats, a per-celebration headcount breakdown, and recent RSVPs. */
export function Overview({
  records,
  onOpenDashboard,
}: {
  records: RsvpRecord[]
  onOpenDashboard: () => void
}) {
  const total = records.length
  const confirmed = records.filter((r) => r.status === 'confirmed').length
  const pending = records.filter((r) => r.status === 'pending').length
  const declined = records.filter((r) => r.status === 'declined').length
  const expectedHeads = records
    .filter((r) => r.status !== 'declined')
    .reduce((sum, r) => sum + r.partySize, 0)

  // per-function expected headcount (magnitude → single-hue bars, direct labels)
  const perFn = allFunctionIds.map((id) => ({
    id,
    name: functionName(id),
    heads: records
      .filter((r) => r.status !== 'declined' && r.functions.includes(id))
      .reduce((sum, r) => sum + r.partySize, 0),
  }))
  const maxHeads = Math.max(1, ...perFn.map((f) => f.heads))

  const recent = [...records]
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-royal-ivory">Welcome back</h1>
          <p className="mt-1 text-sm text-royal-ivory/55">Here’s how the guest list is shaping up.</p>
        </div>
        <button
          type="button"
          onClick={onOpenDashboard}
          className="cursor-pointer rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#241109] transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' }}
        >
          Open Dashboard →
        </button>
      </div>

      {/* KPI stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total RSVPs" value={total} sub={`${confirmed} confirmed · ${pending} pending`} />
        <StatTile label="Expected guests" value={expectedHeads} sub="excludes declines" />
        <StatTile label="Confirmed" value={confirmed} sub="parties" accent="#57BD8A" />
        <StatTile label="Declined" value={declined} sub="parties" accent="#E0736B" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* per-celebration headcount */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-royal-ivory/90">Expected guests by celebration</h2>
          <div className="mt-4 space-y-3">
            {perFn.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-royal-ivory/70">{f.name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(f.heads / maxHeads) * 100}%`,
                      background: `linear-gradient(90deg, #C9A227, ${GOLD})`,
                    }}
                  />
                </div>
                <span className="w-7 shrink-0 text-right text-sm tabular-nums text-royal-gold-light">
                  {f.heads}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* recent RSVPs */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-royal-ivory/90">Latest RSVPs</h2>
          <ul className="mt-4 space-y-3">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-royal-ivory/90">{r.name}</p>
                  <p className="text-xs text-royal-ivory/45">
                    {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
