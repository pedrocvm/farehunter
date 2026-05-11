import { randomUUID } from 'crypto'
import { NormalizedFareResultSchema } from '../types.js'
import { ResultHashService } from './hash.js'
import { logger } from '../logger.js'
import type { NormalizedFareResult } from '../types.js'

export type NormalizationResult =
  | { ok: true; data: NormalizedFareResult }
  | { ok: false; error: string; raw?: unknown }

export class NormalizerService {
  normalize(raw: unknown): NormalizationResult {
    const withDefaults = this.applyDefaults(raw)
    const parsed = NormalizedFareResultSchema.safeParse(withDefaults)

    if (!parsed.success) {
      const error = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
      logger.warn({ error, raw }, 'NormalizerService: validation failed')
      return { ok: false, error, raw }
    }

    const data: NormalizedFareResult = {
      ...parsed.data,
      resultHash: this.resolveHash(parsed.data),
    }

    return { ok: true, data }
  }

  normalizeMany(raws: unknown[]): {
    valid: NormalizedFareResult[]
    errors: Array<{ ok: false; error: string; raw?: unknown }>
  } {
    const valid: NormalizedFareResult[] = []
    const errors: Array<{ ok: false; error: string; raw?: unknown }> = []

    for (const raw of raws) {
      const result = this.normalize(raw)
      if (result.ok) {
        valid.push(result.data)
      } else {
        errors.push(result)
      }
    }

    return { valid, errors }
  }

  private applyDefaults(raw: unknown): unknown {
    if (typeof raw !== 'object' || raw === null) return raw
    const r = raw as Record<string, unknown>
    return {
      ...r,
      id: r['id'] ?? randomUUID(),
      fetchedAt: r['fetchedAt'] ?? new Date().toISOString(),
      currency: r['currency'] ?? 'EUR',
      status: r['status'] ?? 'UNVERIFIED',
      alertLevel: r['alertLevel'] ?? 'NORMAL',
      segments: r['segments'] ?? [],
      resultHash: r['resultHash'] ?? '0'.repeat(32),
    }
  }

  private resolveHash(fare: NormalizedFareResult): string {
    if (typeof fare.resultHash === 'string' && fare.resultHash.length === 32) {
      return fare.resultHash
    }

    return ResultHashService.compute({
      origin: fare.routeOrigin,
      destination: fare.routeDestination,
      airlineCode: fare.airlineCode,
      cabinClass: fare.cabinClass,
      tripType: fare.tripType,
      departureAt: fare.departureAt,
      ...(fare.returnAt !== undefined && { returnAt: fare.returnAt }),
      adults: 1,
      totalPrice: fare.price,
      source: fare.source,
    })
  }
}
