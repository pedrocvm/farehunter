import { getWatchlists } from '@/lib/watchlist-data'
import { WatchlistsClient } from '@/components/watchlists-client'

export default async function WatchlistsPage() {
  const watchlists = await getWatchlists()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Watchlists</h2>
        <p className="text-sm text-muted-foreground">
          Rotas monitoradas pelo radar — você é notificado quando surgir uma oferta.
        </p>
      </div>

      <WatchlistsClient initial={watchlists} />
    </div>
  )
}
