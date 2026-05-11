import type { NormalizedFareResult } from '@farehunter/core'

export interface AiInsight {
  summary: string
  recommendation: string
}

export function analyzeOpportunity(_fare: NormalizedFareResult): Promise<AiInsight> {
  return Promise.resolve({
    summary: 'AI analysis not yet implemented.',
    recommendation: 'N/A',
  })
}
