import { getPriceTargets } from '@/lib/price-target-data'
import { PriceTargetsClient } from '@/components/price-targets-client'

export default async function PriceTargetsPage() {
  const targets = await getPriceTargets()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Metas de preço</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe o quanto falta para atingir o preço que você deseja.
        </p>
      </div>

      <PriceTargetsClient initial={targets} />
    </div>
  )
}
