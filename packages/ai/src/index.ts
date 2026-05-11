import type { Flight } from '@farehunter/core'

export interface AiInsight {
  summary: string
  recommendation: string
}

export async function analyzeOpportunity(_flight: Flight): Promise<AiInsight> {
  return {
    summary: 'AI analysis not yet implemented.',
    recommendation: 'N/A',
  }
}
