import { getDeals } from '@/lib/data'
import { DashboardClient } from '@/components/dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const deals = await getDeals()

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Ofertas em destaque</h2>
        <p className="text-sm text-muted-foreground">
          Oportunidades detectadas pelo radar — atualizadas em tempo real.
        </p>
      </div>

      {/* DashboardClient gerencia filtros e renderizacao dos cards (client-side) */}
      <DashboardClient deals={deals} />
    </div>
  )
}
