/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://xxxx.supabase.co (safe to expose) */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon/public key (safe to expose in a frontend) */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
