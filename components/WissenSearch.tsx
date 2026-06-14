'use client'

import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import type { KnowledgeEntry } from '@/lib/types'

const ALL = 'Alle'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ArrowUpRight() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="inline-block -translate-y-px"
    >
      <path
        d="M3 9L9 3M9 3H4M9 3V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'Quelle'
  }
}

function EntryCard({ entry }: { entry: KnowledgeEntry }) {
  return (
    <article className="flex flex-col rounded-xl border border-stone-200 bg-white/60 p-4 transition-colors hover:border-stone-300">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {entry.category}
      </p>
      <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-stone-900">
        {entry.title}
      </h3>
      {entry.kurz && (
        <p className="mt-1 text-sm font-medium text-stone-700">{entry.kurz}</p>
      )}
      {entry.erklaerung && (
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{entry.erklaerung}</p>
      )}
      {entry.mentoring && (
        <p className="mt-2 border-l-2 border-stone-200 pl-2.5 text-xs leading-relaxed text-stone-500">
          <span className="font-medium text-stone-600">Im Mentoring:</span> {entry.mentoring}
        </p>
      )}

      <div className="mt-3 flex flex-1 flex-wrap items-end gap-1.5">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500"
          >
            {tag}
          </span>
        ))}
      </div>

      {entry.link && (
        <a
          href={entry.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-fit items-center gap-1 text-xs font-medium text-stone-500 transition-colors hover:text-stone-900"
        >
          {hostOf(entry.link)} <ArrowUpRight />
        </a>
      )}
    </article>
  )
}

export function WissenSearch({
  entries,
  categories,
}: {
  entries: KnowledgeEntry[]
  categories: string[]
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>(ALL)

  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'kurz', weight: 2 },
          { name: 'tags', weight: 2 },
          { name: 'erklaerung', weight: 1 },
          { name: 'category', weight: 1 },
          { name: 'mentoring', weight: 0.5 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [entries],
  )

  const results = useMemo(() => {
    const q = query.trim()
    const base = q ? fuse.search(q).map((r) => r.item) : entries
    return category === ALL ? base : base.filter((e) => e.category === category)
  }, [query, category, fuse, entries])

  const chips = [ALL, ...categories]

  return (
    <div>
      {/* Suche */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen … z. B. Kontext, Migration, Validierung, Bedrock"
          aria-label="Wissensbasis durchsuchen"
          className="w-full rounded-xl border border-stone-300 bg-white/70 py-3 pl-10 pr-4 text-[15px] text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      {/* Kategorie-Filter */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.map((c) => {
          const active = category === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={active}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'bg-stone-900 text-stone-50'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* Ergebniszahl */}
      <p className="mt-5 text-xs text-stone-400" aria-live="polite">
        {results.length}{' '}
        {results.length === 1 ? 'Eintrag' : 'Einträge'}
        {category !== ALL && ` · ${category}`}
        {query.trim() && ` · „${query.trim()}"`}
      </p>

      {/* Ergebnisse */}
      {results.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {results.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-6 text-center">
          <p className="text-sm text-stone-500">
            Nichts gefunden für „{query.trim()}". Versuch einen anderen Begriff oder setz den
            Filter zurück.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategory(ALL)
            }}
            className="mt-3 rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-stone-50 hover:bg-stone-700"
          >
            Zurücksetzen
          </button>
        </div>
      )}
    </div>
  )
}
