import { useEffect, useState } from 'react'
import { listProfiles, removeUser, setRole } from './data/authService'
import type { Profile, Role } from './data/types'

const ROLE_META: Record<Role, { label: string; color: string; tint: string }> = {
  pending: { label: 'Pending', color: '#E3B24C', tint: 'rgba(227,178,76,0.14)' },
  admin: { label: 'Admin', color: '#7Fb2ff', tint: 'rgba(127,178,255,0.14)' },
  superuser: { label: 'Superuser', color: '#57BD8A', tint: 'rgba(87,189,138,0.14)' },
}

function RoleBadge({ role }: { role: Role }) {
  const m = ROLE_META[role]
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
      style={{ color: m.color, borderColor: `${m.color}55`, backgroundColor: m.tint }}
    >
      {m.label}
    </span>
  )
}

function Btn({
  children,
  onClick,
  tone = 'ghost',
}: {
  children: React.ReactNode
  onClick: () => void
  tone?: 'gold' | 'ghost' | 'danger'
}) {
  const base =
    'cursor-pointer rounded-full px-3 py-1.5 text-xs transition-colors disabled:opacity-40'
  if (tone === 'gold')
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} font-semibold text-[#241109]`}
        style={{ background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' }}
      >
        {children}
      </button>
    )
  const cls =
    tone === 'danger'
      ? 'border border-[#E0736B]/45 text-[#E0736B] hover:bg-[#E0736B]/10'
      : 'border border-white/15 text-royal-ivory/80 hover:bg-white/5'
  return (
    <button type="button" onClick={onClick} className={`${base} ${cls}`}>
      {children}
    </button>
  )
}

/** Superuser-only: approve/deny pending sign-ups and manage admin roles. */
export function Team({ currentUser }: { currentUser: Profile }) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    setLoading(true)
    listProfiles().then((p) => {
      setProfiles(p)
      setLoading(false)
    })
  }
  useEffect(refresh, [])

  const act = async (fn: Promise<void>) => {
    await fn
    refresh()
  }

  const pending = profiles.filter((p) => p.role === 'pending')
  const active = profiles.filter((p) => p.role !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-royal-ivory">Team &amp; access</h1>
        <p className="mt-1 text-sm text-royal-ivory/55">
          Approve new sign-ups and manage who can access the console.
        </p>
      </div>

      {/* Pending approvals */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-royal-ivory/90">
          Awaiting approval
          {pending.length > 0 && (
            <span className="rounded-full bg-[#E3B24C]/20 px-2 py-0.5 text-[11px] text-[#E3B24C]">
              {pending.length}
            </span>
          )}
        </h2>
        {loading ? (
          <p className="mt-4 text-sm text-royal-ivory/40">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="mt-4 text-sm text-royal-ivory/40">No one is waiting for approval.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {pending.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-royal-ivory/95">{p.email}</p>
                  <p className="text-[11px] text-royal-ivory/45">
                    Signed up {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Btn tone="gold" onClick={() => act(setRole(p.id, 'admin'))}>
                    Approve as admin
                  </Btn>
                  <Btn tone="danger" onClick={() => act(removeUser(p.id))}>
                    Deny
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Active members */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-royal-ivory/90">Members</h2>
        <ul className="mt-4 space-y-2.5">
          {active.map((p) => {
            const isSelf = p.id === currentUser.id
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-royal-ivory/95">
                      {p.email}
                      {isSelf && <span className="text-royal-ivory/40"> (you)</span>}
                    </p>
                  </div>
                  <RoleBadge role={p.role} />
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {p.role === 'admin' && (
                    <Btn onClick={() => act(setRole(p.id, 'superuser'))}>Make superuser</Btn>
                  )}
                  {p.role === 'superuser' && !isSelf && (
                    <Btn onClick={() => act(setRole(p.id, 'admin'))}>Demote to admin</Btn>
                  )}
                  {!isSelf && (
                    <>
                      {p.role !== 'pending' && (
                        <Btn tone="ghost" onClick={() => act(setRole(p.id, 'pending'))}>
                          Revoke access
                        </Btn>
                      )}
                      <Btn tone="danger" onClick={() => act(removeUser(p.id))}>
                        Remove
                      </Btn>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
