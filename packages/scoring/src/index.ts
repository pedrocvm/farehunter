import { z } from 'zod'
import type { NormalizedFareResult, OpportunityScore, ConfidenceScore, TravelFrictionScore } from '@farehunter/core'

export const ScoreResultSchema = z.object({
  opportunityScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  personalFitScore: z.number().min(0).max(100),
  expiryRiskScore: z.number().min(0).max(100),
  travelFriction: z.number().min(0).max(100),
})

export type ScoreResult = z.infer<typeof ScoreResultSchema>

export interface ScoreBreakdown {
  opportunity: OpportunityScore
  confidence: ConfidenceScore
  travelFriction: TravelFrictionScore
}

export function scoreFare(
  _fare: NormalizedFareResult,
  _historicalAvgEur?: number,
): ScoreResult {
  return {
    opportunityScore: 0,
    confidenceScore: 0,
    personalFitScore: 0,
    expiryRiskScore: 0,
    travelFriction: 0,
  }
}
