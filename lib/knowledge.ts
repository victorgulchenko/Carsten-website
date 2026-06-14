import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { KnowledgeEntry } from './types'

/**
 * Parst knowledge.md in strukturierte Einträge.
 * Struktur: `##` = Kategorie, `###` = Eintrag, Felder als Bullets
 * (**Kurz:**, **Erklärung:**, **Im Mentoring:**, **Link:**, **Tags:**).
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Entfernt einfaches Markdown (fett, Links) für die Suche/Anzeige. */
function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .trim()
}

export function parseKnowledge(md: string): KnowledgeEntry[] {
  const lines = md.split('\n')
  const entries: KnowledgeEntry[] = []

  let category = ''
  let current: Partial<KnowledgeEntry> & { tags: string[] } = { tags: [] }
  let hasCurrent = false

  const flush = () => {
    if (hasCurrent && current.title) {
      entries.push({
        id: slugify(`${category}-${current.title}`),
        category,
        title: current.title,
        kurz: current.kurz ?? '',
        erklaerung: current.erklaerung ?? '',
        mentoring: current.mentoring,
        link: current.link,
        tags: current.tags,
      })
    }
    current = { tags: [] }
    hasCurrent = false
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    // Kategorie
    const cat = line.match(/^##\s+(?!#)(.+)$/)
    if (cat) {
      flush()
      category = stripInline(cat[1])
      continue
    }

    // Eintrag
    const entry = line.match(/^###\s+(.+)$/)
    if (entry) {
      flush()
      current = { tags: [] }
      current.title = stripInline(entry[1])
      hasCurrent = true
      continue
    }

    if (!hasCurrent) continue

    // Feld-Bullets
    const field = line.match(/^[-*]\s+\*\*(.+?):\*\*\s*(.*)$/)
    if (field) {
      const key = field[1].toLowerCase()
      const value = field[2].trim()
      if (key.startsWith('kurz')) current.kurz = stripInline(value)
      else if (key.startsWith('erkl')) current.erklaerung = stripInline(value)
      else if (key.startsWith('im mentoring')) current.mentoring = stripInline(value)
      else if (key.startsWith('link')) current.link = value.trim()
      else if (key.startsWith('tag'))
        current.tags = value
          .split(',')
          .map((t) => stripInline(t).trim())
          .filter(Boolean)
    }
  }
  flush()

  return entries
}

let cache: KnowledgeEntry[] | null = null

/** Liest und parst knowledge.md aus dem Projekt-Root. */
export async function getKnowledge(): Promise<KnowledgeEntry[]> {
  if (cache) return cache
  const path = join(process.cwd(), 'knowledge.md')
  const md = await readFile(path, 'utf8')
  cache = parseKnowledge(md)
  return cache
}

/** Eindeutige Kategorien in Reihenfolge des Auftretens. */
export function categoriesOf(entries: KnowledgeEntry[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const e of entries) {
    if (!seen.has(e.category)) {
      seen.add(e.category)
      out.push(e.category)
    }
  }
  return out
}
