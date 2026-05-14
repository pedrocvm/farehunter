import type { Deal } from '@/lib/types'

// Dados mock ricos — cobrem todos os status e faixas de score para
// permitir testar a UI completa antes da API real estar pronta.
// Substitua `getDeals` por uma query ao banco quando o Pedro finalizar o backend.
const MOCK_FARES: Deal[] = [
  {
    id: 'mock-1',
    origin: 'GRU',
    destination: 'LIS',
    departureAt: '2025-08-10T10:00:00Z',
    returnAt: '2025-08-24T18:00:00Z',
    price: 1850,
    currency: 'BRL',
    airline: 'TAP',
    stops: 0,
    duration: 660,       // 11h
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'ACTIVE',
    opportunityScore: 92,
    confidenceScore: 88,
    personalFitScore: 85,
  },
  {
    id: 'mock-2',
    origin: 'GRU',
    destination: 'LIS',
    departureAt: '2025-08-15T22:00:00Z',
    returnAt: null,
    price: 2400,
    currency: 'BRL',
    airline: 'Iberia',
    stops: 1,
    duration: 780,       // 13h
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'LOW_CONFIDENCE',
    opportunityScore: 55,
    confidenceScore: 38,
    personalFitScore: 60,
  },
  {
    id: 'mock-3',
    origin: 'GRU',
    destination: 'BCN',
    departureAt: '2025-09-01T08:00:00Z',
    returnAt: null,
    price: 2100,
    currency: 'BRL',
    airline: 'Iberia',
    stops: 1,
    duration: 750,       // 12h30
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'ACTIVE',
    opportunityScore: 78,
    confidenceScore: 82,
    personalFitScore: 72,
  },
  {
    id: 'mock-4',
    origin: 'CGH',
    destination: 'REC',
    departureAt: '2025-07-20T06:00:00Z',
    returnAt: '2025-07-27T20:00:00Z',
    price: 480,
    currency: 'BRL',
    airline: 'LATAM',
    stops: 0,
    duration: 195,       // 3h15
    cabinClass: 'Economy',
    baggage: '10 kg',
    status: 'ACTIVE',
    opportunityScore: 96,
    confidenceScore: 91,
    personalFitScore: 89,
  },
  {
    id: 'mock-5',
    origin: 'GRU',
    destination: 'MIA',
    departureAt: '2025-10-05T14:00:00Z',
    returnAt: '2025-10-15T22:00:00Z',
    price: 3200,
    currency: 'BRL',
    airline: 'LATAM',
    stops: 0,
    duration: 600,       // 10h
    cabinClass: 'Business',
    baggage: '32 kg',
    status: 'NEEDS_REVIEW',
    opportunityScore: 44,
    confidenceScore: 50,
    personalFitScore: 70,
  },
  {
    id: 'mock-6',
    origin: 'GRU',
    destination: 'EZE',
    departureAt: '2025-07-12T07:30:00Z',
    returnAt: '2025-07-14T18:00:00Z',
    price: 390,
    currency: 'BRL',
    airline: 'Aerolíneas',
    stops: 0,
    duration: 180,       // 3h
    cabinClass: 'Economy',
    baggage: '15 kg',
    status: 'EXPIRED',
    opportunityScore: 80,
    confidenceScore: 75,
    personalFitScore: 65,
  },
  {
    id: 'mock-7',
    origin: 'GRU',
    destination: 'CDG',
    departureAt: '2025-09-20T23:00:00Z',
    returnAt: '2025-10-05T07:00:00Z',
    price: 1650,
    currency: 'BRL',
    airline: 'Air France',
    stops: 0,
    duration: 720,       // 12h
    cabinClass: 'Economy',
    baggage: '23 kg',
    status: 'UNVERIFIED',
    opportunityScore: 70,
    confidenceScore: 45,
    personalFitScore: 75,
  },
]

export async function getDeals(): Promise<Deal[]> {
  return MOCK_FARES
}

// Busca por id — O(n) e aceitavel com mock; com BD sera uma query indexada.
export async function getDealById(id: string): Promise<Deal | null> {
  return MOCK_FARES.find((d) => d.id === id) ?? null
}
