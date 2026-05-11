import { z } from 'zod'
import { CabinClassSchema, AlertLevelSchema } from './enums.js'

export const WatchlistInputSchema = z.object({
  name: z.string().min(1).max(100),
  originCode: z.string().length(3).toUpperCase().optional(),
  destinationCode: z.string().length(3).toUpperCase().optional(),
})

export type WatchlistInput = z.infer<typeof WatchlistInputSchema>

export const PriceTargetInputSchema = z.object({
  watchlistId: z.string().optional(),
  originCode: z.string().length(3).toUpperCase(),
  destinationCode: z.string().length(3).toUpperCase(),
  cabinClass: CabinClassSchema.default('ECONOMY'),
  maxPrice: z.number().positive(),
  currency: z.string().length(3).default('EUR'),
  departureDateMin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  departureDateMax: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  minTripDays: z.number().int().positive().optional(),
  maxTripDays: z.number().int().positive().optional(),
})

export type PriceTargetInput = z.infer<typeof PriceTargetInputSchema>

export const NotificationRuleInputSchema = z.object({
  watchlistId: z.string().optional(),
  name: z.string().min(1).max(100),
  minAlertLevel: AlertLevelSchema.default('STRONG'),
  minScore: z.number().min(0).max(100).default(70),
  channels: z.array(z.string().min(1)).min(1),
})

export type NotificationRuleInput = z.infer<typeof NotificationRuleInputSchema>
