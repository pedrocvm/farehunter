import { NextResponse } from 'next/server'
import { getDeals } from '@/lib/data'

// Expoe os dados mock via HTTP para consumo externo (e.g. Telegram bot, scripts).
// A page.tsx consome getDeals() diretamente, sem passar por aqui.
export async function GET() {
  const deals = await getDeals()
  return NextResponse.json(deals)
}
