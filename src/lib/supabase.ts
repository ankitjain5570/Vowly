import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Single Supabase client for the whole app. It is created only when both env
 * vars are present (see `.env.example`); otherwise the admin data layer falls
 * back to browser-local storage so the console still works for previewing.
 *
 * `isSupabaseConfigured` is the switch every data service checks to decide
 * between the live backend and the local fallback.
 */
const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
