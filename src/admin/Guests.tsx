import { useEffect, useMemo, useRef, useState } from 'react'
import { weddingConfig } from '../wedding.config'
import {
  addGuest,
  deleteGuest,
  emptyGuest,
  importGuests,
  listGuests,
  updateGuest,
} from './data/guestService'
import type { Guest, NewGuest, RsvpRecord, Side } from './data/types'
import { exportGuestsToExcel, parseGuestFile } from '../utils/excel'
import { StatusBadge } from './ui'

const GOLD = '#E8CF7A'
const FUNCTIONS = weddingConfig.functions

/** Match a guest to their RSVP (by explicit link or name) for a status chip. */
function rsvpFor(guest: Guest, rsvps: RsvpRecord[]): RsvpRecord | undefined {
  return (
    rsvps.find((r) => r.guestId && r.guestId === guest.id) ??
    rsvps.find((r) => r.name.trim().toLowerCase() === guest.name.trim().toLowerCase())
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-royal-ivory/55">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-royal-ivory outline-none placeholder:text-royal-ivory/30 focus:border-royal-gold'

/** Add/edit form in a slide-over panel. */
function GuestForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Guest
  onCancel: () => void
  onSave: (data: NewGuest, id?: string) => void
}) {
  const [g, setG] = useState<NewGuest>(() =>
    initial
      ? {
          name: initial.name,
          family: initial.family ?? '',
          side: initial.side,
          phone: initial.phone ?? '',
          email: initial.email ?? '',
          maxGuests: initial.maxGuests,
          invitedFunctionIds: [...initial.invitedFunctionIds],
          notes: initial.notes ?? '',
        }
      : emptyGuest(),
  )
  const set = <K extends keyof NewGuest>(k: K, v: NewGuest[K]) => setG((p) => ({ ...p, [k]: v }))
  const toggleFn = (id: string) =>
    setG((p) => ({
      ...p,
      invitedFunctionIds: p.invitedFunctionIds.includes(id)
        ? p.invitedFunctionIds.filter((x) => x !== id)
        : [...p.invitedFunctionIds, id],
    }))

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onCancel}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#160F0A] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-heading text-2xl text-royal-ivory">
          {initial ? 'Edit guest' : 'Add guest'}
        </h2>

        <div className="mt-5 space-y-4">
          <Field label="Name / Family head">
            <input
              className={inputCls}
              value={g.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Rohan Sharma"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Family / household">
              <input
                className={inputCls}
                value={g.family ?? ''}
                onChange={(e) => set('family', e.target.value)}
                placeholder="Sharma family"
              />
            </Field>
            <Field label="Side">
              <select
                className={inputCls}
                value={g.side ?? ''}
                onChange={(e) => set('side', (e.target.value || undefined) as Side | undefined)}
              >
                <option value="">—</option>
                <option value="bride">Bride</option>
                <option value="groom">Groom</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input
                className={inputCls}
                value={g.phone ?? ''}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="91XXXXXXXXXX"
              />
            </Field>
            <Field label="Max guests">
              <input
                type="number"
                min={1}
                className={inputCls}
                value={g.maxGuests}
                onChange={(e) => set('maxGuests', Math.max(1, Number(e.target.value) || 1))}
              />
            </Field>
          </div>
          <Field label="Email">
            <input
              className={inputCls}
              value={g.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              placeholder="optional"
            />
          </Field>
          <div>
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-royal-ivory/55">
              Invited to <span className="text-royal-ivory/35">(none = all)</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FUNCTIONS.map((f) => {
                const on = g.invitedFunctionIds.includes(f.id)
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFn(f.id)}
                    className="cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors"
                    style={{
                      borderColor: on ? GOLD : 'rgba(255,255,255,0.15)',
                      backgroundColor: on ? `${GOLD}1f` : 'transparent',
                      color: on ? GOLD : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {f.name}
                  </button>
                )
              })}
            </div>
          </div>
          <Field label="Notes">
            <textarea
              className={`${inputCls} min-h-16 resize-y`}
              value={g.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Dietary needs, travel, etc."
            />
          </Field>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            disabled={!g.name.trim()}
            onClick={() => onSave(g, initial?.id)}
            className="cursor-pointer rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#241109] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' }}
          >
            {initial ? 'Save changes' : 'Add guest'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.15em] text-royal-ivory/75 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/** Guest-list management: import, add/edit, export, and RSVP status at a glance. */
export function Guests({ rsvps }: { rsvps: RsvpRecord[] }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Guest | null>(null)
  const [adding, setAdding] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = () => {
    setLoading(true)
    listGuests().then((g) => {
      setGuests(g)
      setLoading(false)
    })
  }
  useEffect(refresh, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return guests
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.family ?? '').toLowerCase().includes(q) ||
        (g.phone ?? '').includes(q),
    )
  }, [guests, query])

  const totalHeads = guests.reduce((s, g) => s + g.maxGuests, 0)

  const onSave = async (data: NewGuest, id?: string) => {
    if (id) await updateGuest(id, data)
    else await addGuest(data)
    setEditing(null)
    setAdding(false)
    refresh()
  }

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportMsg('Reading file…')
    try {
      const { guests: parsed, skipped } = await parseGuestFile(file)
      if (parsed.length === 0) {
        setImportMsg('No guests found. Make sure the first column is the name.')
      } else {
        const added = await importGuests(parsed)
        setImportMsg(`Imported ${added} guest${added === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} empty row(s)` : ''}.`)
        refresh()
      }
    } catch {
      setImportMsg('Could not read that file. Use .xlsx, .xls or .csv.')
    }
    if (fileRef.current) fileRef.current.value = ''
    setTimeout(() => setImportMsg(null), 6000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-royal-ivory">Guest list</h1>
          <p className="mt-1 text-sm text-royal-ivory/55">
            {guests.length} {guests.length === 1 ? 'entry' : 'entries'} · {totalHeads} seats invited
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.15em] text-royal-ivory/80 transition-colors hover:bg-white/5"
          >
            Import CSV / Excel
          </button>
          <button
            type="button"
            disabled={guests.length === 0}
            onClick={() => exportGuestsToExcel(guests)}
            className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.15em] text-royal-ivory/80 transition-colors hover:bg-white/5 disabled:opacity-40"
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="cursor-pointer rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#241109] transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' }}
          >
            + Add guest
          </button>
        </div>
      </div>

      {importMsg && (
        <p className="rounded-lg border border-royal-gold/25 bg-royal-gold/10 px-4 py-2.5 text-xs text-royal-gold-light">
          {importMsg}
        </p>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, family or phone…"
        className="w-full max-w-sm rounded-lg border border-white/12 bg-black/30 px-4 py-2.5 text-sm text-royal-ivory outline-none placeholder:text-royal-ivory/30 focus:border-royal-gold"
      />

      {loading ? (
        <p className="text-sm text-royal-ivory/40">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 px-4 py-14 text-center">
          <p className="text-sm text-royal-ivory/55">
            {guests.length === 0
              ? 'No guests yet. Import a spreadsheet or add them by hand.'
              : 'No guests match your search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.15em] text-royal-ivory/55">
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3 text-center">Seats</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">RSVP</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => {
                const rsvp = rsvpFor(g, rsvps)
                return (
                  <tr
                    key={g.id}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-royal-ivory/95">{g.name}</p>
                      {g.family && <p className="text-xs text-royal-ivory/45">{g.family}</p>}
                    </td>
                    <td className="px-4 py-3 capitalize text-royal-ivory/70">{g.side ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-royal-gold-light">{g.maxGuests}</td>
                    <td className="px-4 py-3 text-royal-ivory/70">{g.phone || g.email || '—'}</td>
                    <td className="px-4 py-3">
                      {rsvp ? <StatusBadge status={rsvp.status} /> : <span className="text-xs text-royal-ivory/35">No reply</span>}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditing(g)}
                        className="cursor-pointer rounded-full border border-white/15 px-3 py-1.5 text-xs text-royal-ivory/75 transition-colors hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteGuest(g.id)
                          refresh()
                        }}
                        aria-label={`Remove ${g.name}`}
                        className="ml-2 cursor-pointer rounded-full border border-[#E0736B]/40 px-3 py-1.5 text-xs text-[#E0736B] transition-colors hover:bg-[#E0736B]/10"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {(adding || editing) && (
        <GuestForm
          initial={editing ?? undefined}
          onCancel={() => {
            setEditing(null)
            setAdding(false)
          }}
          onSave={onSave}
        />
      )}
    </div>
  )
}
