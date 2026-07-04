import type { WeddingFunction } from '../wedding.config'
import { weddingConfig } from '../wedding.config'

/** Format an ISO datetime as UTC iCalendar basic format (YYYYMMDDTHHMMSSZ). */
function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Escape commas/semicolons/newlines per RFC 5545. */
function icsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
}

/**
 * Build an .ics calendar event from a function's config entry and trigger a
 * download — no backend needed, works from WhatsApp's in-app browser too.
 */
export function downloadICS(fn: WeddingFunction): void {
  const { couple } = weddingConfig
  const summary = `${fn.name} — ${couple.bride} & ${couple.groom}'s Wedding`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WeddingInvite//Template//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${fn.id}-${icsDate(fn.startISO)}@wedding-invite`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(fn.startISO)}`,
    `DTEND:${icsDate(fn.endISO)}`,
    `SUMMARY:${icsText(summary)}`,
    `DESCRIPTION:${icsText(`${fn.description} Dress code: ${fn.dressCode}.`)}`,
    `LOCATION:${icsText(`${fn.venueName}, ${fn.venueAddress}`)}`,
    `URL:${fn.mapsUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fn.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
