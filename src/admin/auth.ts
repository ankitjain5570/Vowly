/**
 * Placeholder admin auth.
 *
 * This is a stand-in so the /admin console can be gated today. When Supabase
 * is connected, replace `login()` with `supabase.auth.signInWithPassword`
 * and `isAuthed()` with a session check — the UI (AdminApp) stays the same.
 *
 * NOTE: client-side credentials are NOT real security. They only keep the
 * console out of casual view until real auth is wired up.
 */

const KEY = 'vowly_admin_session'

/** Demo credentials, shown on the login screen for now. */
export const DEMO_USER = 'admin'
export const DEMO_PASSWORD = 'vowly2026'

export function isAuthed(): boolean {
  try {
    return sessionStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

export function login(user: string, password: string): boolean {
  const ok = user.trim().toLowerCase() === DEMO_USER && password === DEMO_PASSWORD
  if (ok) {
    try {
      sessionStorage.setItem(KEY, 'true')
    } catch {
      /* ignore storage errors */
    }
  }
  return ok
}

export function logout(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
