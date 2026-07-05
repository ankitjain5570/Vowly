import { weddingConfig } from '../wedding.config'

/**
 * RSVP data layer.
 *
 * Today this returns dummy records so the dashboard is fully functional
 * without a backend. When Supabase is connected, replace the body of
 * `getRsvps()` with a query (e.g. `supabase.from('rsvps').select()`), keep
 * the RsvpRecord shape, and the whole dashboard keeps working unchanged.
 */

export type RsvpStatus = 'confirmed' | 'pending' | 'declined'

export interface RsvpRecord {
  id: string
  /** Primary guest name */
  name: string
  phone: string
  /** Total headcount incl. the primary guest */
  partySize: number
  /** Additional guests travelling with the primary */
  guests: string[]
  /** Function ids the party is attending (see weddingConfig.functions) */
  functions: string[]
  status: RsvpStatus
  message?: string
  /** ISO timestamp of submission */
  submittedAt: string
}

/** Human-readable function name for a function id. */
export function functionName(id: string): string {
  return weddingConfig.functions.find((f) => f.id === id)?.name ?? id
}

/** All function ids in display order — for building attendance breakdowns. */
export const allFunctionIds = weddingConfig.functions.map((f) => f.id)

const ALL = allFunctionIds
const CORE = ['engagement', 'wedding', 'reception']

const DUMMY: RsvpRecord[] = [
  {
    id: 'r01',
    name: 'Ananya Verma',
    phone: '+91 98761 20034',
    partySize: 4,
    guests: ['Rahul Verma', 'Ishaan Verma', 'Kavya Verma'],
    functions: ALL,
    status: 'confirmed',
    message: 'So thrilled for you both — we’ll be there for every function!',
    submittedAt: '2026-09-14T18:22:00+05:30',
  },
  {
    id: 'r02',
    name: 'Rohan Sharma',
    phone: '+91 98110 55221',
    partySize: 2,
    guests: ['Meera Sharma'],
    functions: ['wedding', 'reception'],
    status: 'confirmed',
    submittedAt: '2026-09-15T09:05:00+05:30',
  },
  {
    id: 'r03',
    name: 'Priya Nair',
    phone: '+91 99450 88210',
    partySize: 1,
    guests: [],
    functions: ['mehendi', 'cocktail', 'wedding'],
    status: 'pending',
    message: 'Trying to shuffle my travel — will confirm the mehendi soon.',
    submittedAt: '2026-09-16T21:40:00+05:30',
  },
  {
    id: 'r04',
    name: 'Karan Mehta',
    phone: '+91 98330 41290',
    partySize: 5,
    guests: ['Sneha Mehta', 'Aarav Mehta', 'Diya Mehta', 'Nani Mehta'],
    functions: ALL,
    status: 'confirmed',
    submittedAt: '2026-09-16T11:12:00+05:30',
  },
  {
    id: 'r05',
    name: 'Sofia D’Souza',
    phone: '+91 90080 33471',
    partySize: 2,
    guests: ['Ryan D’Souza'],
    functions: ['cocktail', 'wedding'],
    status: 'pending',
    submittedAt: '2026-09-18T16:03:00+05:30',
  },
  {
    id: 'r06',
    name: 'Vikram Singh',
    phone: '+91 97110 62839',
    partySize: 3,
    guests: ['Harleen Kaur', 'Gurnoor Singh'],
    functions: CORE,
    status: 'confirmed',
    submittedAt: '2026-09-19T08:47:00+05:30',
  },
  {
    id: 'r07',
    name: 'Neha Kapoor',
    phone: '+91 98991 20475',
    partySize: 1,
    guests: [],
    functions: ['haldi', 'mehendi'],
    status: 'declined',
    message: 'Heartbroken to miss it — sending all my love and blessings.',
    submittedAt: '2026-09-20T13:29:00+05:30',
  },
  {
    id: 'r08',
    name: 'Aditya Rao',
    phone: '+91 96860 71120',
    partySize: 2,
    guests: ['Lakshmi Rao'],
    functions: ['wedding', 'reception'],
    status: 'confirmed',
    submittedAt: '2026-09-21T19:55:00+05:30',
  },
  {
    id: 'r09',
    name: 'Fatima Sheikh',
    phone: '+91 99000 44518',
    partySize: 4,
    guests: ['Imran Sheikh', 'Zara Sheikh', 'Bilal Sheikh'],
    functions: ['engagement', 'cocktail', 'wedding', 'reception'],
    status: 'pending',
    submittedAt: '2026-09-22T10:18:00+05:30',
  },
  {
    id: 'r10',
    name: 'Manish Gupta',
    phone: '+91 98180 90312',
    partySize: 2,
    guests: ['Ritu Gupta'],
    functions: ['reception'],
    status: 'declined',
    submittedAt: '2026-09-23T15:41:00+05:30',
  },
  {
    id: 'r11',
    name: 'Tara Iyer',
    phone: '+91 90420 66890',
    partySize: 3,
    guests: ['Suresh Iyer', 'Anjali Iyer'],
    functions: ALL,
    status: 'confirmed',
    message: 'Counting down the days! The whole family is coming.',
    submittedAt: '2026-09-24T12:07:00+05:30',
  },
  {
    id: 'r12',
    name: 'Daniel Fernandes',
    phone: '+91 97390 21774',
    partySize: 1,
    guests: [],
    functions: ['cocktail', 'wedding'],
    status: 'pending',
    submittedAt: '2026-09-25T20:33:00+05:30',
  },
  {
    id: 'r13',
    name: 'Pooja Malhotra',
    phone: '+91 98717 03388',
    partySize: 6,
    guests: ['Arjun Malhotra', 'Simran Malhotra', 'Kabir Malhotra', 'Naina Malhotra', 'Dadi Malhotra'],
    functions: ['haldi', 'mehendi', 'wedding', 'reception'],
    status: 'confirmed',
    submittedAt: '2026-09-26T09:14:00+05:30',
  },
  {
    id: 'r14',
    name: 'Sameer Khanna',
    phone: '+91 96540 55127',
    partySize: 2,
    guests: ['Ayesha Khanna'],
    functions: ['engagement', 'wedding'],
    status: 'pending',
    submittedAt: '2026-09-27T17:50:00+05:30',
  },
]

/** Fetch all RSVPs. Swap the return for a Supabase query when ready. */
export function getRsvps(): RsvpRecord[] {
  return DUMMY.map((r) => ({ ...r, guests: [...r.guests], functions: [...r.functions] }))
}
