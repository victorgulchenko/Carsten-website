import { getDailyContent } from '@/lib/content'
import { formatGermanDate } from '@/lib/date'
import { NewsItem } from '@/components/NewsItem'
import { CarstenNote } from '@/components/CarstenNote'

// Auf Anfrage gerendert; die Tagesdaten liegen im Data Cache (einmal täglich
// generiert, vom Cron /api/refresh aufgefrischt) — kein Groq-Call zur Build-Zeit.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const content = await getDailyContent()
  const dateLabel = formatGermanDate(content.date)

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:py-10">
      {/* Tageskopf */}
      <div className="mb-9 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-stone-200 pb-4">
        <p className="text-sm">
          <span className="font-medium capitalize text-stone-700">{dateLabel}</span>
          <span className="ml-2 text-stone-400">· Die wichtigsten KI-News des Tages</span>
        </p>
        {content.mode === 'seed' && (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-500">
            Beispielinhalt — Live-Quellen gerade nicht erreichbar
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-5">
        {/* Linke Spalte: KI-News */}
        <section className="lg:col-span-3">
          <header className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
              Was heute wichtig ist
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-stone-900">
              KI-News
            </h1>
          </header>

          <div className="space-y-5">
            {content.news.map((item, i) => (
              <NewsItem key={item.id} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* Rechte Spalte: Für Carsten */}
        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-28">
            <header className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600/80">
                Aus den News herausgefiltert
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-stone-900">
                Für Carsten
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                Was davon deinem Model Risk Management hilft — Validierung, SAS→Python,
                Dokumentation.
              </p>
            </header>

            {content.carsten.length > 0 ? (
              <div className="space-y-3.5">
                {content.carsten.map((note) => (
                  <CarstenNote key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-5">
                <p className="text-sm leading-relaxed text-stone-500">
                  Heute nichts, das wirklich zu deinen Prozessen passt — die Spalte bleibt
                  bewusst ruhig. Lieber leer als erzwungen.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
