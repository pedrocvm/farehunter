import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDealById } from '@/lib/data'
import { DealDetail } from '@/components/deal-detail'

// Página completa — usada em acesso direto via URL (/deals/[id]).
// Quando a navegação parte do dashboard, o @modal intercepta antes de chegar aqui.
export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = await getDealById(id)

  if (!deal) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para ofertas
      </Link>

      <DealDetail deal={deal} />
    </div>
  )
}
