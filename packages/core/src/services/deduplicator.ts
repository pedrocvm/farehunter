import { ResultHashService } from './hash.js'
import { logger } from '../logger.js'
import type { NormalizedFareResult } from '../types.js'

export type DedupeAction = 'insert' | 'update' | 'skip'

export interface DedupeResult {
  action: DedupeAction
  existing?: NormalizedFareResult
  priceDropEur?: number
}

export class DeduplicatorService {
  private readonly byHash = new Map<string, NormalizedFareResult>()
  private readonly byRoute = new Map<string, NormalizedFareResult>()

  classify(incoming: NormalizedFareResult): DedupeResult {
    const existingExact = this.byHash.get(incoming.resultHash)

    if (existingExact) {
      return { action: 'skip', existing: existingExact }
    }

    const routeKey = ResultHashService.routeKey({
      origin: incoming.routeOrigin,
      destination: incoming.routeDestination,
      airlineCode: incoming.airlineCode,
      cabinClass: incoming.cabinClass,
      departureAt: incoming.departureAt,
    })

    const existingRoute = this.byRoute.get(routeKey)

    if (existingRoute && incoming.price < existingRoute.price) {
      const priceDropEur = existingRoute.price - incoming.price
      logger.debug(
        { routeKey, oldPrice: existingRoute.price, newPrice: incoming.price, priceDropEur },
        'DeduplicatorService: price drop detected',
      )
      this.byRoute.set(routeKey, incoming)
      this.byHash.set(incoming.resultHash, incoming)
      return { action: 'update', existing: existingRoute, priceDropEur }
    }

    if (existingRoute) {
      return { action: 'skip', existing: existingRoute }
    }

    this.byHash.set(incoming.resultHash, incoming)
    this.byRoute.set(routeKey, incoming)
    return { action: 'insert' }
  }

  has(hash: string): boolean {
    return this.byHash.has(hash)
  }

  get(hash: string): NormalizedFareResult | undefined {
    return this.byHash.get(hash)
  }

  size(): number {
    return this.byHash.size
  }

  clear(): void {
    this.byHash.clear()
    this.byRoute.clear()
  }
}
