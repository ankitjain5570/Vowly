import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminApp } from './admin/AdminApp.tsx'

/**
 * Two roles, chosen purely by URL path — no login for guests:
 *   /            → the guest invitation (App)
 *   /admin       → the admin console (AdminApp, gated by login)
 * A Netlify SPA fallback (public/_redirects) makes /admin serve index.html.
 */
const isAdmin = window.location.pathname.replace(/\/+$/, '').endsWith('/admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isAdmin ? <AdminApp /> : <App />}</StrictMode>,
)
