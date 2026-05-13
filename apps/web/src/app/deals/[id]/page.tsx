import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDealById } from '@/lib/data'
import { ScoreBadge } from '@/components/score-badge'
import { DealStatusBadge } from '@/components/deal-status-badge'
import type { Deal } from '@/components/deal-card'

// --- Formatadores (mantidos locais para nao expor do DealCard) ---

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

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

// --- Sub-componentes da pagina ---

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  )
}

// Barra visual de score (0–100)
function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  let barColor = 'bg-red-400'
  if (pct >= 90) barColor = 'bg-emerald-500'
  else if (pct >= 75) barColor = 'bg-green-400'
  else if (pct >= 60) barColor = 'bg-yellow-400'
  else if (pct >= 40) barColor = 'bg-slate-400'

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold tabular-nums">{pct}</span>
    </div>
  )
}

function ScoreSection({ deal }: { deal: Deal }) {
  const scores: { label: string; score?: number }[] = [
    { label: 'Oportunidade', score: deal.opportunityScore },
    { label: 'Confiança', score: deal.confidenceScore },
    { label: 'Fit pessoal', score: deal.personalFitScore },
  ]

  const visible = scores.filter((s) => s.score != null)
  if (visible.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold">Qualidade da oferta</h2>
      <div className="space-y-4">
        {visible.map(({ label, score }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              {/* label já aparece no <span> ao lado — badge exibe só o número */}
              <ScoreBadge score={score!} />
            </div>
            <ScoreBar score={score!} />
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Pagina ---

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = await getDealById(id)

  if (!deal) notFound()

  const duration = formatDuration(deal.duration)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Botao Voltar */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para ofertas
      </Link>

      {/* Cabecalho da oferta */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span>{deal.origin}</span>
            <span className="text-muted-foreground">→</span>
            <span>{deal.destination}</span>
          </h1>
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

      {/* Detalhes da viagem */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold">Detalhes da viagem</h2>
        <div>
          <InfoRow label="Companhia" value={deal.airline} />
          <InfoRow
            label="Ida"
            value={formatDateTime(deal.departureAt)}
          />
          <InfoRow
            label="Volta"
            value={deal.returnAt ? formatDateTime(deal.returnAt) : '—  (somente ida)'}
          />
          <InfoRow
            label="Escalas"
            value={
              deal.stops === 0
                ? 'Voo direto'
                : `${deal.stops} ${deal.stops === 1 ? 'escala' : 'escalas'}`
            }
          />
          {duration && <InfoRow label="Duração" value={duration} />}
          {deal.baggage && <InfoRow label="Bagagem" value={deal.baggage} />}
        </div>
      </div>

      {/* Scores + barra visual */}
      <ScoreSection deal={deal} />
    </div>
  )
}
