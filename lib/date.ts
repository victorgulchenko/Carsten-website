// Datums-Helfer, alles in Europe/Berlin und auf Deutsch.

const TZ = 'Europe/Berlin'

/** ISO-Datum YYYY-MM-DD in Europe/Berlin. */
export function berlinDateKey(d: Date = new Date()): string {
  // en-CA liefert YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/** z. B. "Sonntag, 15. Juni 2026". */
export function formatGermanDate(isoDate: string): string {
  // Mittag wählen, damit die Zeitzone die Kalenderdaten nicht verschiebt.
  const d = new Date(`${isoDate}T12:00:00Z`)
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/** Kurze Uhrzeit z. B. "06:03". */
export function formatGermanTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
