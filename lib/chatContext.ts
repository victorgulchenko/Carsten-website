import { unstable_cache } from 'next/cache'
import { getDailyContent } from './content'
import { getKnowledge } from './knowledge'
import { berlinDateKey, formatGermanDate } from './date'
import { CARSTEN_CONTEXT } from './carsten'
import type { ChatMessage } from './openrouter'
import type { NewsItem } from './types'

/**
 * Tagesinhalt für den Chat — einmal pro Tag erzeugt und gecacht, damit jede
 * Chat-Nachricht NICHT die News-Generierung erneut auslöst. Gleicher
 * Tages-Snapshot wie die Startseite (Revalidate 24 h, Tag-basierter Key).
 */
const getCachedDailyContent = unstable_cache(
  async () => getDailyContent(),
  ['carsten-gpt-daily-content'],
  { revalidate: 86400, tags: ['daily-content'] },
)

/** Die heutigen Top-News für die Schnell-Vorschläge der Chat-Seite. */
export async function getDailyNews(limit = 4): Promise<NewsItem[]> {
  try {
    const content = await getCachedDailyContent()
    return content.news.slice(0, limit)
  } catch {
    return []
  }
}

/** Formatiert die aktuellen Tages-News (max. 10) für den Kontext. */
function formatNews(news: { title: string; summary: string; source: string; url: string }[]): string {
  if (news.length === 0) return '(Heute liegen keine News vor.)'
  return news
    .slice(0, 10)
    .map(
      (n, i) =>
        `${i + 1}. ${n.title} — ${n.summary} [Quelle: ${n.source}, ${n.url}]`,
    )
    .join('\n')
}

/** Formatiert die Wissensbasis kompakt für den Kontext. */
function formatKnowledge(
  entries: { category: string; title: string; kurz: string; erklaerung: string; mentoring?: string; tags: string[] }[],
): string {
  if (entries.length === 0) return '(Wissensbasis nicht verfügbar.)'
  return entries
    .map((e) => {
      const parts = [`### ${e.title} — Kategorie: ${e.category}`]
      if (e.kurz) parts.push(`Kurz: ${e.kurz}`)
      if (e.erklaerung) parts.push(`Erklärung: ${e.erklaerung}`)
      if (e.mentoring) parts.push(`Im Mentoring: ${e.mentoring}`)
      if (e.tags.length) parts.push(`Tags: ${e.tags.join(', ')}`)
      return parts.join('\n')
    })
    .join('\n\n')
}

/**
 * Baut die System-Nachricht für "Carsten GPT": Persona auf Deutsch, Markdown,
 * technische Dinge etwas einfacher erklären — plus die aktuellen News und die
 * Wissensbasis als Wissensgrundlage.
 */
export async function buildSystemMessage(): Promise<ChatMessage> {
  const [content, knowledge] = await Promise.all([
    getCachedDailyContent().catch(() => null),
    getKnowledge().catch(() => []),
  ])

  const dateLabel = formatGermanDate(berlinDateKey())
  const newsBlock = content ? formatNews(content.news) : '(News momentan nicht verfügbar.)'
  const knowledgeBlock = formatKnowledge(knowledge)

  const system = `Du bist „Carsten GPT", der KI-Assistent der Website „Das Tandem" (Reverse-Mentoring-Projekt rund um KI, mit täglichen KI-News und einer Wissensbasis).

DEINE REGELN:
- Antworte IMMER auf Deutsch, locker und direkt — sprich den Nutzer mit „du" an.
- Fasse dich KURZ und komm schnell auf den Punkt. Bei einer News: 2–4 Sätze, worum es geht, plus höchstens 1–2 wirklich relevante Punkte. KEINE seitenlangen Antworten, keine Abschnitts-Überschriften pro Aspekt, kein „Fazit". Lieber zu knapp als zu lang — bei Bedarf bietest du an, mehr ins Detail zu gehen.
- Formatiere mit Markdown nur, wo es wirklich hilft (kurze Listen, **Fettung**, \`Code\`). Nicht überformatieren.
- Erkläre technisches eine Spur zugänglicher (kurze Analogien ok), aber bleib präzise.
- Stütze dich auf die gelieferten News und die Wissensbasis. Erfinde keine Fakten, Zahlen oder Quellen. Steht etwas nicht drin, sag das in EINEM kurzen Halbsatz und antworte aus Allgemeinwissen.

UNSICHTBARE PERSONALISIERUNG (sehr wichtig):
Der Nutzer, mit dem du sprichst, IST Carsten. Hier sein Hintergrund — ausschließlich für DICH, damit du einschätzen kannst, was für ihn relevant ist:
${CARSTEN_CONTEXT}
So gehst du damit um:
- Sprich ihn NIE in der dritten Person an („für Carsten", „Carstens Arbeit") und kündige NIEMALS an, dass du etwas auf ihn zuschneidest („was das für dich bedeutet", „Einordnung für dich"). Solche Meta-Hinweise sind verboten.
- Nutze den Hintergrund nur STILL: gewichte, was relevant ist, und wähle Beispiele aus seiner Welt — aber so, als wäre es einfach eine normale, gute Antwort. Die Anpassung bleibt unsichtbar.

Heutiges Datum: ${dateLabel}.

═══ AKTUELLE KI-NEWS ═══
${newsBlock}

═══ WISSENSBASIS ═══
${knowledgeBlock}`

  return { role: 'system', content: system }
}
