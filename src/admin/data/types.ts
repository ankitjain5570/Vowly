/**
 * Shared admin data shapes. These are backend-agnostic: the same types flow
 * whether the data comes from Supabase or the local-storage fallback, so the
 * UI never needs to know which is active.
 */

export type Role = 'pending' | 'admin' | 'superuser'

export interface Profile {
  id: string
  email: string
  role: Role
  createdAt: string
}

export type Side = 'bride' | 'groom'

export interface Guest {
  id: string
  name: string
  family?: string
  side?: Side
  phone?: string
  email?: string
  /** Max heads this invite covers (the guest + their party) */
  maxGuests: number
  /** Function ids this guest is invited to (empty = all) */
  invitedFunctionIds: string[]
  notes?: string
  createdAt: string
}

/** A guest row being created/imported (no id/createdAt yet). */
export type NewGuest = Omit<Guest, 'id' | 'createdAt'>

export type RsvpStatus = 'pending' | 'confirmed' | 'declined'

export interface RsvpRecord {
  id: string
  /** Links back to a guest-list entry when known */
  guestId?: string | null
  name: string
  phone?: string
  /** Total headcount incl. the primary guest */
  partySize: number
  /** Additional guests travelling with the primary */
  guests: string[]
  /** Function ids the party is attending */
  functions: string[]
  status: RsvpStatus
  message?: string
  /** ISO timestamp of submission */
  submittedAt: string
}
