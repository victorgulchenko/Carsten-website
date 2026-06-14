import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Das Tandem — KI-News & Wissen',
  description:
    'Tägliche KI-News auf Deutsch und eine Wissensbasis aus dem Reverse Mentoring Victor × Carsten (Jan–Jun 2026).',
  metadataBase: new URL('https://das-tandem.vercel.app'),
  openGraph: {
    title: 'Das Tandem',
    description: 'Tägliche KI-News & Wissensbasis · Reverse Mentoring Victor × Carsten',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
