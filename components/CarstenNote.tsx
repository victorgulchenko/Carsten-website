import type { CarstenNote as CarstenNoteType } from '@/lib/types'

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

export function CarstenNote({ note }: { note: CarstenNoteType }) {
  return (
    <article className="rounded-xl border border-amber-300/60 bg-amber-50/60 p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
        {note.process}
      </span>
      <p className="mt-2.5 text-[15px] leading-relaxed text-stone-700">{note.text}</p>
      {note.newsTitle && note.url && (
        <a
          href={note.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-flex items-start gap-1 text-xs font-medium text-amber-800/90 transition-colors hover:text-amber-900"
        >
          <span aria-hidden="true" className="mt-px">
            ↳
          </span>
          <span className="underline decoration-amber-300 decoration-1 underline-offset-2">
            {note.newsTitle} <ArrowUpRight />
          </span>
        </a>
      )}
    </article>
  )
}
