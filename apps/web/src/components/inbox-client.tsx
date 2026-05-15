'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  INBOX_TABS,
  getInboxTab,
  type InboxDeal,
  type InboxTab,
} from '@/lib/inbox-data'
import { DealStatusBadge } from '@/components/deal-status-badge'
import { ScoreBadge } from '@/components/score-badge'

type Props = {
  deals: InboxDeal[]
}

// --- Formatadores ---

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `${currency} ${price}`
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// --- Card compacto para a inbox ---

function InboxCard({ deal }: { deal: InboxDeal }) {
  return (
    <Link
      href={`/deals/${deal.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Rota + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-base font-bold tracking-tight group-hover:text-primary transition-colors">
          <span>{deal.origin}</span>
          <span className="text-sm text-muted-foreground" aria-hidden="true">→</span>
          <span>{deal.destination}</span>
        </div>
        {deal.status && <DealStatusBadge status={deal.status} />}
      </div>

      {/* Preço + companhia */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-extrabold tracking-tight">
            {formatPrice(deal.price, deal.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            {deal.airline}
            {deal.cabinClass ? ` · ${deal.cabinClass}` : ''}
            {deal.stops === 0 ? ' · Direto' : ` · ${deal.stops} escala${deal.stops > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Score de oportunidade */}
        {deal.opportunityScore != null && (
          <ScoreBadge score={deal.opportunityScore} label="Oportunidade" />
        )}
      </div>

      {/* Datas */}
      <div className="flex items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
        <span>Ida: {formatDate(deal.departureAt)}</span>
        {deal.returnAt && (
          <>
            <span aria-hidden="true">·</span>
            <span>Volta: {formatDate(deal.returnAt)}</span>
          </>
        )}
      </div>
    </Link>
  )
}

// --- Estado vazio por aba ---

function EmptyTab({ message, detail }: { message: string; detail: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <svg
        className="mb-4 h-10 w-10 text-muted-foreground/40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
      <p className="text-base font-medium">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

// --- Componente principal ---

export function InboxClient({ deals }: Props) {
  const [activeTab, setActiveTab] = useState<InboxTab>('unmissable')

  // Agrupa todos os deals por aba — recalcula só quando os deals mudam
  const byTab = useMemo(() => {
    const map = new Map<InboxTab, InboxDeal[]>()
    for (const tab of INBOX_TABS) map.set(tab.id, [])
    for (const deal of deals) {
      const tab = getInboxTab(deal)
      map.get(tab)!.push(deal)
    }
    return map
  }, [deals])

  const currentDeals = byTab.get(activeTab) ?? []
  const currentMeta = INBOX_TABS.find((t) => t.id === activeTab)!

  return (
    <section className="space-y-6">
      {/* Barra de abas */}
      <div
        className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1"
        role="tablist"
        aria-label="Abas da inbox"
      >
        {INBOX_TABS.map((tab) => {
          const count = byTab.get(tab.id)?.length ?? 0
          const isActive = tab.id === activeTab

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
              )}
            >
              {tab.label}
              {/* Badge de contagem — só exibe quando há items */}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Conteúdo da aba ativa */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-label={currentMeta.label}
      >
        {currentDeals.length === 0 ? (
          <EmptyTab
            message={currentMeta.emptyMessage}
            detail={currentMeta.emptyDetail}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {currentDeals.length === 1
                ? '1 oferta'
                : `${currentDeals.length} ofertas`}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentDeals.map((deal) => (
                <InboxCard key={deal.id} deal={deal} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
