import { weddingConfig, type ExtraSlideId, type WeddingFunction } from './wedding.config'

/**
 * Invite resolution — turns the URL a guest opened into "which slides do
 * they get". This is the ONE seam for future admin tooling: when a backend
 * (e.g. Supabase) exists, only resolveInvite() needs to change — it would
 * look a slug up remotely instead of decoding it from the URL. Everything
 * downstream (the carousel, nav dots, RSVP form) just consumes a
 * ResolvedInvite.
 *
 * Custom links are EXCLUSION-based: the full invitation is the clean default
 * ("/"), and a custom link only encodes the sections a guest should NOT see.
 * So the more you include the shorter the link — everything selected is just
 * "/", and removing a section adds one short code. Codes are opaque so a
 * guest can't read or tamper with which sections were dropped.
 *
 * Supported URLs today (all work as plain shareable links, no login):
 *   /                                        → full invitation (nothing excluded)
 *   /i/<code>                                → full invitation minus one section
 *   /i/<code>-<code>                         → full minus those sections
 *   /?invite=shaadi                          → named preset from config (inclusion list)
 *   /?events=haldi,wedding                   → ad-hoc function combination (inclusion)
 *   /?events=cocktail&extras=info,wishes     → ad-hoc, limited extras (inclusion)
 *
 * Unknown codes/ids fail open to the full invitation, so a mistyped link
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

/**
 * Opaque per-section codes so a shared link never reveals which sections a
 * guest was given, and can't be hand-tampered into another combination.
 * Each code is derived deterministically from the section id + a salt, so
 * codes are stable across builds (links keep working); bump CODE_SALT to
 * rotate every code at once. This is obfuscation, not security — the point
 * is that a guest can't read or guess their invite from the URL.
 */
const CODE_SALT = 'vowly-2026'

/** Raw FNV-1a hash of a string → base36 3-char code (36³ = 46 656 combos). */
function rawCode(s: string): string {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return (h % 46656).toString(36).padStart(3, '0')
}

const SECTION_IDS = [...weddingConfig.functions.map((f) => f.id), ...ALL_EXTRAS]
const KNOWN_IDS = new Set(SECTION_IDS)

/**
 * Assign each section a stable, unique 3-char code. 3 chars is a small space,
 * so on the rare hash collision we deterministically re-hash with a suffix.
 * Iterating a *sorted* id list keeps codes stable regardless of config order.
 */
const ID_TO_CODE = new Map<string, string>()
const CODE_TO_ID = new Map<string, string>()
for (const id of [...SECTION_IDS].sort()) {
  let code = rawCode(`${CODE_SALT}|${id}`)
  let n = 0
  while (CODE_TO_ID.has(code)) code = rawCode(`${CODE_SALT}|${id}#${++n}`)
  ID_TO_CODE.set(id, code)
  CODE_TO_ID.set(code, id)
}

function codeFor(id: string): string {
  return ID_TO_CODE.get(id) ?? rawCode(`${CODE_SALT}|${id}`)
}

/** Decode one path token: an opaque code, or a plain id (dev fallback). */
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
 * Build a shareable custom invite link from the SELECTED section ids. The
 * link encodes only what's EXCLUDED, so a full selection is the clean "/"
 * and each removed section adds one opaque 3-char code:
 *   all selected                          → "/"
 *   everything but reception              → "/i/k7x"
 *   everything but reception + story      → "/i/k7x-p3r"
 * Order follows config (functions first, then extras) for stable links.
 */
export function buildInvitePath(functionIds: string[], extraIds: string[]): string {
  const excludedFns = weddingConfig.functions
    .filter((f) => !functionIds.includes(f.id))
    .map((f) => f.id)
  const excludedExtras = ALL_EXTRAS.filter((e) => !extraIds.includes(e))
  const excluded = [...excludedFns, ...excludedExtras]
  return excluded.length ? `/i/${excluded.map(codeFor).join('-')}` : '/'
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
  // 0. Path-based custom link: /i/<code-code> — codes are the EXCLUDED
  //    sections; the guest sees everything else. Full invite is just "/".
  const pathMatch = pathname.match(/\/i\/([^/]+)\/?$/)
  if (pathMatch) {
    const excluded = new Set(
      decodeURIComponent(pathMatch[1])
        .split(/[-,+]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .map(tokenToId)
        .filter((x): x is string => Boolean(x)),
    )
    const functions = weddingConfig.functions.filter((f) => !excluded.has(f.id))
    // At least one celebration must remain, else fail open to the full invite.
    if (functions.length > 0) {
      return {
        slug: 'custom',
        label: 'Custom Invitation',
        functions,
        extras: ALL_EXTRAS.filter((e) => !excluded.has(e)),
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
