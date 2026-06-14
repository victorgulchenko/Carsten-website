import type { NewsItem as NewsItemType } from '@/lib/types'

function ArrowUpRight() {
  return (
    <svg
      width="11"
      height="11"
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

export function NewsItem({ item, index }: { item: NewsItemType; index: number }) {
  return (
    <article className="group border-t border-stone-200 pt-5 first:border-t-0 first:pt-0">
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className="mt-1 select-none font-serif text-sm tabular-nums text-stone-300"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="font-serif text-lg font-medium leading-snug text-stone-900 decoration-stone-300 decoration-1 underline-offset-4 group-hover:underline">
              {item.title}
            </h3>
          </a>
          <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">{item.summary}</p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            {item.source} <ArrowUpRight />
          </a>
        </div>
      </div>
    </article>
  )
}
