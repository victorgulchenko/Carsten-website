import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Täglicher Refresh der KI-News (per Vercel-Cron, siehe vercel.json) oder manuell.
 * Verwirft den ISR-Snapshot der Startseite und wärmt ihn neu — so wechselt der
 * Inhalt genau einmal pro Tag und bleibt dazwischen stabil.
 * Schutz optional via CRON_SECRET (Vercel-Cron sendet ihn als Bearer-Token).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Tages-Snapshot verwerfen → wird beim nächsten Aufruf neu gebaut.
    revalidatePath('/')

    // Proaktiv aufwärmen, damit schon der erste Besuch den frischen Snapshot sieht.
    let warmed = false
    const host = request.headers.get('host')
    if (host) {
      const proto = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https'
      try {
        const res = await fetch(`${proto}://${host}/`, { cache: 'no-store' })
        warmed = res.ok
      } catch {
        /* Aufwärmen ist best-effort; ISR baut sonst beim ersten Besuch. */
      }
    }

    return NextResponse.json({ ok: true, revalidated: true, warmed })
  } catch (err) {
    console.error('[refresh] Fehler:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 },
    )
  }
}
