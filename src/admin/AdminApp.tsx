import { useCallback, useState } from 'react'
import { getRsvps, type RsvpRecord, type RsvpStatus } from './rsvpData'
import { isAuthed, logout } from './auth'
import { AdminLogin } from './AdminLogin'
import { Overview } from './Overview'
import { Dashboard } from './Dashboard'
import { InviteBuilder } from './InviteBuilder'

type View = 'overview' | 'dashboard' | 'invites'

/**
 * Root of the /admin console. Gated by login; once in, a top bar switches
 * between the Overview and the RSVP Dashboard. RSVP records live here so the
 * Overview stats and the kanban board stay in sync when cards are moved.
 */
export function AdminApp() {
  const [authed, setAuthed] = useState(isAuthed())
  const [view, setView] = useState<View>('overview')
  const [records, setRecords] = useState<RsvpRecord[]>(() => getRsvps())

  const moveRsvp = useCallback((id: string, status: RsvpStatus) => {
    setRecords((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
  }, [])

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-[#120C08] text-royal-ivory">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#160F0A]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl text-royal-gold-light">Vowly</span>
            <span className="rounded-full border border-royal-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-royal-gold-light/80">
              Admin
            </span>
          </div>

          <nav className="flex items-center gap-1">
            <NavButton active={view === 'overview'} onClick={() => setView('overview')}>
              Overview
            </NavButton>
            <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')}>
              Dashboard
            </NavButton>
            <NavButton active={view === 'invites'} onClick={() => setView('invites')}>
              Invites
            </NavButton>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden rounded-full border border-white/12 px-3 py-1.5 text-xs text-royal-ivory/70 transition-colors hover:bg-white/5 sm:inline-block"
            >
              View site ↗
            </a>
            <button
              type="button"
              onClick={() => {
                logout()
                setAuthed(false)
              }}
              className="cursor-pointer rounded-full border border-white/12 px-3 py-1.5 text-xs text-royal-ivory/70 transition-colors hover:bg-white/5"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {view === 'overview' && (
          <Overview records={records} onOpenDashboard={() => setView('dashboard')} />
        )}
        {view === 'dashboard' && <Dashboard records={records} onMove={moveRsvp} />}
        {view === 'invites' && <InviteBuilder />}
      </main>
    </div>
  )
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        active ? 'bg-white/10 text-royal-gold-light' : 'text-royal-ivory/60 hover:text-royal-ivory'
      }`}
    >
      {children}
    </button>
  )
}
