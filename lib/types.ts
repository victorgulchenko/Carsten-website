// Gemeinsame Typen für Das Tandem.

/** Ein einzelner Eintrag aus knowledge.md. */
export type KnowledgeEntry = {
  id: string
  category: string
  title: string
  kurz: string
  erklaerung: string
  mentoring?: string
  link?: string
  tags: string[]
}

/** Eine kuratierte KI-Nachricht (linke Spalte). */
export type NewsItem = {
  id: string
  title: string
  /** 1–2 sehr kurze deutsche Sätze. */
  summary: string
  url: string
  source: string
}

/** Eine "Für Carsten"-Notiz (rechte Spalte). */
export type CarstenNote = {
  id: string
  /** Welcher Prozess: z. B. "Modellvalidierung", "SAS→Python", "Dokumentation". */
  process: string
  /** Die Notiz: "Tool/Modell X könnte bei Y helfen, weil …". */
  text: string
  /** Verweis auf die zugehörige Nachricht (Titel). */
  newsTitle?: string
  /** Quelllink der zugehörigen Nachricht. */
  url?: string
}

/** Der komplette Tagesinhalt. */
export type DailyContent = {
  /** ISO-Datum (YYYY-MM-DD, Europe/Berlin). */
  date: string
  /** ISO-Zeitstempel der Generierung. */
  generatedAt: string
  /** Wie der Inhalt entstand: "groq" | "rss" | "seed". */
  mode: 'groq' | 'rss' | 'seed'
  news: NewsItem[]
  carsten: CarstenNote[]
}
