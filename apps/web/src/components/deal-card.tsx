import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ScoreBadge } from '@/components/score-badge'
import { DealStatusBadge } from '@/components/deal-status-badge'
import type { Deal, DealStatus } from '@/lib/types'

// Re-exporta Deal para que importações existentes de '@/components/deal-card'
// continuem funcionando sem alteração nos consumers.
export type { Deal }

// --- Formatadores utilitarios ---

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `${currency} ${price.toFixed(0)}`
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatDuration(duration: Deal['duration']): string | null {
  if (duration == null) return null
  if (typeof duration === 'number') {
    const h = Math.floor(duration / 60)
    const m = duration % 60
    return m === 0 ? `${h}h` : `${h}h${m}m`
  }
  return duration
}

function StopsLabel({ stops }: { stops: number }) {
  if (stops === 0) return <>direto</>
  if (stops === 1) return <>1 escala</>
  return <>{stops} escalas</>
}

// --- Badge de qualidade ---
// Baseado em opportunityScore; ausente quando nao ha score suficiente.
function QualityBadge({ score }: { score?: number }) {
  if (score == null) return null
  if (score >= 90)
    return (
      <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        ✨ imperdível
      </span>
    )
  if (score >= 75)
    return (
      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
        ⭐ boa oportunidade
      </span>
    )
  return null
}

// Badge de alerta para status nao-nominais — nao mostra para ACTIVE/REVALIDATED.
function AlertBadge({ status, confidenceScore }: { status?: DealStatus; confidenceScore?: number }) {
  if (status === 'EXPIRED')
    return (
      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
        expirada
      </span>
    )
  if (status === 'POSSIBLE_ERROR' || status === 'NEEDS_REVIEW')
    return (
      <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
        precisa revisão
      </span>
    )
  if (status === 'LOW_CONFIDENCE' || (confidenceScore != null && confidenceScore < 50))
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
        baixa confiança
      </span>
    )
  return null
}

// --- Componente principal ---

type DealCardProps = {
  deal: Deal
  // onClick opcional: quando fornecido, intercepta o clique e abre o modal
  // ao invés de navegar para a página /deals/[id].
  onClick?: (e: React.MouseEvent) => void
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const duration = formatDuration(deal.duration)
  const hasScores =
    deal.opportunityScore != null ||
    deal.confidenceScore != null ||
    deal.personalFitScore != null

  return (
    <Link
      href={`/deals/${deal.id}`}
      onClick={onClick}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <article
        className={cn(
          'flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm',
          'transition-all group-hover:border-foreground/25 group-hover:shadow-md',
          deal.status === 'EXPIRED' && 'opacity-60',
        )}
      >
        {/* Cabecalho: rota + badges */}
        <header className="flex items-start justify-between gap-3">
          {/* Rota com destaque */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight">{deal.origin}</span>
            <span className="text-base text-muted-foreground" aria-hidden="true">→</span>
            <span className="text-lg font-bold tracking-tight">{deal.destination}</span>
          </div>

          {/* Badges: qualidade primeiro, alerta se houver */}
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            <QualityBadge score={deal.opportunityScore} />
            <AlertBadge status={deal.status} confidenceScore={deal.confidenceScore} />
          </div>
        </header>

        {/* Preco: hierarquia visual principal */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight">
            {formatPrice(deal.price, deal.currency)}
          </span>
          {deal.cabinClass && (
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {deal.cabinClass}
            </span>
          )}
        </div>

        {/* Linha secundaria: companhia + escalas + duracao */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{deal.airline}</span>
          <span aria-hidden="true">·</span>
          <span><StopsLabel stops={deal.stops} /></span>
          {duration && (
            <>
              <span aria-hidden="true">·</span>
              <span>{duration}</span>
            </>
          )}
        </div>

        {/* Datas */}
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md bg-muted px-2 py-1 font-medium">
            {formatDate(deal.departureAt)}
          </span>
          {deal.returnAt ? (
            <>
              <span aria-hidden="true" className="text-muted-foreground">→</span>
              <span className="rounded-md bg-muted px-2 py-1 font-medium">
                {formatDate(deal.returnAt)}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">somente ida</span>
          )}
        </div>

        {/* Scores — so aparecem se ao menos um existir */}
        {hasScores && (
          <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border pt-3">
            {deal.opportunityScore != null && (
              <ScoreBadge label="Oportunidade" score={deal.opportunityScore} />
            )}
            {deal.confidenceScore != null && (
              <ScoreBadge label="Confiança" score={deal.confidenceScore} />
            )}
            {deal.personalFitScore != null && (
              <ScoreBadge label="Fit" score={deal.personalFitScore} />
            )}
          </div>
        )}
      </article>
    </Link>
  )
}
