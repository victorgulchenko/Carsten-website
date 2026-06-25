import { buildSystemMessage } from '@/lib/chatContext'
import { hasOpenRouter, openRouterStream, type ChatMessage } from '@/lib/openrouter'

export const runtime = 'nodejs'
export const maxDuration = 60

// Nur die letzten Nachrichten mitschicken — hält den Kontext schlank.
const MAX_HISTORY = 12

function isRole(r: unknown): r is 'user' | 'assistant' {
  return r === 'user' || r === 'assistant'
}

/** Einfache Text-Antwort als Stream (für Fehlermeldungen ohne Upstream). */
function textStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
}

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Accel-Buffering': 'no',
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response('Ungültige Anfrage.', { status: 400 })
  }

  const rawMessages = (body as { messages?: unknown })?.messages
  if (!Array.isArray(rawMessages)) {
    return new Response('Es wurden keine Nachrichten übergeben.', { status: 400 })
  }

  // Verlauf bereinigen und auf die letzten N kürzen.
  const history: ChatMessage[] = rawMessages
    .filter(
      (m): m is { role: string; content: string } =>
        Boolean(m) &&
        isRole((m as { role?: unknown }).role) &&
        typeof (m as { content?: unknown }).content === 'string',
    )
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content.slice(0, 8000) }))
    .slice(-MAX_HISTORY)

  if (history.length === 0) {
    return new Response('Es wurde keine Frage gestellt.', { status: 400 })
  }

  if (!hasOpenRouter()) {
    return new Response(
      textStream(
        'Mir fehlt gerade der Zugang zum Sprachmodell (kein `OPENROUTER_API_KEY` gesetzt). ' +
          'Sobald der Schlüssel hinterlegt ist, beantworte ich deine Fragen zu den News und zur Wissensbasis.',
      ),
      { headers: STREAM_HEADERS },
    )
  }

  try {
    const system = await buildSystemMessage()
    const stream = await openRouterStream([system, ...history], {
      temperature: 0.4,
      signal: request.signal,
    })
    return new Response(stream, { headers: STREAM_HEADERS })
  } catch (err) {
    console.error('[chat] OpenRouter-Fehler:', err)
    return new Response(
      textStream(
        'Entschuldige — beim Antworten ist gerade etwas schiefgelaufen. Bitte versuch es in einem Moment noch einmal.',
      ),
      { headers: STREAM_HEADERS },
    )
  }
}
