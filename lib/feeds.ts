// Leichtgewichtiges Abrufen + Parsen der deutschen KI-News-Feeds.
// Bewusst ohne externe Dependency: die Feeds sind einfach genug für reguläre Ausdrücke.

export type FeedCandidate = {
  title: string
  url: string
  snippet: string
  published: string // ISO oder ''
  source: string
}

// Die Quellen aus knowledge.md ("Quellen zum Dranbleiben").
const FEEDS: { url: string; source: string; aiOnly: boolean }[] = [
  { url: 'https://the-decoder.de/feed/', source: 'The Decoder', aiOnly: true },
  { url: 'https://t3n.de/rss.xml', source: 't3n', aiOnly: false },
  { url: 'https://www.heise.de/rss/heise-atom.xml', source: 'Heise online', aiOnly: false },
]

const AI_KEYWORDS =
  /(künstliche intelligenz|\bki\b|\bk\.i\.|\bai\b|\bllm\b|\bgpt\b|chatgpt|claude|anthropic|openai|gemini|deepmind|mistral|llama|deepseek|qwen|sprachmodell|machine learning|maschinelles lernen|neuronal|generative|\bagent|copilot|sora|nvidia|hugging\s?face)/i

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&#x2019;/g, '’')
    .replace(/&#8211;|&#x2013;/g, '–')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, ' ')
    .trim()
}

function pick(block: string, tags: string[]): string {
  for (const tag of tags) {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
    if (m) return m[1]
  }
  return ''
}

function pickLink(block: string): string {
  // Atom: <link href="..."/> (rel="alternate" bevorzugt)
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)
  if (alt) return alt[1]
  const href = block.match(/<link[^>]*href=["']([^"']+)["']/i)
  if (href) return href[1]
  // RSS: <link>...</link>
  const rss = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)
  if (rss) return decodeEntities(rss[1])
  return ''
}

export function parseFeed(xml: string, source: string): FeedCandidate[] {
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) ?? []
  const out: FeedCandidate[] = []
  for (const block of blocks) {
    const title = decodeEntities(pick(block, ['title']))
    const url = pickLink(block).trim()
    const snippet = decodeEntities(
      pick(block, ['description', 'summary', 'content:encoded', 'content']),
    ).slice(0, 400)
    const published = pick(block, ['pubDate', 'published', 'updated', 'dc:date'])
    if (!title || !url) continue
    let iso = ''
    if (published) {
      const d = new Date(decodeEntities(published))
      if (!Number.isNaN(d.getTime())) iso = d.toISOString()
    }
    out.push({ title, url, snippet, published: iso, source })
  }
  return out
}

async function fetchOne(
  url: string,
  source: string,
  aiOnly: boolean,
): Promise<FeedCandidate[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DasTandem/1.0 (Reverse-Mentoring News-Aggregator)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    })
    if (!res.ok) return []
    const xml = await res.text()
    let items = parseFeed(xml, source)
    if (aiOnly === false) {
      items = items.filter((i) => AI_KEYWORDS.test(`${i.title} ${i.snippet}`))
    }
    return items
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Holt alle Feeds parallel, behält aktuelle Einträge (≈ letzte 3 Tage),
 * sortiert nach Datum (neueste zuerst) und entfernt Duplikate.
 */
export async function fetchCandidates(limit = 30): Promise<FeedCandidate[]> {
  const results = await Promise.all(FEEDS.map((f) => fetchOne(f.url, f.source, f.aiOnly)))
  const all = results.flat()

  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
  const fresh = all.filter((i) => !i.published || new Date(i.published).getTime() >= threeDaysAgo)

  // Duplikate per URL/Titel entfernen.
  const seen = new Set<string>()
  const deduped: FeedCandidate[] = []
  for (const i of fresh) {
    const key = i.url.replace(/[#?].*$/, '')
    const tkey = i.title.toLowerCase().slice(0, 60)
    if (seen.has(key) || seen.has(tkey)) continue
    seen.add(key)
    seen.add(tkey)
    deduped.push(i)
  }

  deduped.sort((a, b) => (b.published || '').localeCompare(a.published || ''))
  return deduped.slice(0, limit)
}
