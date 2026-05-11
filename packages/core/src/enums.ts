import { z } from 'zod'

export const CabinClassSchema = z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
export type CabinClass = z.infer<typeof CabinClassSchema>

export const TripTypeSchema = z.enum(['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY'])
export type TripType = z.infer<typeof TripTypeSchema>

export const FareStatusSchema = z.enum([
  'ACTIVE',
  'EXPIRED',
  'UNVERIFIED',
  'REVALIDATED',
  'POSSIBLE_ERROR',
  'LOW_CONFIDENCE',
  'NEEDS_REVIEW',
])
export type FareStatus = z.infer<typeof FareStatusSchema>

export const AlertLevelSchema = z.enum(['NORMAL', 'STRONG', 'EXCELLENT', 'RARE', 'REVIEW_BEFORE_BUY'])
export type AlertLevel = z.infer<typeof AlertLevelSchema>

export const AdapterStatusSchema = z.enum(['MOCK', 'ACTIVE', 'PAUSED', 'DISABLED', 'DO_NOT_USE'])
export type AdapterStatus = z.infer<typeof AdapterStatusSchema>

export const FeedbackTypeSchema = z.enum([
  'LIKED',
  'DISLIKED',
  'IRRELEVANT',
  'GOOD_PRICE_BAD_FLIGHT',
  'BAD_DESTINATION',
  'BAD_AIRPORT',
  'NO_BAGGAGE_NOT_USEFUL',
  'EXCELLENT_ALERT',
  'WEAK_ALERT',
])
export type FeedbackType = z.infer<typeof FeedbackTypeSchema>

export const SourceAccessStatusSchema = z.enum([
  'ALLOWED',
  'LIMITED',
  'MANUAL_ONLY',
  'DISABLED',
  'DO_NOT_USE',
])
export type SourceAccessStatus = z.infer<typeof SourceAccessStatusSchema>
