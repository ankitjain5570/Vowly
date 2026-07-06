import { useMemo, useState } from 'react'
import { weddingConfig } from '../wedding.config'
import { ALL_EXTRAS, EXTRA_LABELS, buildInvitePath, buildInviteUrl } from '../invite'
import {
  deleteInvite,
  getSavedInvites,
  saveInvite,
  type SavedInvite,
} from './inviteLinks'

const GOLD = '#E8CF7A'

function Toggle({
  label,
  sub,
  on,
  onChange,
}: {
  label: string
  sub?: string
  on: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={on}
      className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
      style={{
        borderColor: on ? `${GOLD}80` : 'rgba(255,255,255,0.12)',
        backgroundColor: on ? `${GOLD}14` : 'rgba(255,255,255,0.02)',
      }}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px]"
        style={{
          borderColor: on ? GOLD : 'rgba(255,255,255,0.25)',
          backgroundColor: on ? GOLD : 'transparent',
          color: '#241109',
        }}
      >
        {on ? '✓' : ''}
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-royal-ivory/95">{label}</span>
        {sub && <span className="block text-[11px] text-royal-ivory/45">{sub}</span>}
      </span>
    </button>
  )
}

function sectionSummary(inv: SavedInvite): string {
  const fnNames = weddingConfig.functions
    .filter((f) => inv.functionIds.includes(f.id))
    .map((f) => f.name)
  const extraNames = ALL_EXTRAS.filter((e) => inv.extraIds.includes(e)).map((e) => EXTRA_LABELS[e])
  return [...fnNames, ...extraNames].join(' · ')
}

/** Admin tool to compose custom, section-limited invite links and reuse them. */
export function InviteBuilder() {
  const [functionIds, setFunctionIds] = useState<string[]>(
    weddingConfig.functions.map((f) => f.id),
  )
  const [extraIds, setExtraIds] = useState<string[]>([...ALL_EXTRAS])
  const [label, setLabel] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState<SavedInvite[]>(() => getSavedInvites())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const toggleFn = (id: string) =>
    setFunctionIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  const toggleExtra = (id: string) =>
    setExtraIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const url = useMemo(() => buildInviteUrl(functionIds, extraIds), [functionIds, extraIds])
  const path = useMemo(() => buildInvitePath(functionIds, extraIds), [functionIds, extraIds])
  const canBuild = functionIds.length > 0

  const copy = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard may be blocked; ignore */
    }
    if (id) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const onSave = () => {
    if (!canBuild) return
    setSaved(
      saveInvite({
        label: label.trim() || 'Untitled invite',
        functionIds: [...functionIds],
        extraIds: [...extraIds],
      }),
    )
    setLabel('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-royal-ivory">Invite Builder</h1>
        <p className="mt-1 text-sm text-royal-ivory/55">
          Pick which celebrations and sections a guest should see, then share the generated link.
          Guests open it with no login — they’ll only see what you select here.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* selection */}
        <div className="space-y-5">
          <div>
            <h2 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-royal-ivory/55">
              Celebrations
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {weddingConfig.functions.map((f) => (
                <Toggle
                  key={f.id}
                  label={f.name}
                  sub={f.date}
                  on={functionIds.includes(f.id)}
                  onChange={() => toggleFn(f.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-royal-ivory/55">
              Extra sections
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {ALL_EXTRAS.map((e) => (
                <Toggle
                  key={e}
                  label={EXTRA_LABELS[e]}
                  on={extraIds.includes(e)}
                  onChange={() => toggleExtra(e)}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-royal-ivory/40">
              The opening invitation and the RSVP form are always included.
            </p>
          </div>
        </div>

        {/* link output */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-royal-gold-light">
              Label (for your reference)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Sharma family — Engagement & Wedding"
              className="w-full rounded-lg border border-white/12 bg-black/30 px-4 py-2.5 text-sm text-royal-ivory outline-none placeholder:text-royal-ivory/30 focus:border-royal-gold"
            />
          </div>

          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.25em] text-royal-gold-light">
              Shareable link
            </p>
            <div className="rounded-lg border border-white/12 bg-black/40 p-3">
              {canBuild ? (
                <code className="block break-all text-xs text-royal-gold-light/90">{url}</code>
              ) : (
                <span className="text-xs text-royal-ivory/40">Select at least one celebration.</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canBuild}
              onClick={() => copy(url)}
              className="cursor-pointer rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#241109] transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' }}
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <a
              href={canBuild ? path : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!canBuild}
              onClick={(e) => !canBuild && e.preventDefault()}
              className={`rounded-full border px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                canBuild
                  ? 'cursor-pointer border-royal-gold/50 text-royal-gold-light hover:bg-white/5'
                  : 'cursor-not-allowed border-white/10 text-royal-ivory/30'
              }`}
            >
              Preview ↗
            </a>
            <button
              type="button"
              disabled={!canBuild}
              onClick={onSave}
              className="cursor-pointer rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.15em] text-royal-ivory/80 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save link
            </button>
          </div>
        </div>
      </div>

      {/* saved links */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-royal-ivory/90">
          Saved links{saved.length > 0 && <span className="text-royal-ivory/45"> · {saved.length}</span>}
        </h2>
        {saved.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-royal-ivory/40">
            No saved links yet. Build one above and hit “Save link”.
          </p>
        ) : (
          <div className="space-y-2.5">
            {saved.map((inv) => {
              const link = buildInviteUrl(inv.functionIds, inv.extraIds)
              return (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-royal-ivory/95">{inv.label}</p>
                    <p className="mt-0.5 text-xs text-royal-ivory/50">{sectionSummary(inv)}</p>
                    <code className="mt-1 block break-all text-[11px] text-royal-gold-light/70">
                      {link}
                    </code>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => copy(link, inv.id)}
                      className="cursor-pointer rounded-full border border-royal-gold/40 px-3 py-1.5 text-xs text-royal-gold-light transition-colors hover:bg-white/5"
                    >
                      {copiedId === inv.id ? 'Copied!' : 'Copy'}
                    </button>
                    <a
                      href={buildInvitePath(inv.functionIds, inv.extraIds)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-royal-ivory/75 transition-colors hover:bg-white/5"
                    >
                      Open ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => setSaved(deleteInvite(inv.id))}
                      aria-label={`Delete ${inv.label}`}
                      className="cursor-pointer rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#E0736B] transition-colors hover:bg-white/5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
