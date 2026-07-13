import * as XLSX from 'xlsx'
import { weddingConfig } from '../wedding.config'
import { functionName } from '../admin/rsvpData'
import type { Guest, NewGuest, RsvpRecord, Side } from '../admin/data/types'

/**
 * Excel/CSV helpers for the admin console — guest import parsing and
 * RSVP/guest export, all via SheetJS (xlsx). Import accepts .xlsx, .xls or
 * .csv; export writes .xlsx.
 */

/* --------------------------------- import --------------------------------- */

/** Normalise a header cell to a lookup key: lowercased, alphanumerics only. */
function key(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Accepted column aliases → our field. Import is forgiving about headers.
const FIELD_ALIASES: Record<string, string[]> = {
  name: ['name', 'guest', 'guestname', 'fullname', 'primaryguest'],
  family: ['family', 'familyname', 'household', 'group'],
  side: ['side', 'party'],
  phone: ['phone', 'mobile', 'contact', 'number', 'whatsapp'],
  email: ['email', 'mail', 'emailaddress'],
  maxGuests: ['maxguests', 'seats', 'pax', 'headcount', 'partysize', 'count'],
  invited: ['invited', 'functions', 'events', 'celebrations', 'invitedto'],
  notes: ['notes', 'note', 'remarks', 'comment'],
}

function buildHeaderMap(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {}
  headers.forEach((h, i) => {
    const k = key(String(h ?? ''))
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(k) && !(field in map)) map[field] = i
    }
  })
  return map
}

const FUNCTION_IDS = weddingConfig.functions.map((f) => f.id)
const FUNCTION_NAME_TO_ID = new Map(
  weddingConfig.functions.map((f) => [f.name.toLowerCase(), f.id]),
)

/** Parse the "invited to" cell into known function ids (names or ids, comma-sep). */
function parseInvited(cell: unknown): string[] {
  if (cell == null || cell === '') return []
  const parts = String(cell)
    .split(/[,;/|]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const ids = parts
    .map((p) => (FUNCTION_IDS.includes(p) ? p : FUNCTION_NAME_TO_ID.get(p)))
    .filter((x): x is string => Boolean(x))
  return [...new Set(ids)]
}

function parseSide(cell: unknown): Side | undefined {
  const v = String(cell ?? '').trim().toLowerCase()
  if (v.startsWith('brid')) return 'bride'
  if (v.startsWith('groom')) return 'groom'
  return undefined
}

export interface ParsedImport {
  guests: NewGuest[]
  /** Row numbers (1-based, incl. header) that were skipped for having no name. */
  skipped: number
}

/** Read a File (xlsx/xls/csv) into ready-to-insert guest rows. */
export async function parseGuestFile(file: File): Promise<ParsedImport> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false })
  if (rows.length === 0) return { guests: [], skipped: 0 }

  const headers = (rows[0] as unknown[]).map((h) => String(h ?? ''))
  const hmap = buildHeaderMap(headers)
  // If no recognised "name" header, treat the first column as the name.
  const nameIdx = hmap.name ?? 0

  const guests: NewGuest[] = []
  let skipped = 0
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[]
    const name = String(row[nameIdx] ?? '').trim()
    if (!name) {
      skipped++
      continue
    }
    const at = (field: string): unknown => (field in hmap ? row[hmap[field]] : undefined)
    const maxRaw = Number(at('maxGuests'))
    guests.push({
      name,
      family: String(at('family') ?? '').trim() || undefined,
      side: parseSide(at('side')),
      phone: String(at('phone') ?? '').trim() || undefined,
      email: String(at('email') ?? '').trim() || undefined,
      maxGuests: Number.isFinite(maxRaw) && maxRaw > 0 ? Math.floor(maxRaw) : 1,
      invitedFunctionIds: parseInvited(at('invited')),
      notes: String(at('notes') ?? '').trim() || undefined,
    })
  }
  return { guests, skipped }
}

/* --------------------------------- export --------------------------------- */

function download(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Export RSVPs to a formatted .xlsx (one row per RSVP). */
export function exportRsvpsToExcel(records: RsvpRecord[]): void {
  const statusLabel: Record<string, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    declined: 'Declined',
  }
  const rows = records.map((r) => ({
    Guest: r.name,
    Phone: r.phone ?? '',
    Status: statusLabel[r.status] ?? r.status,
    'Party size': r.partySize,
    'Additional guests': r.guests.join(', '),
    Attending: r.functions.map(functionName).join(', '),
    Message: r.message ?? '',
    Submitted: r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-IN') : '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 22 },
    { wch: 16 },
    { wch: 11 },
    { wch: 10 },
    { wch: 30 },
    { wch: 28 },
    { wch: 40 },
    { wch: 20 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'RSVPs')
  download(wb, `vowly-rsvps-${today()}.xlsx`)
}

/** Export the guest list to a formatted .xlsx. */
export function exportGuestsToExcel(guests: Guest[]): void {
  const rows = guests.map((g) => ({
    Name: g.name,
    Family: g.family ?? '',
    Side: g.side ?? '',
    Phone: g.phone ?? '',
    Email: g.email ?? '',
    'Max guests': g.maxGuests,
    'Invited to': (g.invitedFunctionIds.length ? g.invitedFunctionIds : FUNCTION_IDS)
      .map(functionName)
      .join(', '),
    Notes: g.notes ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 22 },
    { wch: 18 },
    { wch: 8 },
    { wch: 16 },
    { wch: 24 },
    { wch: 10 },
    { wch: 28 },
    { wch: 30 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Guests')
  download(wb, `vowly-guests-${today()}.xlsx`)
}
