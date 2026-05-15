// Tipos e dados para a camada de Price Targets.
// Quando o backend estiver pronto, substituir mocks pelas chamadas reais.

export type PriceTargetStatus = 'REACHED' | 'CLOSE' | 'WATCHING' | 'FAR'

export type PriceTarget = {
  id: string
  origin: string
  destination: string
  targetPrice: number      // Preço-alvo definido pelo usuário
  lowestFound?: number     // Menor preço detectado até agora (undefined = ainda buscando)
  currency: string
  cabinClass?: string
  createdAt: string        // ISO 8601
}

// Calcula status e métricas a partir dos dados brutos —
// não armazenamos status no modelo para evitar dessincronia.
export type PriceTargetMetrics = {
  status: PriceTargetStatus
  diff: number             // lowestFound - targetPrice (negativo = abaixo da meta)
  diffPct: number          // diff / targetPrice * 100
  progress: number         // 0-100: quanto do caminho já foi percorrido até a meta
}

export function computeMetrics(target: PriceTarget): PriceTargetMetrics {
  const { targetPrice, lowestFound } = target

  if (lowestFound == null) {
    return { status: 'WATCHING', diff: 0, diffPct: 0, progress: 0 }
  }

  const diff = lowestFound - targetPrice
  const diffPct = (diff / targetPrice) * 100
  // progress: 100% quando meta é atingida, proporcional antes disso
  const progress = Math.min(100, Math.round((targetPrice / lowestFound) * 100))

  let status: PriceTargetStatus
  if (lowestFound <= targetPrice) status = 'REACHED'
  else if (diffPct <= 10)         status = 'CLOSE'
  else if (diffPct <= 30)         status = 'WATCHING'
  else                            status = 'FAR'

  return { status, diff, diffPct, progress }
}

// --- Mock data: 5 targets cobrindo todos os status ---

const MOCK_TARGETS: PriceTarget[] = [
  {
    id: 'pt-1',
    origin: 'CGH',
    destination: 'REC',
    targetPrice: 500,
    lowestFound: 480,     // REACHED — abaixo da meta
    currency: 'BRL',
    cabinClass: 'Economy',
    createdAt: '2025-06-01T10:00:00Z',
  },
  {
    id: 'pt-2',
    origin: 'GRU',
    destination: 'CDG',
    targetPrice: 1700,
    lowestFound: 1650,    // REACHED — 50 abaixo
    currency: 'BRL',
    cabinClass: 'Economy',
    createdAt: '2025-06-10T08:00:00Z',
  },
  {
    id: 'pt-3',
    origin: 'GRU',
    destination: 'MIA',
    targetPrice: 3000,
    lowestFound: 3200,    // CLOSE — 6.7% acima
    currency: 'BRL',
    cabinClass: 'Business',
    createdAt: '2025-05-20T14:00:00Z',
  },
  {
    id: 'pt-4',
    origin: 'GRU',
    destination: 'LIS',
    targetPrice: 1500,
    lowestFound: 1850,    // WATCHING — 23% acima
    currency: 'BRL',
    cabinClass: 'Economy',
    createdAt: '2025-07-01T09:00:00Z',
  },
  {
    id: 'pt-5',
    origin: 'GRU',
    destination: 'BCN',
    targetPrice: 1200,
    lowestFound: 2100,    // FAR — 75% acima
    currency: 'BRL',
    cabinClass: 'Economy',
    createdAt: '2025-07-05T11:00:00Z',
  },
]

// --- Funções de acesso ---

export async function getPriceTargets(): Promise<PriceTarget[]> {
  // TODO: substituir por GET /api/price-targets
  return MOCK_TARGETS
}

export async function deletePriceTarget(id: string): Promise<void> {
  // TODO: substituir por DELETE /api/price-targets/:id
  console.info('[price-target] delete', id)
}
