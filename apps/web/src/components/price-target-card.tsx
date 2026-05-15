import { cn } from '@/lib/utils'
import { computeMetrics } from '@/lib/price-target-data'
import type { PriceTarget, PriceTargetStatus } from '@/lib/price-target-data'

type Props = {
  target: PriceTarget
  onDelete: (id: string) => void
}

// --- Configuração visual por status ---

type StatusStyle = {
  badge: string        // classes do badge
  bar: string          // cor da barra de progresso
  label: string        // texto do badge
  diffLabel: string    // prefixo da diferença de preço
}

const STATUS_STYLES: Record<PriceTargetStatus, StatusStyle> = {
  REACHED:  {
    badge:     'bg-emerald-100 text-emerald-700',
    bar:       'bg-emerald-500',
    label:     '✓ Meta atingida',
    diffLabel: 'abaixo',
  },
  CLOSE: {
    badge:     'bg-amber-100 text-amber-700',
    bar:       'bg-amber-400',
    label:     'Quase lá!',
    diffLabel: 'acima',
  },
  WATCHING: {
    badge:     'bg-blue-100 text-blue-700',
    bar:       'bg-blue-400',
    label:     'Monitorando',
    diffLabel: 'acima',
  },
  FAR: {
    badge:     'bg-slate-100 text-slate-500',
    bar:       'bg-slate-300',
    label:     'Ainda longe',
    diffLabel: 'acima',
  },
}

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

export function PriceTargetCard({ target, onDelete }: Props) {
  const metrics = computeMetrics(target)
  const style = STATUS_STYLES[metrics.status]
  const absDiff = Math.abs(metrics.diff)

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      {/* Cabeçalho: rota + status badge */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
          <span>{target.origin}</span>
          <span className="text-base text-muted-foreground" aria-hidden="true">→</span>
          <span>{target.destination}</span>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold', style.badge)}>
          {style.label}
        </span>
      </header>

      {/* Preços: alvo vs menor encontrado */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-0.5 text-xs text-muted-foreground">Meu alvo</p>
          <p className="text-xl font-extrabold tracking-tight">
            {formatPrice(target.targetPrice, target.currency)}
          </p>
        </div>
        <div>
          <p className="mb-0.5 text-xs text-muted-foreground">Menor encontrado</p>
          <p className={cn(
            'text-xl font-extrabold tracking-tight',
            metrics.status === 'REACHED' ? 'text-emerald-600' : '',
          )}>
            {target.lowestFound != null
              ? formatPrice(target.lowestFound, target.currency)
              : '—'}
          </p>
        </div>
      </div>

      {/* Distância até o alvo + barra de progresso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Distância até a meta</span>
          <span className={cn(
            'font-semibold',
            metrics.status === 'REACHED' ? 'text-emerald-600' : 'text-foreground',
          )}>
            {target.lowestFound == null
              ? '—'
              : metrics.status === 'REACHED'
                ? `${formatPrice(absDiff, target.currency)} abaixo`
                : `${formatPrice(absDiff, target.currency)} acima`}
          </span>
        </div>

        {/* Barra — mostra visualmente o quão perto o preço está da meta */}
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={metrics.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${metrics.progress}% do caminho até a meta`}
        >
          <div
            className={cn('h-full rounded-full transition-all', style.bar)}
            style={{ width: `${metrics.progress}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground text-right">
          {metrics.progress}% da meta
        </p>
      </div>

      {/* Classe + botão excluir */}
      <footer className="flex items-center justify-between border-t border-border pt-3">
        {target.cabinClass ? (
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {target.cabinClass}
          </span>
        ) : <span />}

        <button
          type="button"
          onClick={() => onDelete(target.id)}
          aria-label={`Excluir meta ${target.origin} → ${target.destination}`}
          className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          Excluir
        </button>
      </footer>
    </article>
  )
}
