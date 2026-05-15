import { getInboxDeals } from '@/lib/inbox-data'
import { InboxClient } from '@/components/inbox-client'

export default async function InboxPage() {
  const deals = await getInboxDeals()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe as oportunidades detectadas pelo radar, organizadas por categoria.
        </p>
      </div>

      <InboxClient deals={deals} />
    </div>
  )
}
