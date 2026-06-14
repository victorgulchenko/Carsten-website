// Dünner Client für die Groq-API (OpenAI-kompatibel).
// Standardmodell: groq/compound — agentisches System mit integrierter Websuche.
// https://console.groq.com/docs/compound

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

type Message = { role: 'system' | 'user' | 'assistant'; content: string }

export function groqModel(): string {
  // Standard: ein normales, schnelles Modell, das die RSS-Kandidaten kuratiert.
  // (groq/compound mit Websuche ist agentisch und sprengt das 30k-TPM-Free-Tier.)
  return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
}

export function hasGroq(): boolean {
  return Boolean(process.env.GROQ_API_KEY)
}

export async function groqChat(
  messages: Message[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY fehlt')

  const model = groqModel()
  const isCompound = model.startsWith('groq/compound')

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 1500,
  }
  // JSON-Modus nur für klassische Modelle; compound liefert agentischen Text.
  if (!isCompound) body.response_format = { type: 'json_object' }

  const payload = JSON.stringify(body)

  // Bis zu 2 Versuche: bei 429 (TPM-Limit) kurz warten und einmal erneut versuchen.
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: payload,
      })
      if (res.status === 429 && attempt === 0) {
        const wait = retryAfterMs(res.headers.get('retry-after'))
        await sleep(wait)
        continue
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Groq ${res.status}: ${text.slice(0, 300)}`)
      }
      const data = await res.json()
      return (data?.choices?.[0]?.message?.content ?? '') as string
    } finally {
      clearTimeout(timeout)
    }
  }
  throw new Error('Groq: Rate-Limit nach Wiederholung')
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function retryAfterMs(header: string | null): number {
  const secs = header ? Number(header) : NaN
  if (!Number.isNaN(secs) && secs > 0) return Math.min(secs * 1000 + 500, 15000)
  return 9000
}

/** Extrahiert das erste JSON-Objekt aus einem (evtl. mit Text umgebenen) String. */
export function extractJson<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Kein JSON in der Antwort gefunden')
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T
}
