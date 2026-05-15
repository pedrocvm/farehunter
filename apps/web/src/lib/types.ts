// Tipos centrais da camada de dados.
// Componentes de UI importam daqui — nunca o contrário.
// Quando a API real estiver pronta, apenas data.ts muda; os tipos permanecem.

export type DealStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'UNVERIFIED'
  | 'REVALIDATED'
  | 'POSSIBLE_ERROR'
  | 'LOW_CONFIDENCE'
  | 'NEEDS_REVIEW'

export type Deal = {
  id: string
  origin: string
  destination: string
  airline: string
  price: number
  currency: string
  departureAt: string         // ISO 8601
  returnAt?: string | null    // null/ausente = somente ida
  stops: number
  duration?: string | number | null  // minutos (number) ou string formatada
  // Scores opcionais — presentes quando o módulo de scoring processar a oferta
  opportunityScore?: number
  confidenceScore?: number
  personalFitScore?: number
  status?: DealStatus
  cabinClass?: string
  baggage?: string
}
