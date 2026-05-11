import { z } from 'zod'
import {
  CabinClassSchema,
  TripTypeSchema,
  FareStatusSchema,
  AlertLevelSchema,
} from './enums.js'

// ─── Passengers ───────────────────────────────────────────────────────────────

export const PassengerConfigSchema = z.object({
  adults: z.number().int().positive().default(1),
  children: z.number().int().nonnegative().default(0),
  infants: z.number().int().nonnegative().default(0),
})

export type PassengerConfig = z.infer<typeof PassengerConfigSchema>

// ─── Search Input ─────────────────────────────────────────────────────────────

export const FlightSearchInputSchema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  cabinClass: CabinClassSchema.default('ECONOMY'),
  passengers: PassengerConfigSchema.default({}),
})

export type FlightSearchInput = z.infer<typeof FlightSearchInputSchema>

// ─── Fare Segments ────────────────────────────────────────────────────────────

export const FareSegmentSchema = z.object({
  sequence: z.number().int().nonnegative(),
  originCode: z.string().length(3),
  destinationCode: z.string().length(3),
  airlineCode: z.string().min(2).max(3),
  flightNumber: z.string().optional(),
  departureAt: z.string().datetime(),
  arrivalAt: z.string().datetime(),
  durationMinutes: z.number().int().positive().optional(),
  cabinClass: CabinClassSchema.default('ECONOMY'),
  aircraft: z.string().optional(),
})

export type FareSegment = z.infer<typeof FareSegmentSchema>

// ─── Price Breakdown ──────────────────────────────────────────────────────────

export const FarePriceBreakdownSchema = z.object({
  base: z.number().nonnegative(),
  taxes: z.number().nonnegative(),
  fees: z.number().nonnegative(),
  total: z.number().positive(),
  currency: z.string().length(3),
})

export type FarePriceBreakdown = z.infer<typeof FarePriceBreakdownSchema>

// ─── Normalized Fare Result ───────────────────────────────────────────────────

export const NormalizedFareResultSchema = z.object({
  id: z.string(),
  routeOrigin: z.string().length(3),
  routeDestination: z.string().length(3),
  airlineCode: z.string().min(2).max(3),
  cabinClass: CabinClassSchema,
  tripType: TripTypeSchema,
  departureAt: z.string().datetime(),
  returnAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  layoverMinutes: z.number().int().nonnegative().optional(),
  stops: z.number().int().nonnegative(),
  price: z.number().positive(),
  currency: z.string().length(3),
  priceBreakdown: FarePriceBreakdownSchema.optional(),
  includedBagKg: z.number().int().nonnegative().optional(),
  deeplink: z.string().url().optional(),
  status: FareStatusSchema,
  alertLevel: AlertLevelSchema,
  resultHash: z.string().length(32),
  source: z.string(),
  fetchedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  segments: z.array(FareSegmentSchema),
})

export type NormalizedFareResult = z.infer<typeof NormalizedFareResultSchema>

// ─── Score Types ──────────────────────────────────────────────────────────────

export interface OpportunityScore {
  value: number
  historyBased: boolean
}

export interface ConfidenceScore {
  value: number
  factors: string[]
}

export interface PersonalFitScore {
  value: number
}

export interface ExpiryRiskScore {
  value: number
  estimatedHoursLeft?: number
}

export interface TravelFrictionScore {
  value: number
  factors: string[]
}

// ─── Adapter Contract ─────────────────────────────────────────────────────────

export interface AdapterHealthResult {
  isHealthy: boolean
  responseMs?: number
  error?: string
}

export interface AirlineAdapter {
  readonly name: string
  search(input: FlightSearchInput): Promise<NormalizedFareResult[]>
  healthCheck(): Promise<AdapterHealthResult>
}
