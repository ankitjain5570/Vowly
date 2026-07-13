import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Two roles, chosen purely by URL path — no login for guests:
 *   /            → the guest invitation (App)
 *   /admin       → the admin console (AdminApp, gated by login)
 * A Netlify SPA fallback (public/_redirects) makes /admin serve index.html.
 *
 * The admin console (with Supabase, xlsx, and all its views) is lazy-loaded
 * so guests never download it — it ships as its own chunk fetched only at
 * /admin.
 */
const AdminApp = lazy(() =>
  import('./admin/AdminApp.tsx').then((m) => ({ default: m.AdminApp })),
)

const isAdmin = window.location.pathname.replace(/\/+$/, '').endsWith('/admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#100807] text-royal-gold-light">
            <span className="animate-pulse font-heading text-2xl">Vowly…</span>
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
