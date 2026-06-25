'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteFooter() {
  const pathname = usePathname()
  // Auf der Chat-Seite stört der Footer das app-artige Vollbild-Layout.
  if (pathname?.startsWith('/chat')) return null

  return (
    <footer className="border-t border-stone-200/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-5 py-6 text-xs text-stone-500">
        <span className="font-serif text-sm font-semibold text-stone-700">Das Tandem</span>
        <nav className="flex items-center gap-4" aria-label="Fußnavigation">
          <Link href="/" className="hover:text-stone-800">
            KI-News
          </Link>
          <Link href="/wissen" className="hover:text-stone-800">
            Wissen
          </Link>
          <Link href="/chat" className="hover:text-stone-800">
            Carsten GPT
          </Link>
        </nav>
      </div>
    </footer>
  )
}
