import { useState } from 'react'
import { DEMO_PASSWORD, DEMO_USER, login } from './auth'

/** Login gate for the /admin console (placeholder auth — see auth.ts). */
export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(user, password)) {
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 text-royal-ivory"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #2A1016 0%, #120A08 72%)' }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border p-7 shadow-2xl"
        style={{
          borderColor: 'rgba(232,207,122,0.28)',
          background: 'linear-gradient(160deg, #1E1712, #140F0B)',
          boxShadow: '0 40px 90px -40px #000',
        }}
      >
        <div className="text-center">
          <p className="font-heading text-3xl text-royal-gold-light">Vowly</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.35em] text-royal-ivory/55">
            Admin Console
          </p>
        </div>

        <label className="mt-7 block">
          <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-royal-gold-light">
            Username
          </span>
          <input
            type="text"
            value={user}
            onChange={(e) => {
              setUser(e.target.value)
              setError(false)
            }}
            autoComplete="username"
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
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            autoComplete="current-password"
            className="w-full rounded-lg border bg-black/30 px-4 py-2.5 text-sm outline-none focus:border-royal-gold"
            style={{ borderColor: 'rgba(255,255,255,0.14)' }}
          />
        </label>

        {error && (
          <p className="mt-3 text-xs text-[#E0736B]">Incorrect credentials. Try again.</p>
        )}

        <button
          type="submit"
          className="mt-6 w-full cursor-pointer rounded-full py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-[#241109] transition-transform hover:scale-[1.02] active:scale-95"
          style={{ background: 'linear-gradient(120deg, #F5E08A, #E8CF7A 55%, #C9A227)' }}
        >
          Sign in
        </button>

        <p className="mt-5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] text-royal-ivory/55">
          Demo login · <span className="text-royal-gold-light">{DEMO_USER}</span> /{' '}
          <span className="text-royal-gold-light">{DEMO_PASSWORD}</span>
          <br />
          (placeholder — real auth via Supabase later)
        </p>
      </form>
    </div>
  )
}
