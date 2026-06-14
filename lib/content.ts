import { unstable_cache } from 'next/cache'
import type { DailyContent } from './types'
import { generateDailyContent } from './generate'
import { berlinDateKey } from './date'
import seed from '@/data/seed.json'

const SEED = seed as DailyContent

/** Seed-Inhalt mit heutigem Datum (Notnagel, falls alle Live-Quellen ausfallen). */
function seedForToday(): DailyContent {
  return {
    ...SEED,
    date: berlinDateKey(),
    generatedAt: new Date().toISOString(),
    mode: 'seed',
  }
}

async function load(): Promise<DailyContent> {
  try {
    const content = await generateDailyContent()
    if (!content.news || content.news.length === 0) return seedForToday()
    return content
  } catch (err) {
    console.error('[content] Generierung fehlgeschlagen, nutze Seed:', err)
    return seedForToday()
  }
}

/**
 * Tagesinhalt mit Next.js Data Cache: einmal pro Tag generiert, danach aus dem Cache.
 * Der Cron (/api/refresh) ruft revalidateTag('daily') auf und wärmt den Cache neu.
 * Kein externer Speicher nötig.
 */
export const getDailyContent = unstable_cache(load, ['daily-content-v1'], {
  revalidate: 60 * 60 * 24,
  tags: ['daily'],
})
