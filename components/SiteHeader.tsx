'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'KI-News' },
  { href: '/wissen', label: 'Wissen' },
]

function TandemMark() {
  // Zwei Räder + Rahmen — ein kleines Tandem.
  return (
    <svg
      width="34"
      height="20"
      viewBox="0 0 34 20"
      fill="none"
      aria-hidden="true"
      className="text-stone-400"
    >
      <circle cx="6" cy="13" r="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="28" cy="13" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6 13 L13 13 L17 6 L21 13 L28 13 M13 13 L15 6 M17 6 L13 6 M21 6 L23 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3">
        <Link href="/" className="group flex items-center gap-3">
          <TandemMark />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-semibold tracking-tight text-stone-900">
              Das Tandem
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.13em] text-stone-500">
              Reverse Mentoring · Victor × Carsten · Jan–Jun 2026
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm" aria-label="Hauptnavigation">
          {NAV.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
                  active
                    ? 'bg-stone-900 text-stone-50'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
