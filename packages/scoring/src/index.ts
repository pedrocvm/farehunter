import { z } from 'zod'
import type { Flight } from '@farehunter/core'

export const ScoreResultSchema = z.object({
  score: z.number().min(0).max(100),
  breakdown: z.object({
    priceScore: z.number(),
    directFlightBonus: z.number(),
  }),
})

export type ScoreResult = z.infer<typeof ScoreResultSchema>

export function scoreFlight(_flight: Flight, _historicalAvg?: number): ScoreResult {
  return {
    score: 0,
    breakdown: {
      priceScore: 0,
      directFlightBonus: 0,
    },
  }
}
