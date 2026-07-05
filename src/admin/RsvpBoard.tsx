import { useState } from 'react'
import type { RsvpRecord, RsvpStatus } from './rsvpData'
import { FunctionChips, STATUS_META, STATUS_ORDER } from './ui'

/**
 * Kanban view — RSVPs grouped into status columns. Cards are draggable
 * between columns (native HTML5 drag-and-drop); dropping updates the
 * record's status via `onMove`. On touch, the ‹ › buttons move a card.
 */
export function RsvpBoard({
  records,
  onMove,
}: {
  records: RsvpRecord[]
  onMove: (id: string, status: RsvpStatus) => void
}) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<RsvpStatus | null>(null)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status]
        const cards = records.filter((r) => r.status === status)
        const heads = cards.reduce((sum, r) => sum + r.partySize, 0)
        const isOver = overCol === status
        return (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault()
              setOverCol(status)
            }}
            onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
            onDrop={(e) => {
              e.preventDefault()
              if (dragId) onMove(dragId, status)
              setDragId(null)
              setOverCol(null)
            }}
            className="flex flex-col rounded-xl border bg-white/[0.02] p-3 transition-colors"
            style={{
              borderColor: isOver ? meta.color : 'rgba(255,255,255,0.1)',
              backgroundColor: isOver ? meta.tint : undefined,
            }}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: meta.color }}>
                <span aria-hidden="true">{meta.icon}</span>
                {meta.label}
              </span>
              <span className="text-xs text-royal-ivory/55">
                {cards.length} · {heads} guests
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-2.5">
              {cards.map((r) => (
                <article
                  key={r.id}
                  draggable
                  onDragStart={() => setDragId(r.id)}
                  onDragEnd={() => {
                    setDragId(null)
                    setOverCol(null)
                  }}
                  className="cursor-grab rounded-lg border border-white/10 bg-[#221a14] p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                  style={{ borderLeft: `3px solid ${meta.color}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-royal-ivory/95">{r.name}</p>
                      <p className="text-xs text-royal-ivory/50">
                        {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}
                        {r.guests.length > 0 && ` · ${r.guests.length} named`}
                      </p>
                    </div>
                    {/* touch-friendly move controls */}
                    <div className="flex shrink-0 gap-1">
                      {STATUS_ORDER.filter((s) => s !== status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => onMove(r.id, s)}
                          title={`Move to ${STATUS_META[s].label}`}
                          aria-label={`Move ${r.name} to ${STATUS_META[s].label}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-colors hover:bg-white/10"
                          style={{ borderColor: `${STATUS_META[s].color}55`, color: STATUS_META[s].color }}
                        >
                          {STATUS_META[s].icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <FunctionChips ids={r.functions} max={3} />
                  </div>
                </article>
              ))}
              {cards.length === 0 && (
                <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-royal-ivory/35">
                  Drop RSVPs here
                </p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
