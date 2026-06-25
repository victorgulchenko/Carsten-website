'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowUp, Check, Copy, Newspaper, Sparkles, Square, SquarePen } from 'lucide-react'

type NewsRef = { title: string; source: string }
type Msg = { role: 'user' | 'assistant'; content: string; news?: NewsRef }

export type NewsSuggestion = { title: string; summary: string; source: string }

type Suggestion = { title: string; subtitle: string; prompt: string; news?: NewsRef }

// Wird genutzt, falls heute (noch) keine News vorliegen.
const FALLBACK_SUGGESTIONS: Suggestion[] = [
  {
    title: 'RAG einfach erklärt',
    subtitle: 'Erklär mir RAG, dass ich es weitergeben kann.',
    prompt: 'Erklär mir RAG so, dass ich es einem Kollegen weitergeben kann.',
  },
  {
    title: 'SAS → Python',
    subtitle: 'Was steht dazu in der Wissensbasis?',
    prompt: 'Was steht in der Wissensbasis zur SAS→Python-Migration?',
  },
  {
    title: 'AWS Bedrock',
    subtitle: 'Warum für regulierte Banken interessant?',
    prompt: 'Warum ist AWS Bedrock für regulierte Banken interessant?',
  },
  {
    title: 'Modellvalidierung',
    subtitle: 'Worauf bei KI-Modellen achten?',
    prompt: 'Worauf sollte ich bei der Validierung von KI-Modellen besonders achten?',
  },
]

/** Baut aus einer Tages-News einen Schnell-Vorschlag. Die Zusammenfassung wird
 *  mitgeschickt, damit das Modell die News immer kennt (auch wenn der Tages-
 *  Snapshot inzwischen anders ist). Angezeigt wird nur eine kompakte News-Karte. */
function newsToSuggestion(n: NewsSuggestion): Suggestion {
  return {
    title: n.title,
    subtitle: n.summary,
    prompt: `Erklär mir diese News kurz: worum geht's, und was ist daran relevant?\n\nTitel: ${n.title}\nQuelle: ${n.source}\nZusammenfassung: ${n.summary}`,
    news: { title: n.title, source: n.source },
  }
}

/** Text robust in die Zwischenablage kopieren (mit Fallback). */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* Fallback unten. */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.top = '-9999px'
    ta.setAttribute('readonly', '')
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/** Markdown der Assistenten-Antwort, im warmen Stein-Stil der Seite. */
function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="my-2.5 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
        h1: ({ children }) => (
          <h1 className="mb-2 mt-4 font-serif text-xl font-semibold text-stone-900 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-4 font-serif text-lg font-semibold text-stone-900 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1.5 mt-3 font-serif text-base font-semibold text-stone-900 first:mt-0">{children}</h3>
        ),
        ul: ({ children }) => <ul className="my-2.5 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="my-2.5 list-decimal space-y-1 pl-5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 hover:text-amber-800"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-2 border-stone-300 pl-3 text-stone-500">{children}</blockquote>
        ),
        code: ({ className, children }) => {
          const isBlock = /language-/.test(className ?? '')
          if (isBlock) {
            return <code className={`${className ?? ''} font-mono text-[13px]`}>{children}</code>
          }
          return (
            <code className="rounded bg-stone-200/70 px-1 py-0.5 font-mono text-[0.85em] text-stone-800">
              {children}
            </code>
          )
        },
        pre: ({ children }) => (
          <pre className="my-3 overflow-x-auto rounded-lg bg-stone-900 p-3.5 text-stone-100">{children}</pre>
        ),
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-stone-300 bg-stone-100 px-2.5 py-1.5 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => <td className="border border-stone-200 px-2.5 py-1.5">{children}</td>,
        hr: () => <hr className="my-4 border-stone-200" />,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

/** Kleiner Assistenten-Avatar (Funke im Bernstein-Kreis). */
function AssistantAvatar() {
  return (
    <div className="mt-0.5 flex size-7 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200/70">
      <Sparkles className="size-3.5" />
    </div>
  )
}

/** "denkt nach …" — sichtbares Signal während der Reasoning-Phase des Modells. */
function Thinking() {
  return (
    <span className="inline-flex items-center gap-2 pt-1.5 text-sm text-stone-400" aria-label="Carsten GPT denkt nach">
      <span className="font-medium">denkt nach</span>
      <span className="inline-flex gap-1">
        <span className="size-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-stone-400" />
      </span>
    </span>
  )
}

/** Kopier-Knopf, der unter fertigen Antworten erscheint. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(text)
        if (ok) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }
      }}
      aria-label="Antwort kopieren"
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Kopiert' : 'Kopieren'}
    </button>
  )
}

/** Die vom Nutzer gesendete News als kompakte Karte (statt langem Prompt-Text). */
function NewsCard({ news }: { news: NewsRef }) {
  return (
    <div className="flex max-w-[88%] items-center gap-2.5 rounded-2xl rounded-br-md border border-stone-200 bg-white/80 px-3 py-2.5 shadow-sm">
      <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-amber-100 text-amber-700">
        <Newspaper className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-600/80">News</span>
        <span className="line-clamp-2 text-sm font-medium leading-snug text-stone-800">{news.title}</span>
      </span>
    </div>
  )
}

export function ChatUI({ newsSuggestions = [] }: { newsSuggestions?: NewsSuggestion[] }) {
  const fromNews = newsSuggestions.length > 0
  const suggestions = fromNews ? newsSuggestions.map(newsToSuggestion) : FALLBACK_SUGGESTIONS

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Folgt das Fenster automatisch dem Verlauf? Nur wenn der Nutzer unten ist.
  const stickRef = useRef(true)

  // Dokument-Scroll beobachten: ist der Nutzer (nahe) am Ende?
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      stickRef.current = window.innerHeight + window.scrollY >= el.scrollHeight - 180
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Beim neuen Inhalt nach unten scrollen (nur wenn der Nutzer ohnehin unten ist).
  useEffect(() => {
    if (stickRef.current) {
      window.scrollTo({ top: document.documentElement.scrollHeight })
    }
  }, [messages, loading])

  // Textarea wächst mit dem Inhalt. Bei leerem Feld governt `rows={1}` (die
  // scrollHeight-Messung eines leeren Textareas ist in manchen Flex-Layouts
  // unzuverlässig — deshalb messen wir nur bei vorhandenem Text).
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    if (!input) {
      el.style.height = ''
      return
    }
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  async function send(text: string, news?: NewsRef) {
    const question = text.trim()
    if (!question || loading) return

    const next: Msg[] = [...messages, { role: 'user', content: question, news }]
    setMessages(next)
    setInput('')
    setLoading(true)
    stickRef.current = true

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '')
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: errText || 'Es ist ein Fehler aufgetreten. Bitte versuch es erneut.' },
        ])
        return
      }

      // Leere Assistenten-Nachricht anlegen und streamend füllen.
      setMessages((m) => [...m, { role: 'assistant', content: '' }])
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue
        setMessages((m) => {
          const copy = [...m]
          const last = copy[copy.length - 1]
          if (last?.role === 'assistant') copy[copy.length - 1] = { ...last, content: last.content + chunk }
          return copy
        })
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: 'Verbindung unterbrochen. Bitte versuch es noch einmal.' },
        ])
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  function stop() {
    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)
  }

  function newChat() {
    stop()
    setMessages([])
    setInput('')
    window.scrollTo({ top: 0 })
    textareaRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const empty = messages.length === 0
  const lastIsUser = messages[messages.length - 1]?.role === 'user'

  return (
    <div className="flex flex-1 flex-col">
      {/* Verlauf / Leerzustand — wächst und schiebt den Composer nach unten */}
      <div className="flex flex-1 flex-col">
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200/70">
              <Sparkles className="size-6" />
            </div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
              Womit kann ich helfen?
            </h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-stone-500">
              Frag mich zu den heutigen KI-News oder zur Wissensbasis — ich antworte auf Deutsch und
              erkläre technische Dinge eine Spur zugänglicher.
            </p>
            <div className="mt-7 w-full max-w-xl">
              {fromNews && (
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600/80">
                  Aus den heutigen KI-News
                </p>
              )}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => send(s.prompt, s.news)}
                    className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-white/60 px-3.5 py-3 text-left transition-colors hover:border-stone-300 hover:bg-white active:bg-stone-50"
                  >
                    <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-stone-100 text-stone-500 transition-colors group-hover:bg-amber-100 group-hover:text-amber-700">
                      {fromNews ? <Newspaper className="size-4" /> : <Sparkles className="size-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-stone-800">{s.title}</span>
                      <span className="block truncate text-xs text-stone-400">{s.subtitle}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4 pb-6">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  {m.news ? (
                    <NewsCard news={m.news} />
                  ) : (
                    <div className="max-w-[88%] rounded-2xl rounded-br-md bg-stone-900 px-4 py-2.5 text-[15px] leading-relaxed text-stone-50">
                      {m.content}
                    </div>
                  )}
                </div>
              ) : (
                <div key={i} className="flex gap-3">
                  <AssistantAvatar />
                  <div className="min-w-0 flex-1 text-[15px] text-stone-700">
                    {m.content ? (
                      <>
                        <Markdown>{m.content}</Markdown>
                        {!(loading && i === messages.length - 1) && (
                          <div className="mt-1.5 -ml-2">
                            <CopyButton text={m.content} />
                          </div>
                        )}
                      </>
                    ) : (
                      <Thinking />
                    )}
                  </div>
                </div>
              ),
            )}
            {loading && lastIsUser && (
              <div className="flex gap-3">
                <AssistantAvatar />
                <Thinking />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer — klebt am unteren Rand des Fensters */}
      <div className="sticky bottom-0 z-10 bg-paper pt-2 pb-3 sm:pb-4">
        {!empty && (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={newChat}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-900"
            >
              <SquarePen className="size-3.5" />
              Neuer Chat
            </button>
          </div>
        )}
        <div className="relative rounded-2xl border border-stone-300 bg-white/80 shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Frag Carsten GPT …"
            aria-label="Nachricht an Carsten GPT"
            style={{ outline: 'none', boxShadow: 'none' }}
            className="block max-h-[200px] w-full resize-none overflow-y-auto bg-transparent py-3.5 pl-4 pr-14 text-[15px] leading-relaxed text-stone-900 placeholder:text-stone-400"
          />
          <div className="absolute bottom-2 right-2">
            {loading ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Antwort stoppen"
                className="flex size-9 flex-none items-center justify-center rounded-full bg-stone-200 text-stone-700 transition-colors hover:bg-stone-300"
              >
                <Square className="size-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim()}
                aria-label="Senden"
                className="flex size-9 flex-none items-center justify-center rounded-full bg-stone-900 text-stone-50 transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                <ArrowUp className="size-4" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-stone-400">
          Carsten GPT kann Fehler machen. Bitte wichtige Infos gegenprüfen.
        </p>
      </div>
    </div>
  )
}
