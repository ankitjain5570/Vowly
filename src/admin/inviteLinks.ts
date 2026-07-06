/**
 * Saved custom invite links.
 *
 * Persisted in localStorage today so the admin can reuse links without a
 * backend. When Supabase is connected, replace these four functions with
 * table reads/writes — the InviteBuilder UI keeps working unchanged.
 */

export interface SavedInvite {
  id: string
  label: string
  functionIds: string[]
  extraIds: string[]
  createdAt: string
}

const KEY = 'vowly_saved_invites'

export function getSavedInvites(): SavedInvite[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedInvite[]) : []
  } catch {
    return []
  }
}

function write(list: SavedInvite[]): SavedInvite[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore storage errors */
  }
  return list
}

export function saveInvite(input: Omit<SavedInvite, 'id' | 'createdAt'>): SavedInvite[] {
  const entry: SavedInvite = {
    ...input,
    id: `inv_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  }
  return write([entry, ...getSavedInvites()])
}

export function deleteInvite(id: string): SavedInvite[] {
  return write(getSavedInvites().filter((i) => i.id !== id))
}
