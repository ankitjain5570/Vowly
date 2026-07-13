import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { readJSON, uid, writeJSON } from './local'
import type { Profile, Role } from './types'

/**
 * Auth + team management. Two backends behind one API:
 *  - Supabase (when env vars are set): real accounts via supabase.auth, roles
 *    in the `profiles` table, RLS-enforced.
 *  - Local fallback: a localStorage user list so the console is usable on one
 *    device for preview. NOT secure — passwords are stored in the clear.
 *
 * Role model: 'pending' (no access) → 'admin' (full console) → 'superuser'
 * (also manages the team). The email below is auto-promoted to superuser.
 */
export const SUPERUSER_EMAIL = 'buildwithankitusingai@gmail.com'

export interface AuthResult {
  ok: boolean
  /** Present on failure — a human-readable reason. */
  error?: string
  /** Present on success — the signed-in profile. */
  profile?: Profile
}

/* ----------------------------- local fallback ----------------------------- */

interface LocalUser extends Profile {
  password: string
}
const LS_USERS = 'vowly_admin_users'
const LS_SESSION = 'vowly_admin_session_uid'

function localUsers(): LocalUser[] {
  return readJSON<LocalUser[]>(LS_USERS, [])
}
function saveLocalUsers(users: LocalUser[]): void {
  writeJSON(LS_USERS, users)
}
function stripPassword({ password: _pw, ...profile }: LocalUser): Profile {
  return profile
}

async function localSignUp(email: string, password: string): Promise<AuthResult> {
  const clean = email.trim().toLowerCase()
  if (!clean || !password) return { ok: false, error: 'Email and password are required.' }
  const users = localUsers()
  if (users.some((u) => u.email === clean))
    return { ok: false, error: 'An account with this email already exists. Try signing in.' }
  const isSuper = clean === SUPERUSER_EMAIL
  const user: LocalUser = {
    id: uid(),
    email: clean,
    password,
    role: isSuper ? 'superuser' : 'pending',
    createdAt: new Date().toISOString(),
  }
  saveLocalUsers([...users, user])
  writeJSON(LS_SESSION, user.id)
  return { ok: true, profile: stripPassword(user) }
}

async function localSignIn(email: string, password: string): Promise<AuthResult> {
  const clean = email.trim().toLowerCase()
  const user = localUsers().find((u) => u.email === clean)
  if (!user || user.password !== password)
    return { ok: false, error: 'Incorrect email or password.' }
  writeJSON(LS_SESSION, user.id)
  return { ok: true, profile: stripPassword(user) }
}

function localCurrentProfile(): Profile | null {
  const id = readJSON<string | null>(LS_SESSION, null)
  if (!id) return null
  const user = localUsers().find((u) => u.id === id)
  return user ? stripPassword(user) : null
}

/* -------------------------------- Supabase -------------------------------- */

async function fetchProfile(id: string): Promise<Profile | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('profiles')
    .select('id,email,role,created_at')
    .eq('id', id)
    .single()
  if (!data) return null
  return { id: data.id, email: data.email, role: data.role as Role, createdAt: data.created_at }
}

/* --------------------------------- public --------------------------------- */

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) return localSignUp(email, password)
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
  if (error) return { ok: false, error: error.message }
  // The DB trigger creates the profile row; read it back if a session exists.
  const uid = data.user?.id
  const profile = uid ? await fetchProfile(uid) : null
  return { ok: true, profile: profile ?? undefined }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) return localSignIn(email, password)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) return { ok: false, error: error.message }
  const profile = data.user ? await fetchProfile(data.user.id) : null
  return { ok: true, profile: profile ?? undefined }
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    writeJSON(LS_SESSION, null)
    return
  }
  await supabase.auth.signOut()
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured || !supabase) return localCurrentProfile()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  return fetchProfile(data.user.id)
}

/** All profiles — superuser only (RLS enforces this on the backend). */
export async function listProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured || !supabase) {
    return localUsers()
      .map(stripPassword)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }
  const { data } = await supabase
    .from('profiles')
    .select('id,email,role,created_at')
    .order('created_at', { ascending: false })
  return (data ?? []).map((d) => ({
    id: d.id,
    email: d.email,
    role: d.role as Role,
    createdAt: d.created_at,
  }))
}

/** Change a user's role (approve → 'admin', deny → 'pending', promote, etc.). */
export async function setRole(id: string, role: Role): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    saveLocalUsers(localUsers().map((u) => (u.id === id ? { ...u, role } : u)))
    return
  }
  await supabase.from('profiles').update({ role }).eq('id', id)
}

/** Remove a user entirely (local mode only fully deletes; Supabase drops the
 *  profile row — deleting the auth user requires a server-side admin key). */
export async function removeUser(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    saveLocalUsers(localUsers().filter((u) => u.id !== id))
    return
  }
  await supabase.from('profiles').delete().eq('id', id)
}
