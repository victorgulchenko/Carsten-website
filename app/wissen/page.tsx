import type { Metadata } from 'next'
import { getKnowledge, categoriesOf } from '@/lib/knowledge'
import { WissenSearch } from '@/components/WissenSearch'

export const metadata: Metadata = {
  title: 'Wissen — Das Tandem',
  description:
    'Durchsuchbare Wissensbasis aus dem Reverse Mentoring: Tools, Ansätze und Begriffe rund um KI.',
}

export default async function WissenPage() {
  const entries = await getKnowledge()
  const categories = categoriesOf(entries)

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:py-10">
      <header className="mb-7 border-b border-stone-200 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
          Aus unseren Treffen · Jan–Jun 2026
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-stone-900">
          Wissensbasis
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-stone-500">
          Tools, Ansätze und Begriffe aus dem Reverse Mentoring — kurz erklärt, mit Quelle.
          Volltextsuche (auch unscharf) und Filter nach Kategorie.
        </p>
      </header>

      <WissenSearch entries={entries} categories={categories} />
    </div>
  )
}
