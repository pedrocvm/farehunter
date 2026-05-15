import type { Deal } from '@/lib/types'

// InboxDeal estende Deal com flags de interação do usuário.
// Quando o backend estiver pronto, esses campos virão da tabela de preferências.
export type InboxDeal = Deal & {
  favorited?: boolean
  ignored?: boolean
}

// Abas disponíveis na inbox — ordem reflete prioridade visual.
export type InboxTab =
  | 'unmissable'   // Imperdíveis: score >= 90, ACTIVE
  | 'good'         // Boas: score >= 75, ACTIVE
  | 'revalidated'  // Revalidação: status REVALIDATED
  | 'expired'      // Expiradas: status EXPIRED
  | 'ignored'      // Ignoradas: usuário marcou como ignorada
  | 'favorited'    // Favoritas: usuário marcou como favorita

export type InboxTabMeta = {
  id: InboxTab
  label: string
  emptyMessage: string
  emptyDetail: string
}

export const INBOX_TABS: InboxTabMeta[] = [
  {
    id: 'unmissable',
    label: 'Imperdíveis',
    emptyMessage: 'Nenhuma oferta imperdível no momento.',
    emptyDetail: 'O radar está buscando — as melhores oportunidades aparecerão aqui.',
  },
  {
    id: 'good',
    label: 'Boas',
    emptyMessage: 'Nenhuma boa oferta no momento.',
    emptyDetail: 'Continue monitorando — boas oportunidades aparecem com frequência.',
  },
  {
    id: 'revalidated',
    label: 'Revalidação',
    emptyMessage: 'Sem ofertas em revalidação.',
    emptyDetail: 'Ofertas verificadas após expiração aparecem aqui.',
  },
  {
    id: 'expired',
    label: 'Expiradas',
    emptyMessage: 'Nenhuma oferta expirada.',
    emptyDetail: 'Ofertas que saíram do ar ficam registradas aqui por tempo limitado.',
  },
  {
    id: 'ignored',
    label: 'Ignoradas',
    emptyMessage: 'Nenhuma oferta ignorada.',
    emptyDetail: 'Ofertas que você ignorou aparecem aqui para revisão futura.',
  },
  {
    id: 'favorited',
    label: 'Favoritas',
    emptyMessage: 'Nenhuma oferta favoritada ainda.',
    emptyDetail: 'Favorite as melhores ofertas para não perdê-las de vista.',
  },
]

// Determina em qual aba uma oferta aparece.
// Favoritas e Ignoradas têm prioridade sobre as demais categorias.
export function getInboxTab(deal: InboxDeal): InboxTab {
  if (deal.favorited) return 'favorited'
  if (deal.ignored)   return 'ignored'
  if (deal.status === 'EXPIRED')     return 'expired'
  if (deal.status === 'REVALIDATED') return 'revalidated'
  if ((deal.opportunityScore ?? 0) >= 90) return 'unmissable'
  return 'good'
}

// --- Mock data: 14 deals cobrindo todas as abas ---

const MOCK_INBOX: InboxDeal[] = [
  // --- Imperdíveis (score >= 90, ACTIVE) ---
  {
    id: 'inbox-1',
    origin: 'CGH',
    destination: 'REC',
    airline: 'LATAM',
    price: 399,
    currency: 'BRL',
    departureAt: '2026-08-10T06:00:00Z',
    returnAt: '2026-08-17T20:00:00Z',
    stops: 0,
    duration: 195,
    cabinClass: 'Economy',
    baggage: '10 kg',
    status: 'ACTIVE',
    opportunityScore: 97,
    confidenceScore: 94,
    personalFitScore: 91,
  },
  {
    id: 'inbox-2',
    origin: 'GRU',
    destination: 'LIS',
    airline: 'TAP',
    price: 1790,
    currency: 'BRL',
    departureAt: '2026-09-05T22:00:00Z',
    returnAt: '2026-09-19T08:00:00Z',
    stops: 0,
    duration: 660,
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'ACTIVE',
    opportunityScore: 93,
    confidenceScore: 90,
    personalFitScore: 88,
  },
  {
    id: 'inbox-3',
    origin: 'GRU',
    destination: 'CDG',
    airline: 'Air France',
    price: 1600,
    currency: 'BRL',
    departureAt: '2026-10-01T23:00:00Z',
    returnAt: null,
    stops: 0,
    duration: 720,
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'ACTIVE',
    opportunityScore: 91,
    confidenceScore: 87,
    personalFitScore: 82,
  },

  // --- Boas (score 75–89, ACTIVE) ---
  {
    id: 'inbox-4',
    origin: 'GRU',
    destination: 'BCN',
    airline: 'Iberia',
    price: 2050,
    currency: 'BRL',
    departureAt: '2026-09-15T08:00:00Z',
    returnAt: '2026-09-29T20:00:00Z',
    stops: 1,
    duration: 750,
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'ACTIVE',
    opportunityScore: 82,
    confidenceScore: 79,
    personalFitScore: 76,
  },
  {
    id: 'inbox-5',
    origin: 'GRU',
    destination: 'MIA',
    airline: 'LATAM',
    price: 2800,
    currency: 'BRL',
    departureAt: '2026-11-10T14:00:00Z',
    returnAt: '2026-11-20T22:00:00Z',
    stops: 0,
    duration: 600,
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'ACTIVE',
    opportunityScore: 77,
    confidenceScore: 80,
    personalFitScore: 74,
  },
  {
    id: 'inbox-6',
    origin: 'CGH',
    destination: 'FOR',
    airline: 'Azul',
    price: 450,
    currency: 'BRL',
    departureAt: '2026-08-20T07:00:00Z',
    returnAt: '2026-08-27T19:00:00Z',
    stops: 0,
    duration: 180,
    cabinClass: 'Economy',
    baggage: '10 kg',
    status: 'ACTIVE',
    opportunityScore: 76,
    confidenceScore: 85,
    personalFitScore: 79,
  },

  // --- Revalidação ---
  {
    id: 'inbox-7',
    origin: 'GRU',
    destination: 'EZE',
    airline: 'Aerolíneas',
    price: 380,
    currency: 'BRL',
    departureAt: '2026-07-28T07:30:00Z',
    returnAt: '2026-07-31T18:00:00Z',
    stops: 0,
    duration: 180,
    cabinClass: 'Economy',
    baggage: '15 kg',
    status: 'REVALIDATED',
    opportunityScore: 80,
    confidenceScore: 72,
    personalFitScore: 68,
  },
  {
    id: 'inbox-8',
    origin: 'GRU',
    destination: 'LIM',
    airline: 'LATAM',
    price: 890,
    currency: 'BRL',
    departureAt: '2026-08-05T10:00:00Z',
    returnAt: null,
    stops: 1,
    duration: 420,
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'REVALIDATED',
    opportunityScore: 68,
    confidenceScore: 65,
    personalFitScore: 60,
  },

  // --- Expiradas ---
  {
    id: 'inbox-9',
    origin: 'GRU',
    destination: 'JFK',
    airline: 'American',
    price: 2200,
    currency: 'BRL',
    departureAt: '2026-07-01T20:00:00Z',
    returnAt: '2026-07-14T08:00:00Z',
    stops: 1,
    duration: 660,
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'EXPIRED',
    opportunityScore: 88,
    confidenceScore: 84,
    personalFitScore: 80,
  },
  {
    id: 'inbox-10',
    origin: 'CGH',
    destination: 'SSA',
    airline: 'GOL',
    price: 290,
    currency: 'BRL',
    departureAt: '2026-06-15T06:00:00Z',
    returnAt: null,
    stops: 0,
    duration: 120,
    cabinClass: 'Economy',
    status: 'EXPIRED',
    opportunityScore: 85,
    confidenceScore: 90,
    personalFitScore: 77,
  },

  // --- Ignoradas ---
  {
    id: 'inbox-11',
    origin: 'GRU',
    destination: 'DXB',
    airline: 'Emirates',
    price: 4500,
    currency: 'BRL',
    departureAt: '2026-12-01T00:30:00Z',
    returnAt: '2026-12-15T06:00:00Z',
    stops: 0,
    duration: 900,
    cabinClass: 'Economy',
    baggage: '30 kg',
    status: 'ACTIVE',
    opportunityScore: 71,
    confidenceScore: 88,
    personalFitScore: 55,
    ignored: true,
  },

  // --- Favoritas ---
  {
    id: 'inbox-12',
    origin: 'GRU',
    destination: 'NRT',
    airline: 'ANA',
    price: 3900,
    currency: 'BRL',
    departureAt: '2026-10-20T23:00:00Z',
    returnAt: '2026-11-03T15:00:00Z',
    stops: 0,
    duration: 1080,
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'ACTIVE',
    opportunityScore: 89,
    confidenceScore: 92,
    personalFitScore: 95,
    favorited: true,
  },
  {
    id: 'inbox-13',
    origin: 'GRU',
    destination: 'LIS',
    airline: 'TAP',
    price: 1820,
    currency: 'BRL',
    departureAt: '2026-11-15T21:00:00Z',
    returnAt: '2026-11-29T09:00:00Z',
    stops: 0,
    duration: 660,
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'ACTIVE',
    opportunityScore: 90,
    confidenceScore: 86,
    personalFitScore: 83,
    favorited: true,
  },
  {
    id: 'inbox-14',
    origin: 'CGH',
    destination: 'POA',
    airline: 'Azul',
    price: 320,
    currency: 'BRL',
    departureAt: '2026-09-10T07:00:00Z',
    returnAt: '2026-09-14T20:00:00Z',
    stops: 0,
    duration: 105,
    cabinClass: 'Economy',
    status: 'EXPIRED',
    opportunityScore: 94,
    confidenceScore: 91,
    personalFitScore: 88,
    favorited: true,
  },
]

export async function getInboxDeals(): Promise<InboxDeal[]> {
  // TODO: substituir por GET /api/inbox
  return MOCK_INBOX
}
