// Dünner Client für die OpenRouter-API (OpenAI-kompatibel), mit Streaming.
// Powert die "Carsten GPT"-Chat-Seite.
// Standardmodell: deepseek/deepseek-v4-pro
// https://openrouter.ai/docs

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export function openRouterModel(): string {
  return process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-pro'
}

export function hasOpenRouter(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY)
}

function headers(): HeadersInit {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY fehlt')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    // Von OpenRouter empfohlen, hilft bei Attribution/Rate-Limits.
    'HTTP-Referer': 'https://das-tandem.vercel.app',
    'X-Title': 'Das Tandem - Carsten GPT',
  }
}

/**
 * Einmalige (nicht-streamende) Chat-Completion — liefert den fertigen Text.
 * Wird für die KI-News-Kuratierung genutzt (JSON-Ausgabe).
 */
export async function openRouterChat(
  messages: ChatMessage[],
  opts: {
    temperature?: number
    maxTokens?: number
    json?: boolean
    /** Reasoning-Modelle: false hält die Antwort schnell & günstig (für Kuratierung). */
    reasoning?: boolean
    signal?: AbortSignal
  } = {},
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: headers(),
    signal: opts.signal,
    body: JSON.stringify({
      model: openRouterModel(),
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 1500,
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      ...(opts.reasoning === false ? { reasoning: { enabled: false } } : {}),
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  return (data?.choices?.[0]?.message?.content ?? '') as string
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

/**
 * Streamt die Antwort des Modells als reinen Text (UTF-8-Bytes).
 * Parst die OpenAI-kompatiblen SSE-Chunks und gibt nur die Text-Deltas weiter.
 */
export async function openRouterStream(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number; signal?: AbortSignal } = {},
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: headers(),
    signal: opts.signal,
    body: JSON.stringify({
      model: openRouterModel(),
      messages,
      stream: true,
      temperature: opts.temperature ?? 0.4,
      // Großzügig: nemotron ist ein Reasoning-Modell, dessen Denk-Tokens
      // ebenfalls auf max_tokens zählen — sonst wird die Antwort abgeschnitten.
      max_tokens: opts.maxTokens ?? 2400,
    }),
  })

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`)
  }

  const upstream = res.body
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader()
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          // SSE: durch Zeilen getrennte "data:"-Events.
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const raw of lines) {
            const line = raw.trim()
            if (!line.startsWith('data:')) continue
            const data = line.slice(5).trim()
            if (data === '[DONE]') {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data)
              const delta: string = json?.choices?.[0]?.delta?.content ?? ''
              if (delta) controller.enqueue(encoder.encode(delta))
            } catch {
              /* Unvollständiges/Keep-alive-Event — überspringen. */
            }
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      } finally {
        reader.releaseLock()
      }
    },
  })
}
