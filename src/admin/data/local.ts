/**
 * Tiny localStorage helpers for the no-Supabase fallback. This lets the whole
 * admin console run on a single device for preview/demo; it is NOT shared or
 * secure. Everything here is replaced by real queries once Supabase env vars
 * are set (see each service's `isSupabaseConfigured` branch).
 */

export function uid(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  )
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / unavailable — ignore in fallback mode */
  }
}
