import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { readJSON, uid, writeJSON } from './local'
import type { Guest, NewGuest } from './types'

/**
 * Guest-list CRUD + bulk import. Supabase-backed when configured, otherwise a
 * localStorage list. Both return/accept the same `Guest` shape.
 */
const LS_GUESTS = 'vowly_admin_guests'

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToGuest(r: any): Guest {
  return {
    id: r.id,
    name: r.name,
    family: r.family ?? undefined,
    side: r.side ?? undefined,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    maxGuests: r.max_guests ?? 1,
    invitedFunctionIds: r.invited_function_ids ?? [],
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  }
}
function guestToRow(g: NewGuest) {
  return {
    name: g.name,
    family: g.family ?? null,
    side: g.side ?? null,
    phone: g.phone ?? null,
    email: g.email ?? null,
    max_guests: g.maxGuests,
    invited_function_ids: g.invitedFunctionIds,
    notes: g.notes ?? null,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function localGuests(): Guest[] {
  return readJSON<Guest[]>(LS_GUESTS, [])
}
function saveLocal(guests: Guest[]): void {
  writeJSON(LS_GUESTS, guests)
}
function materialize(input: NewGuest): Guest {
  return { ...input, id: uid(), createdAt: new Date().toISOString() }
}

export async function listGuests(): Promise<Guest[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [...localGuests()].sort((a, b) => a.name.localeCompare(b.name))
  }
  const { data } = await supabase.from('guests').select('*').order('name')
  return (data ?? []).map(rowToGuest)
}

export async function addGuest(input: NewGuest): Promise<Guest> {
  if (!isSupabaseConfigured || !supabase) {
    const guest = materialize(input)
    saveLocal([...localGuests(), guest])
    return guest
  }
  const { data, error } = await supabase.from('guests').insert(guestToRow(input)).select().single()
  if (error) throw new Error(error.message)
  return rowToGuest(data)
}

export async function updateGuest(id: string, patch: Partial<NewGuest>): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    saveLocal(localGuests().map((g) => (g.id === id ? { ...g, ...patch } : g)))
    return
  }
  await supabase
    .from('guests')
    .update(guestToRow({ ...emptyGuest(), ...patch } as NewGuest))
    .eq('id', id)
}

export async function deleteGuest(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    saveLocal(localGuests().filter((g) => g.id !== id))
    return
  }
  await supabase.from('guests').delete().eq('id', id)
}

/** Insert many guests at once (from a CSV/Excel import). Returns count added. */
export async function importGuests(rows: NewGuest[]): Promise<number> {
  if (rows.length === 0) return 0
  if (!isSupabaseConfigured || !supabase) {
    const created = rows.map(materialize)
    saveLocal([...localGuests(), ...created])
    return created.length
  }
  const { data, error } = await supabase.from('guests').insert(rows.map(guestToRow)).select('id')
  if (error) throw new Error(error.message)
  return data?.length ?? 0
}

export function emptyGuest(): NewGuest {
  return {
    name: '',
    family: '',
    side: undefined,
    phone: '',
    email: '',
    maxGuests: 1,
    invitedFunctionIds: [],
    notes: '',
  }
}
