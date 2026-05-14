import { cn } from '@/lib/utils'
import type { Watchlist } from '@/lib/watchlist-data'

type WatchlistCardProps = {
  watchlist: Watchlist
  onToggle: (id: string) => void
  onDelete: (id: string) => void
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

export function WatchlistCard({ watchlist, onToggle, onDelete }: WatchlistCardProps) {
  const isActive = watchlist.status === 'ACTIVE'
  const hasMatches = (watchlist.matchCount ?? 0) > 0

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm transition-opacity',
        isActive ? 'border-border' : 'border-border opacity-60',
      )}
    >
      {/* Cabeçalho: nome + status */}
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-tight">{watchlist.name}</h3>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
            isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500',
          )}
        >
          {isActive ? 'Ativa' : 'Inativa'}
        </span>
      </header>

      {/* Rota */}
      <div className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
        <span>{watchlist.origin}</span>
        <span className="text-base text-muted-foreground" aria-hidden="true">→</span>
        <span>{watchlist.destination}</span>
      </div>

      {/* Detalhes */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {watchlist.maxPrice != null && (
          <span>
            Até{' '}
            <span className="font-medium text-foreground">
              {formatPrice(watchlist.maxPrice, watchlist.currency)}
            </span>
          </span>
        )}
        {watchlist.cabinClass && (
          <span>
            Classe{' '}
            <span className="font-medium text-foreground">{watchlist.cabinClass}</span>
          </span>
        )}
      </div>

      {/* Matches atuais */}
      {hasMatches ? (
        <p className="text-sm font-medium text-emerald-600">
          {watchlist.matchCount === 1
            ? '1 oferta disponível agora'
            : `${watchlist.matchCount} ofertas disponíveis agora`}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma oferta no momento</p>
      )}

      {/* Ações */}
      <footer className="flex items-center gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => onToggle(watchlist.id)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            isActive
              ? 'bg-muted text-muted-foreground hover:bg-muted/80'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
          )}
        >
          {isActive ? 'Pausar' : 'Ativar'}
        </button>

        <button
          type="button"
          onClick={() => onDelete(watchlist.id)}
          className="ml-auto rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label={`Excluir watchlist ${watchlist.name}`}
        >
          Excluir
        </button>
      </footer>
    </article>
  )
}
