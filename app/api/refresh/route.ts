import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getDailyContent } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Täglicher Refresh der KI-News (per Vercel-Cron, siehe vercel.json) oder manuell.
 * Invalidiert den Data Cache, generiert neu und wärmt den Cache vor.
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
    // Cache des Vortags verwerfen …
    revalidateTag('daily')
    revalidatePath('/')
    // … und sofort neu generieren, damit der erste Besuch schnell ist.
    const content = await getDailyContent()
    revalidatePath('/')

    return NextResponse.json({
      ok: true,
      date: content.date,
      mode: content.mode,
      news: content.news.length,
      carsten: content.carsten.length,
      generatedAt: content.generatedAt,
    })
  } catch (err) {
    console.error('[refresh] Fehler:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 },
    )
  }
}
