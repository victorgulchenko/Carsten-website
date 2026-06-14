import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Gebaut im Reverse Mentoring · KI-News täglich kuratiert, Wissen aus{' '}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">knowledge.md</code>.
        </p>
        <nav className="flex items-center gap-4" aria-label="Fußnavigation">
          <Link href="/" className="hover:text-stone-800">
            KI-News
          </Link>
          <Link href="/wissen" className="hover:text-stone-800">
            Wissen
          </Link>
        </nav>
      </div>
    </footer>
  )
}
