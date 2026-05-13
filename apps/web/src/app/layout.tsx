import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FareHunter',
  description: 'Radar inteligente de oportunidades aéreas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Header global simples — sem nav ainda, vamos crescer depois. */}
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-xl font-bold tracking-tight">FareHunter</h1>
            <span className="text-xs text-muted-foreground">
              Radar de oportunidades aéreas
            </span>
          </div>
        </header>

        {/* Container centralizado, com spacing consistente em todas as pages. */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  )
}
