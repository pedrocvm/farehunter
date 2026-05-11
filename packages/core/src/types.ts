import { z } from 'zod'

export const FlightSchema = z.object({
  id: z.string(),
  origin: z.string().length(3),
  destination: z.string().length(3),
  departureAt: z.string().datetime(),
  returnAt: z.string().datetime().nullable(),
  price: z.number().positive(),
  currency: z.string().length(3).default('BRL'),
  airline: z.string(),
  stops: z.number().int().nonnegative(),
  source: z.string(),
  fetchedAt: z.string().datetime(),
})

export type Flight = z.infer<typeof FlightSchema>

export const PricePointSchema = z.object({
  price: z.number().positive(),
  currency: z.string().length(3),
  recordedAt: z.string().datetime(),
})

export type PricePoint = z.infer<typeof PricePointSchema>
