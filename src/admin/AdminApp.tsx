import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import type { RsvpRecord, RsvpStatus } from './rsvpData'
import type { Profile } from './data/types'
import { getCurrentProfile, signOut } from './data/authService'
import { listRsvps, setRsvpStatus } from './data/rsvpService'
import { AuthScreen } from './AuthScreen'
import { Overview } from './Overview'
import { Dashboard } from './Dashboard'
import { Guests } from './Guests'
import { InviteBuilder } from './InviteBuilder'
import { Team } from './Team'

type View = 'overview' | 'dashboard' | 'guests' | 'invites' | 'team'

interface NavItem {
  id: View
  label: string
  icon: string // SVG path data
  superOnly?: boolean
}

const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'M4 13h6V4H4zM14 20h6V4h-6zM4 20h6v-4H4z' },
  { id: 'dashboard', label: 'RSVPs', icon: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'guests', label: 'Guests', icon: 'M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M21 20v-2a4 4 0 0 0-3-3.9' },
  { id: 'invites', label: 'Invites', icon: 'M4 6h16v12H4zM4 7l8 6 8-6' },
  { id: 'team', label: 'Team', icon: 'M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M2 20v-1a4 4 0 0 1 4-4h4M14 15h1a4 4 0 0 1 4 4v1', superOnly: true },
]

/**
 * Root of the /admin console. Loads the current session, gates on role
 * ('pending' users wait for approval), and renders a modern sidebar shell.
 * RSVP records live here so Overview stats and the kanban board stay in sync.
 */
export function AdminApp() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [view, setView] = useState<View>('overview')
  const [records, setRecords] = useState<RsvpRecord[]>([])

  // Load the current session on mount.
  useEffect(() => {
    getCurrentProfile()
      .then(setProfile)
      .finally(() => setLoadingSession(false))
  }, [])

  // Load RSVPs once we have an approved user.
  const isApproved = profile && profile.role !== 'pending'
  useEffect(() => {
    if (isApproved) listRsvps().then(setRecords)
  }, [isApproved])

  const moveRsvp = useCallback((id: string, status: RsvpStatus) => {
    setRecords((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r))) // optimistic
    void setRsvpStatus(id, status)
  }, [])

  const doSignOut = useCallback(async () => {
    await signOut()
    setProfile(null)
    setView('overview')
  }, [])

  const recheck = useCallback(() => {
    setLoadingSession(true)
    getCurrentProfile()
      .then(setProfile)
      .finally(() => setLoadingSession(false))
  }, [])

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#100807] text-royal-gold-light">
        <span className="animate-pulse font-heading text-2xl">Vowly…</span>
      </div>
    )
  }

  if (!profile) return <AuthScreen onAuthed={setProfile} />

  if (profile.role === 'pending') {
    return <PendingScreen profile={profile} onRecheck={recheck} onSignOut={doSignOut} />
  }

  const nav = NAV.filter((n) => !n.superOnly || profile.role === 'superuser')

  return (
    <div className="min-h-screen bg-[#100807] text-royal-ivory lg:flex">
      {/* Sidebar (desktop) / top nav (mobile) */}
      <aside className="border-b border-white/10 bg-[#150E0A] lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <div className="flex items-center gap-2">
            <span className="font-heading text-2xl text-royal-gold-light">Vowly</span>
            <span className="rounded-full border border-royal-gold/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-royal-gold-light/80">
              Admin
            </span>
          </div>
          {!isSupabaseConfigured && (
            <span className="rounded-full bg-[#E3B24C]/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-[#E3B24C] lg:mt-3 lg:inline-block">
              Preview mode
            </span>
          )}
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-3">
          {nav.map((n) => {
            const active = view === n.id
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setView(n.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-colors lg:w-full ${
                  active
                    ? 'bg-royal-gold/12 text-royal-gold-light'
                    : 'text-royal-ivory/60 hover:bg-white/5 hover:text-royal-ivory'
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={n.icon} />
                </svg>
                {n.label}
              </button>
            )
          })}
        </nav>

        {/* account (desktop foot) */}
        <div className="hidden px-4 lg:absolute lg:bottom-0 lg:block lg:w-60 lg:border-t lg:border-white/10 lg:py-4">
          <p className="truncate text-xs text-royal-ivory/70">{profile.email}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-royal-gold-light/70">
            {profile.role}
          </p>
          <div className="mt-2 flex gap-2">
            <a
              href="/"
              className="rounded-full border border-white/12 px-3 py-1 text-[11px] text-royal-ivory/70 transition-colors hover:bg-white/5"
            >
              View site ↗
            </a>
            <button
              type="button"
              onClick={doSignOut}
              className="cursor-pointer rounded-full border border-white/12 px-3 py-1 text-[11px] text-royal-ivory/70 transition-colors hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        {/* mobile account row */}
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <div className="min-w-0">
            <p className="truncate text-xs text-royal-ivory/70">{profile.email}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-royal-gold-light/70">
              {profile.role}
            </p>
          </div>
          <button
            type="button"
            onClick={doSignOut}
            className="cursor-pointer rounded-full border border-white/12 px-3 py-1.5 text-xs text-royal-ivory/70 transition-colors hover:bg-white/5"
          >
            Sign out
          </button>
        </div>

        {view === 'overview' && (
          <Overview records={records} onOpenDashboard={() => setView('dashboard')} />
        )}
        {view === 'dashboard' && <Dashboard records={records} onMove={moveRsvp} />}
        {view === 'guests' && <Guests rsvps={records} />}
        {view === 'invites' && <InviteBuilder />}
        {view === 'team' && profile.role === 'superuser' && <Team currentUser={profile} />}
      </main>
    </div>
  )
}

/** Shown to an authenticated user whose account hasn't been approved yet. */
function PendingScreen({
  profile,
  onRecheck,
  onSignOut,
}: {
  profile: Profile
  onRecheck: () => void
  onSignOut: () => void
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 text-royal-ivory"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #2A1016 0%, #100807 72%)' }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-royal-gold/25 bg-[#160F0A] p-7 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#E3B24C]/40 bg-[#E3B24C]/10 text-2xl text-[#E3B24C]">
          ◷
        </div>
        <h1 className="mt-4 font-heading text-2xl text-royal-ivory">Awaiting approval</h1>
        <p className="mt-2 text-sm text-royal-ivory/60">
          Your account (<span className="text-royal-gold-light">{profile.email}</span>) is created.
          A superuser needs to approve access before you can view the console.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={onRecheck}
            className="cursor-pointer rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#241109] transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' }}
          >
            Check again
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="cursor-pointer rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.15em] text-royal-ivory/75 transition-colors hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
