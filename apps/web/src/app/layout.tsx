import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FareHunter',
  description: 'Radar inteligente de oportunidades aéreas',
}

const NAV_LINKS = [
  { href: '/',              label: 'Ofertas'    },
  { href: '/search',        label: 'Buscar'     },
  { href: '/watchlists',    label: 'Watchlists' },
  { href: '/price-targets', label: 'Metas'      },
  { href: '/settings',      label: 'Config'     },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
              FareHunter
            </Link>

            <nav className="flex items-center gap-1" aria-label="Navegação principal">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  )
}
