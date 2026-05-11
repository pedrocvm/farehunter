import { NormalizedFareResultSchema } from '../types.js'
import type { NormalizedFareResult } from '../types.js'

export interface ValidationIssue {
  field: string
  message: string
}

export type ValidationResult =
  | { valid: true; data: NormalizedFareResult }
  | { valid: false; issues: ValidationIssue[] }

export class FareValidationService {
  validate(raw: unknown): ValidationResult {
    const result = NormalizedFareResultSchema.safeParse(raw)

    if (result.success) {
      return { valid: true, data: result.data }
    }

    const issues: ValidationIssue[] = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    }))

    return { valid: false, issues }
  }

  isExpired(fare: NormalizedFareResult): boolean {
    if (!fare.expiresAt) return false
    return new Date(fare.expiresAt) < new Date()
  }

  isPossibleError(fare: NormalizedFareResult): boolean {
    const durationH = Math.max((fare.durationMinutes ?? 60) / 60, 0.5)
    return fare.price / durationH < 1
  }
}
