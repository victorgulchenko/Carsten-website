import type { CarstenNote, DailyContent, NewsItem } from './types'
import { fetchCandidates, type FeedCandidate } from './feeds'
import { getKnowledge } from './knowledge'
import { groqChat, extractJson, hasGroq } from './groq'
import { CARSTEN_CONTEXT, CARSTEN_PROCESSES } from './carsten'
import { berlinDateKey } from './date'

function slug(s: string, i: number): string {
  return (
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || `item-${i}`
  )
}

function clean(s: unknown): string {
  return String(s ?? '').replace(/\s+/g, ' ').trim()
}

/** Degraded-Modus: ohne Groq die frischesten echten Schlagzeilen zeigen. */
function fallbackNews(candidates: FeedCandidate[]): NewsItem[] {
  // Bevorzugt The Decoder (rein KI, deutsch), dann der Rest.
  const ordered = [
    ...candidates.filter((c) => c.source === 'The Decoder'),
    ...candidates.filter((c) => c.source !== 'The Decoder'),
  ]
  return ordered.slice(0, 6).map((c, i) => ({
    id: slug(c.title, i),
    title: clean(c.title),
    summary: clean(c.snippet).slice(0, 180) || clean(c.title),
    url: c.url,
    source: c.source,
  }))
}

type NewsOut = { news?: { n?: number; title?: string; summary?: string }[] }
type CarstenOut = { carsten?: { n?: number; process?: string; text?: string }[] }

// Bewusst knapp: nur die besten Kandidaten ins Prompt (Free-Tier-Tokenbudget).
const MAX_CANDIDATES_FOR_PROMPT = 12

// ── Pass 1: News auswählen + auf deutsch zusammenfassen ────────────────────
function newsPrompt(candidates: FeedCandidate[], dateKey: string) {
  const list = candidates
    .map((c, i) => `[${i + 1}] ${c.title} — ${c.source}\n    ${clean(c.snippet).slice(0, 140)}`)
    .join('\n\n')

  const system = `Du bist die Redaktion von "Das Tandem", einer deutschsprachigen KI-News-Seite.
Du schreibst nüchtern, präzise, auf Deutsch. Kein Hype. Du arbeitest AUSSCHLIESSLICH mit den gelieferten Kandidaten und verweist über deren Nummer "n". Du erfindest nichts.`

  const user = `Heutiges Datum: ${dateKey}.

Wähle aus den nummerierten Kandidaten die wichtigsten KI-Nachrichten und ordne sie nach Bedeutung.
Gib MINDESTENS 5 und HÖCHSTENS 7 Einträge zurück (genau 6, falls genug Kandidaten da sind) — auch solide, weniger spektakuläre KI-Meldungen zählen. Pro Eintrag:
- "n": die Nummer des Kandidaten.
- "title": kurze, sachliche deutsche Überschrift (gern leicht geglättet).
- "summary": 1–2 SEHR kurze deutsche Sätze: Was ist passiert, warum relevant.

KANDIDATEN:
${list}

Antworte NUR mit JSON, ohne Markdown:
{"news":[{"n":1,"title":"","summary":""}]}`

  return { system, user }
}

// ── Pass 2: Für Carsten — analytisch, NICHT die News nacherzählen ───────────
function carstenPrompt(news: NewsItem[], knowledgeIndex: string) {
  const list = news.map((it, i) => `[${i + 1}] ${it.title} — ${it.summary}`).join('\n')

  const system = `Du bist Victor und schreibst kurze, kluge Notizen für Carsten im Reverse Mentoring.
Du kennst seine Arbeit im Model Risk Management der KfW genau. Du schreibst nur, wenn eine Meldung WIRKLICH einen seiner konkreten Prozesse berührt — und dann nicht als Zusammenfassung, sondern als praktische Konsequenz für ihn.`

  const user = `${CARSTEN_CONTEXT}

Tools/Methoden aus euren Treffen (als Anknüpfung nutzbar): ${knowledgeIndex}

Die heutigen News (Carsten LIEST sie bereits in der linken Spalte):
${list}

Aufgabe: Wähle NUR die News mit einem KONKRETEN Nutzen oder einer konkreten Konsequenz für genau einen seiner Prozesse. Sei streng — lieber 0–2 wirklich gute Notizen als 4 mittelmäßige.

Jede Notiz MUSS:
- die News NICHT nacherzählen (er hat sie gelesen). Stattdessen: Was bedeutet das für SEINE Arbeit? Was könnte er konkret tun, prüfen oder ausprobieren?
- an einen konkreten Prozess anknüpfen, gern mit Detail: SAS→Python-Migration (mit Boyan & Thomas, erst 1:1 dann optimieren), Modellvalidierung, Modelldoku für die Aufsicht, Copilot-Kontextlimit (250k), Daten bleiben im Haus / VPC.
- 1–2 natürliche Sätze, Muster sinngemäß "… könnte bei … helfen/wichtig sein, weil …".
- ehrlich sein: KEIN erzwungener Bezug. Wäre die Verbindung nur "KI ist riskant, also validieren", dann LASS DIE NEWS WEG.

Felder pro Notiz:
- "n": Nummer der zugehörigen News (aus der Liste oben).
- "process": eines von: ${CARSTEN_PROCESSES.join(', ')}.
- "text": die Notiz.

Wenn heute nichts wirklich passt: gib {"carsten":[]} zurück. Das ist ausdrücklich ok.

Antworte NUR mit JSON, ohne Markdown:
{"carsten":[{"n":1,"process":"","text":""}]}`

  return { system, user }
}

async function selectNews(pool: FeedCandidate[], dateKey: string): Promise<NewsItem[]> {
  const { system, user } = newsPrompt(pool, dateKey)
  const raw = await groqChat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ])
  if (process.env.TANDEM_DEBUG) console.error('[debug] news raw:\n%s', raw.slice(0, 700))
  const parsed = extractJson<NewsOut>(raw)

  const news: NewsItem[] = []
  const seen = new Set<number>()
  for (const n of parsed.news ?? []) {
    const idx = Number(n.n) - 1
    if (!Number.isInteger(idx) || idx < 0 || idx >= pool.length || seen.has(idx)) continue
    seen.add(idx)
    const c = pool[idx]
    news.push({
      id: slug(clean(n.title) || c.title, news.length),
      title: clean(n.title) || clean(c.title),
      summary: clean(n.summary) || clean(c.snippet).slice(0, 180) || clean(c.title),
      url: c.url,
      source: c.source,
    })
    if (news.length >= 7) break
  }
  return news
}

async function carstenNotes(news: NewsItem[], knowledgeIndex: string): Promise<CarstenNote[]> {
  try {
    const { system, user } = carstenPrompt(news, knowledgeIndex)
    const raw = await groqChat(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { temperature: 0.4 },
    )
    if (process.env.TANDEM_DEBUG) console.error('[debug] carsten raw:\n%s', raw.slice(0, 700))
    const parsed = extractJson<CarstenOut>(raw)

    const carsten: CarstenNote[] = []
    for (const c of parsed.carsten ?? []) {
      if (!clean(c.text)) continue
      const ref = news[Number(c.n) - 1]
      carsten.push({
        id: `carsten-${carsten.length}-${slug(clean(c.process), carsten.length)}`,
        process: clean(c.process) || 'Modellrisiko',
        text: clean(c.text),
        newsTitle: ref?.title,
        url: ref?.url,
      })
      if (carsten.length >= 5) break
    }
    return carsten
  } catch (err) {
    // Carsten-Spalte darf scheitern, ohne die News zu kippen — dann bleibt sie ruhig.
    console.error('[generate] Carsten-Pass fehlgeschlagen, Spalte bleibt leer:', err)
    return []
  }
}

async function generateWithGroq(
  candidates: FeedCandidate[],
  dateKey: string,
): Promise<{ news: NewsItem[]; carsten: CarstenNote[] }> {
  const pool = candidates.slice(0, MAX_CANDIDATES_FOR_PROMPT)
  const knowledge = await getKnowledge()
  const knowledgeIndex = knowledge.map((e) => e.title).join(', ')

  const news = await selectNews(pool, dateKey)
  if (news.length === 0) throw new Error('Groq lieferte keine verwertbaren News')

  const carsten = await carstenNotes(news, knowledgeIndex)
  return { news, carsten }
}

/** Erzeugt den Tagesinhalt: RSS holen, mit Groq kuratieren, sonst Degraded-Modus. */
export async function generateDailyContent(): Promise<DailyContent> {
  const dateKey = berlinDateKey()
  const generatedAt = new Date().toISOString()
  const candidates = await fetchCandidates(16)

  if (hasGroq() && candidates.length > 0) {
    try {
      const { news, carsten } = await generateWithGroq(candidates, dateKey)
      return { date: dateKey, generatedAt, mode: 'groq', news, carsten }
    } catch (err) {
      console.error('[generate] Groq fehlgeschlagen, Fallback auf RSS:', err)
    }
  }

  // Degraded: echte Schlagzeilen ohne Kuratierung, ruhige Carsten-Spalte.
  return {
    date: dateKey,
    generatedAt,
    mode: 'rss',
    news: fallbackNews(candidates),
    carsten: [],
  }
}
