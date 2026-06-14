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

/**
 * Liefert den Tagesinhalt.
 *
 * WICHTIG: Diese Funktion generiert bei jedem Aufruf neu. Die Stabilität
 * ("einmal pro Tag bauen, sonst unverändert ausliefern") kommt aus dem
 * ISR-Cache der Seite (`export const revalidate = 86400`) plus dem täglichen
 * Cron, der `revalidatePath('/')` aufruft. So sieht jeder denselben
 * Tages-Snapshot — es wird NICHT pro Anfrage neu gewürfelt.
 */
export async function getDailyContent(): Promise<DailyContent> {
  try {
    const content = await generateDailyContent()
    if (!content.news || content.news.length === 0) return seedForToday()
    return content
  } catch (err) {
    console.error('[content] Generierung fehlgeschlagen, nutze Seed:', err)
    return seedForToday()
  }
}
