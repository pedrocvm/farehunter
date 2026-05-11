import { logger } from '@farehunter/core'
import type {
  AirlineAdapter,
  AdapterHealthResult,
  FlightSearchInput,
  NormalizedFareResult,
} from '@farehunter/core'
import { generateFares, findRouteProfile } from './generator.js'
import { NEARBY_AIRPORTS } from './data.js'

export class MockAirlineAdapter implements AirlineAdapter {
  constructor(readonly name: string = 'mock') {}

  async search(input: FlightSearchInput): Promise<NormalizedFareResult[]> {
    await tick()
    logger.debug({ adapter: this.name, input }, 'MockAirlineAdapter.search')

    const results = this.searchRoute(input)

    const nearbyOrigins = NEARBY_AIRPORTS[input.origin] ?? []
    for (const altOrigin of nearbyOrigins) {
      const altProfile = findRouteProfile(altOrigin, input.destination)
      if (!altProfile) continue
      const altFares = this.searchRoute({ ...input, origin: altOrigin })
      results.push(...altFares)
    }

    return results.sort((a, b) => a.price - b.price)
  }

  async healthCheck(): Promise<AdapterHealthResult> {
    const start = Date.now()
    await tick()
    return { isHealthy: true, responseMs: Date.now() - start }
  }

  private searchRoute(input: FlightSearchInput): NormalizedFareResult[] {
    return generateFares({
      origin: input.origin,
      destination: input.destination,
      departureDate: input.departureDate,
      ...(input.returnDate !== undefined && { returnDate: input.returnDate }),
      cabinClass: input.cabinClass,
      adults: input.passengers.adults,
      source: this.name,
    })
  }
}

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 10))
}
