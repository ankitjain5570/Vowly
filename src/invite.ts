import { weddingConfig, type ExtraSlideId, type WeddingFunction } from './wedding.config'

/**
 * Invite resolution — turns the URL a guest opened into "which slides do
 * they get". This is the ONE seam for future admin tooling: when a backend
 * (e.g. Supabase) exists, only resolveInvite() needs to change — it would
 * look a slug up remotely instead of decoding it from the URL. Everything
 * downstream (the carousel, nav dots, RSVP form) just consumes a
 * ResolvedInvite.
 *
 * Supported URLs today (all work as plain shareable links, no login):
 *   /                                        → full invitation
 *   /i/engagement-wedding                    → path-based custom link (admin-built)
 *   /i/haldi-mehendi-story-info              → functions + chosen extra sections
 *   /?invite=shaadi                          → named preset from config
 *   /?events=haldi,wedding                   → ad-hoc function combination
 *   /?events=cocktail&extras=info,wishes     → ad-hoc, limited extras
 *
 * Unknown slugs/ids fail open to the full invitation, so a mistyped link
 * never shows a guest a broken page.
 */

export interface ResolvedInvite {
  slug: string
  label: string
  functions: WeddingFunction[]
  extras: ExtraSlideId[]
}

export const ALL_EXTRAS: ExtraSlideId[] = ['story', 'photobook', 'info', 'wishes']

/** Display labels for the optional extra sections (for the admin builder). */
export const EXTRA_LABELS: Record<ExtraSlideId, string> = {
  story: weddingConfig.loveStory.title,
  photobook: weddingConfig.photobook.title,
  info: weddingConfig.guestInfo.title,
  wishes: 'Wishes / Guestbook',
}

function isExtra(value: string): value is ExtraSlideId {
  return (ALL_EXTRAS as string[]).includes(value)
}

/**
 * Opaque per-section codes so a shared link never reveals which sections a
 * guest was given, and can't be hand-tampered into another combination.
 * Each code is derived deterministically from the section id + a salt, so
 * codes are stable across builds (links keep working); bump CODE_SALT to
 * rotate every code at once. This is obfuscation, not security — the point
 * is that a guest can't read or guess their invite from the URL.
 */
const CODE_SALT = 'vowly-2026'

function codeFor(id: string): string {
  // FNV-1a hash → bounded base36, 5 chars (e.g. "k7x2m")
  let h = 2166136261 >>> 0
  const s = `${CODE_SALT}|${id}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return (h % 60466176).toString(36).padStart(5, '0')
}

const SECTION_IDS = [...weddingConfig.functions.map((f) => f.id), ...ALL_EXTRAS]
const CODE_TO_ID = new Map(SECTION_IDS.map((id) => [codeFor(id), id]))
const KNOWN_IDS = new Set(SECTION_IDS)

/** Decode one path token: an opaque code, or a plain id (legacy fallback). */
function tokenToId(token: string): string | null {
  return CODE_TO_ID.get(token) ?? (KNOWN_IDS.has(token) ? token : null)
}

/** Map function ids to config entries, dropping unknown ids, keeping order. */
function pickFunctions(ids: string[]): WeddingFunction[] {
  return ids
    .map((id) => weddingConfig.functions.find((f) => f.id === id))
    .filter((f): f is WeddingFunction => Boolean(f))
}

/** Order a set of extra ids into their canonical (chronological) order. */
function orderExtras(ids: string[]): ExtraSlideId[] {
  return ALL_EXTRAS.filter((e) => ids.includes(e))
}

function fullInvite(): ResolvedInvite {
  return {
    slug: 'full',
    label: 'All Celebrations',
    functions: weddingConfig.functions,
    extras: ALL_EXTRAS,
  }
}

/**
 * Build a shareable custom invite link from selected section ids. Each
 * section is emitted as an opaque code so the link doesn't reveal which
 * sections it contains:
 *   buildInvitePath(['engagement','wedding'], ['info']) → "/i/k7x2m-p3rqz-y7wsb"
 * Functions come first (config order), then extras (canonical order).
 */
export function buildInvitePath(functionIds: string[], extraIds: string[]): string {
  const fns = weddingConfig.functions.filter((f) => functionIds.includes(f.id)).map((f) => f.id)
  const extras = orderExtras(extraIds)
  const tokens = [...fns, ...extras].map(codeFor)
  return tokens.length ? `/i/${tokens.join('-')}` : '/'
}

/** Absolute URL for a custom link, for copy/share. */
export function buildInviteUrl(functionIds: string[], extraIds: string[]): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return origin + buildInvitePath(functionIds, extraIds)
}

export function resolveInvite(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '',
): ResolvedInvite {
  // 0. Path-based custom link: /i/<code-code-code>
  const pathMatch = pathname.match(/\/i\/([^/]+)\/?$/)
  if (pathMatch) {
    const ids = decodeURIComponent(pathMatch[1])
      .split(/[-,+]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .map(tokenToId)
      .filter((x): x is string => Boolean(x))
    const functions = weddingConfig.functions.filter((f) => ids.includes(f.id))
    if (functions.length > 0) {
      return {
        slug: 'custom',
        label: 'Custom Invitation',
        functions,
        extras: orderExtras(ids.filter(isExtra)),
      }
    }
  }

  const params = new URLSearchParams(search)

  // 1. Named preset: /?invite=<slug>
  const slug = params.get('invite')?.trim().toLowerCase()
  if (slug) {
    const preset = weddingConfig.invites.find((i) => i.slug === slug)
    if (preset) {
      const functions = pickFunctions(preset.functions)
      if (functions.length > 0) {
        return {
          slug: preset.slug,
          label: preset.label,
          functions,
          extras: preset.extras ?? ALL_EXTRAS,
        }
      }
    }
  }

  // 2. Ad-hoc combination: /?events=a,b[&extras=x,y]
  const events = params.get('events')
  if (events) {
    const ids = events.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    // config order, so slides always appear chronologically
    const functions = weddingConfig.functions.filter((f) => ids.includes(f.id))
    if (functions.length > 0) {
      const extrasParam = params.get('extras')
      const extras = extrasParam
        ? orderExtras(extrasParam.split(',').map((s) => s.trim().toLowerCase()))
        : ALL_EXTRAS
      return { slug: 'custom', label: 'Custom Invitation', functions, extras }
    }
  }

  // 3. Default: everything
  return fullInvite()
}
