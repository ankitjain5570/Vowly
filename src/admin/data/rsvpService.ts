import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { readJSON, writeJSON } from './local'
import { getRsvps } from '../rsvpData'
import type { RsvpRecord, RsvpStatus } from './types'

/**
 * RSVP data. Supabase-backed when configured; otherwise a localStorage copy
 * seeded once from the sample records so the dashboard is populated and
 * status changes persist across reloads on the same device.
 */
const LS_RSVPS = 'vowly_admin_rsvps'
const LS_SEEDED = 'vowly_admin_rsvps_seeded'

function localRsvps(): RsvpRecord[] {
  // Seed once from the sample set; after that respect the stored state.
  if (!readJSON<boolean>(LS_SEEDED, false)) {
    const seed = getRsvps()
    writeJSON(LS_RSVPS, seed)
    writeJSON(LS_SEEDED, true)
    return seed
  }
  return readJSON<RsvpRecord[]>(LS_RSVPS, [])
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToRsvp(r: any): RsvpRecord {
  return {
    id: r.id,
    guestId: r.guest_id ?? null,
    name: r.name,
    phone: r.phone ?? undefined,
    partySize: r.party_size ?? 1,
    guests: r.guests ?? [],
    functions: r.functions ?? [],
    status: r.status as RsvpStatus,
    message: r.message ?? undefined,
    submittedAt: r.submitted_at,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listRsvps(): Promise<RsvpRecord[]> {
  if (!isSupabaseConfigured || !supabase) return localRsvps()
  const { data } = await supabase
    .from('rsvps')
    .select('*')
    .order('submitted_at', { ascending: false })
  return (data ?? []).map(rowToRsvp)
}

export async function setRsvpStatus(id: string, status: RsvpStatus): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    writeJSON(
      LS_RSVPS,
      localRsvps().map((r) => (r.id === id ? { ...r, status } : r)),
    )
    return
  }
  await supabase.from('rsvps').update({ status }).eq('id', id)
}
