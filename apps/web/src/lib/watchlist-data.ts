// Tipos e dados da camada de watchlists.
// Quando o backend estiver pronto, substituir MOCK_WATCHLISTS por chamadas reais
// nas funções getWatchlists / createWatchlist / etc.

export type WatchlistStatus = 'ACTIVE' | 'INACTIVE'

export type Watchlist = {
  id: string
  name: string
  origin: string           // Código IATA (ex: GRU)
  destination: string      // Código IATA ou região (ex: LIS, Europa)
  maxPrice?: number
  currency: string
  cabinClass?: string
  status: WatchlistStatus
  createdAt: string        // ISO 8601
  matchCount?: number      // Ofertas atuais que atendem esta watchlist
}

export type CreateWatchlistInput = Omit<Watchlist, 'id' | 'createdAt' | 'matchCount'>

// --- Mock data ---

const MOCK_WATCHLISTS: Watchlist[] = [
  {
    id: 'wl-1',
    name: 'Lisboa no inverno',
    origin: 'GRU',
    destination: 'LIS',
    maxPrice: 2000,
    currency: 'BRL',
    cabinClass: 'Economy',
    status: 'ACTIVE',
    createdAt: '2025-06-01T10:00:00Z',
    matchCount: 2,
  },
  {
    id: 'wl-2',
    name: 'Recife — feriado',
    origin: 'CGH',
    destination: 'REC',
    maxPrice: 500,
    currency: 'BRL',
    cabinClass: 'Economy',
    status: 'ACTIVE',
    createdAt: '2025-06-10T14:00:00Z',
    matchCount: 1,
  },
  {
    id: 'wl-3',
    name: 'Miami executiva',
    origin: 'GRU',
    destination: 'MIA',
    currency: 'BRL',
    cabinClass: 'Business',
    status: 'INACTIVE',
    createdAt: '2025-05-20T08:00:00Z',
    matchCount: 0,
  },
  {
    id: 'wl-4',
    name: 'Paris qualquer época',
    origin: 'GRU',
    destination: 'CDG',
    maxPrice: 1800,
    currency: 'BRL',
    cabinClass: 'Economy',
    status: 'ACTIVE',
    createdAt: '2025-07-01T09:00:00Z',
    matchCount: 0,
  },
]

// --- Funções de acesso (stubs prontos para integração real) ---

export async function getWatchlists(): Promise<Watchlist[]> {
  // TODO: substituir por GET /api/watchlists
  return MOCK_WATCHLISTS
}

export async function createWatchlist(input: CreateWatchlistInput): Promise<Watchlist> {
  // TODO: substituir por POST /api/watchlists
  return {
    ...input,
    id: `wl-${Date.now()}`,
    createdAt: new Date().toISOString(),
    matchCount: 0,
  }
}

export async function toggleWatchlistStatus(id: string, status: WatchlistStatus): Promise<void> {
  // TODO: substituir por PATCH /api/watchlists/:id
  console.info('[watchlist] toggle', id, status)
}

export async function deleteWatchlist(id: string): Promise<void> {
  // TODO: substituir por DELETE /api/watchlists/:id
  console.info('[watchlist] delete', id)
}
