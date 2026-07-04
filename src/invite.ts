import { weddingConfig, type ExtraSlideId, type WeddingFunction } from './wedding.config'

/**
 * Invite resolution — turns the URL a guest opened into "which slides do
 * they get". This is the ONE seam for future admin tooling: when a backend
 * (e.g. Supabase) exists, only resolveInvite() needs to change — it would
 * look the slug up remotely instead of in weddingConfig.invites. Everything
 * downstream (the carousel) just consumes a ResolvedInvite.
 *
 * Supported URLs today (all work as plain shareable links, no login):
 *   /                                        → full invitation
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

const ALL_EXTRAS: ExtraSlideId[] = ['story', 'photobook', 'info', 'wishes']

function isExtra(value: string): value is ExtraSlideId {
  return (ALL_EXTRAS as string[]).includes(value)
}

/** Map function ids to config entries, dropping unknown ids, keeping order. */
function pickFunctions(ids: string[]): WeddingFunction[] {
  return ids
    .map((id) => weddingConfig.functions.find((f) => f.id === id))
    .filter((f): f is WeddingFunction => Boolean(f))
}

function fullInvite(): ResolvedInvite {
  return {
    slug: 'full',
    label: 'All Celebrations',
    functions: weddingConfig.functions,
    extras: ALL_EXTRAS,
  }
}

export function resolveInvite(search: string = window.location.search): ResolvedInvite {
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
        ? extrasParam.split(',').map((s) => s.trim().toLowerCase()).filter(isExtra)
        : ALL_EXTRAS
      return { slug: 'custom', label: 'Custom Invitation', functions, extras }
    }
  }

  // 3. Default: everything
  return fullInvite()
}
