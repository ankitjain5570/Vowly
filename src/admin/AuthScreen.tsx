import { useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { SUPERUSER_EMAIL, signIn, signUp } from './data/authService'
import type { Profile } from './data/types'

type Mode = 'signin' | 'signup'

/**
 * Login / sign-up gate for the /admin console. Real accounts via Supabase
 * when configured; a localStorage fallback otherwise (single-device preview).
 * New sign-ups start as 'pending' and must be approved by a superuser —
 * except the designated superuser email, which is elevated automatically.
 */
export function AuthScreen({ onAuthed }: { onAuthed: (profile: Profile) => void }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    const res = mode === 'signup' ? await signUp(email, password) : await signIn(email, password)
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'Something went wrong. Please try again.')
      return
    }
    if (res.profile) {
      onAuthed(res.profile)
      return
    }
    // Supabase sign-up with email confirmation on: no session yet.
    setNotice(
      'Account created. If email confirmation is on, check your inbox, then sign in. A superuser must approve new admins.',
    )
    setMode('signin')
  }

  const isSuperEmail = email.trim().toLowerCase() === SUPERUSER_EMAIL

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 text-royal-ivory"
      style={{ background: 'radial-gradient(ellipse at 50% 25%, #2A1016 0%, #100807 72%)' }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border p-7 shadow-2xl"
        style={{
          borderColor: 'rgba(232,207,122,0.28)',
          background: 'linear-gradient(160deg, #1E1712, #130E0A)',
          boxShadow: '0 40px 90px -40px #000',
        }}
      >
        <div className="text-center">
          <p className="font-heading text-3xl text-royal-gold-light">Vowly</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.35em] text-royal-ivory/55">
            Admin Console
          </p>
        </div>

        {/* mode switch */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-black/30 p-1 text-xs">
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m)
                setError(null)
                setNotice(null)
              }}
              className={`cursor-pointer rounded-full py-1.5 uppercase tracking-[0.15em] transition-colors ${
                mode === m ? 'text-[#241109]' : 'text-royal-ivory/60 hover:text-royal-ivory'
              }`}
              style={mode === m ? { background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' } : undefined}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-royal-gold-light">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            autoComplete="email"
            className="w-full rounded-lg border bg-black/30 px-4 py-2.5 text-sm outline-none focus:border-royal-gold"
            style={{ borderColor: 'rgba(255,255,255,0.14)' }}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-royal-gold-light">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-full rounded-lg border bg-black/30 px-4 py-2.5 text-sm outline-none focus:border-royal-gold"
            style={{ borderColor: 'rgba(255,255,255,0.14)' }}
          />
        </label>

        {mode === 'signup' && isSuperEmail && (
          <p className="mt-3 rounded-lg border border-royal-gold/30 bg-royal-gold/10 px-3 py-2 text-[11px] text-royal-gold-light">
            This email will be set up as the superuser (full access + team management).
          </p>
        )}

        {error && <p className="mt-3 text-xs text-[#E0736B]">{error}</p>}
        {notice && <p className="mt-3 text-xs text-[#57BD8A]">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full cursor-pointer rounded-full py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-[#241109] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' }}
        >
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        {!isSupabaseConfigured && (
          <p className="mt-5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] text-royal-ivory/55">
            Preview mode — accounts are stored on this device only.
            <br />
            Add Supabase keys (see <span className="text-royal-gold-light">.env.example</span>) for
            real, shared accounts.
          </p>
        )}
      </form>
    </div>
  )
}
