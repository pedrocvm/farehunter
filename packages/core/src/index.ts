export { logger } from './logger.js'

export {
  CabinClassSchema,
  TripTypeSchema,
  FareStatusSchema,
  AlertLevelSchema,
  AdapterStatusSchema,
  FeedbackTypeSchema,
  SourceAccessStatusSchema,
} from './enums.js'
export type {
  CabinClass,
  TripType,
  FareStatus,
  AlertLevel,
  AdapterStatus,
  FeedbackType,
  SourceAccessStatus,
} from './enums.js'

export {
  PassengerConfigSchema,
  FlightSearchInputSchema,
  FareSegmentSchema,
  FarePriceBreakdownSchema,
  NormalizedFareResultSchema,
} from './types.js'
export type {
  PassengerConfig,
  FlightSearchInput,
  FareSegment,
  FarePriceBreakdown,
  NormalizedFareResult,
  OpportunityScore,
  ConfidenceScore,
  PersonalFitScore,
  ExpiryRiskScore,
  TravelFrictionScore,
  AdapterHealthResult,
  AirlineAdapter,
} from './types.js'

export {
  WatchlistInputSchema,
  PriceTargetInputSchema,
  NotificationRuleInputSchema,
} from './schemas.js'
export type {
  WatchlistInput,
  PriceTargetInput,
  NotificationRuleInput,
} from './schemas.js'

export { ResultHashService } from './services/hash.js'
export type { HashParams } from './services/hash.js'

export { NormalizerService } from './services/normalizer.js'
export type { NormalizationResult } from './services/normalizer.js'

export { DeduplicatorService } from './services/deduplicator.js'
export type { DedupeAction, DedupeResult } from './services/deduplicator.js'

export { FareValidationService } from './services/validation.js'
export type { ValidationIssue, ValidationResult } from './services/validation.js'
