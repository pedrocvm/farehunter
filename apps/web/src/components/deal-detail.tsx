import { ScoreBadge } from '@/components/score-badge'
import { DealStatusBadge } from '@/components/deal-status-badge'
import type { Deal } from '@/components/deal-card'

// Componente puramente de exibição — sem navegação.
// Usado tanto na página completa /deals/[id] quanto no modal.

// --- Formatadores ---

export function formatPrice(price: number, currency: string): string {
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

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(duration: Deal['duration']): string | null {
  if (duration == null) return null
  if (typeof duration === 'number') {
    const h = Math.floor(duration / 60)
    const m = duration % 60
    return m === 0 ? `${h}h` : `${h}h${m}m`
  }
  return duration
}

// --- Sub-componentes ---

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  let bar = 'bg-red-400'
  if (pct >= 90) bar = 'bg-emerald-500'
  else if (pct >= 75) bar = 'bg-green-400'
  else if (pct >= 60) bar = 'bg-yellow-400'
  else if (pct >= 40) bar = 'bg-slate-400'

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-bold tabular-nums">{pct}</span>
    </div>
  )
}

function ScoreSection({ deal }: { deal: Deal }) {
  const rows: { label: string; score?: number }[] = [
    { label: 'Oportunidade', score: deal.opportunityScore },
    { label: 'Confiança',    score: deal.confidenceScore },
    { label: 'Fit pessoal',  score: deal.personalFitScore },
  ]
  const visible = rows.filter((r) => r.score != null)
  if (visible.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold">Qualidade da oferta</h2>
      <div className="space-y-4">
        {visible.map(({ label, score }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <ScoreBadge score={score!} />
            </div>
            <ScoreBar score={score!} />
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Componente principal ---

export function DealDetail({ deal }: { deal: Deal }) {
  const duration = formatDuration(deal.duration)

  return (
    <div className="space-y-4">
      {/* Cabeçalho: rota + status */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span>{deal.origin}</span>
            <span className="text-muted-foreground">→</span>
            <span>{deal.destination}</span>
          </h2>
          {deal.status && <DealStatusBadge status={deal.status} />}
        </div>

        <div className="text-4xl font-extrabold tracking-tight">
          {formatPrice(deal.price, deal.currency)}
        </div>

        {deal.cabinClass && (
          <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {deal.cabinClass}
          </span>
        )}
      </div>

      {/* Detalhes */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold">Detalhes da viagem</h2>
        <InfoRow label="Companhia" value={deal.airline} />
        <InfoRow label="Ida"       value={formatDateTime(deal.departureAt)} />
        <InfoRow
          label="Volta"
          value={deal.returnAt ? formatDateTime(deal.returnAt) : '— (somente ida)'}
        />
        <InfoRow
          label="Escalas"
          value={
            deal.stops === 0
              ? 'Voo direto'
              : `${deal.stops} ${deal.stops === 1 ? 'escala' : 'escalas'}`
          }
        />
        {duration && <InfoRow label="Duração"  value={duration} />}
        {deal.baggage && <InfoRow label="Bagagem" value={deal.baggage} />}
      </div>

      {/* Scores */}
      <ScoreSection deal={deal} />
    </div>
  )
}
