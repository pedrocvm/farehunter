import { createHash, randomUUID } from 'crypto'
import { logger } from '@farehunter/core'
import type {
  AirlineAdapter,
  AdapterHealthResult,
  FlightSearchInput,
  NormalizedFareResult,
} from '@farehunter/core'

function fareHash(...parts: string[]): string {
  return createHash('sha256').update(parts.join('::')).digest('hex').slice(0, 32)
}

const now = () => new Date().toISOString()
const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString()

type MockRoute = `${string}-${string}`

const MOCK_DATA: Partial<Record<MockRoute, NormalizedFareResult[]>> = {
  'OPO-CDG': [
    {
      id: randomUUID(),
      routeOrigin: 'OPO',
      routeDestination: 'CDG',
      airlineCode: 'FR',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: '2026-07-10T06:25:00Z',
      returnAt: '2026-07-17T14:30:00Z',
      durationMinutes: 135,
      stops: 0,
      price: 35,
      currency: 'EUR',
      priceBreakdown: { base: 10, taxes: 20, fees: 5, total: 35, currency: 'EUR' },
      includedBagKg: 0,
      status: 'ACTIVE',
      alertLevel: 'EXCELLENT',
      resultHash: fareHash('OPO', 'CDG', '2026-07-10T06:25:00Z', 'FR', '35'),
      source: 'mock',
      fetchedAt: now(),
      expiresAt: inHours(24),
      segments: [
        {
          sequence: 0,
          originCode: 'OPO',
          destinationCode: 'CDG',
          airlineCode: 'FR',
          flightNumber: 'FR8234',
          departureAt: '2026-07-10T06:25:00Z',
          arrivalAt: '2026-07-10T08:40:00Z',
          durationMinutes: 135,
          cabinClass: 'ECONOMY',
        },
      ],
    },
  ],
  'OPO-MAD': [
    {
      id: randomUUID(),
      routeOrigin: 'OPO',
      routeDestination: 'MAD',
      airlineCode: 'VY',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: '2026-06-15T07:10:00Z',
      returnAt: '2026-06-18T21:45:00Z',
      durationMinutes: 75,
      stops: 0,
      price: 45,
      currency: 'EUR',
      priceBreakdown: { base: 20, taxes: 20, fees: 5, total: 45, currency: 'EUR' },
      includedBagKg: 0,
      status: 'ACTIVE',
      alertLevel: 'STRONG',
      resultHash: fareHash('OPO', 'MAD', '2026-06-15T07:10:00Z', 'VY', '45'),
      source: 'mock',
      fetchedAt: now(),
      expiresAt: inHours(48),
      segments: [
        {
          sequence: 0,
          originCode: 'OPO',
          destinationCode: 'MAD',
          airlineCode: 'VY',
          flightNumber: 'VY1234',
          departureAt: '2026-06-15T07:10:00Z',
          arrivalAt: '2026-06-15T08:25:00Z',
          durationMinutes: 75,
          cabinClass: 'ECONOMY',
        },
      ],
    },
  ],
}

export class MockAdapter implements AirlineAdapter {
  readonly name = 'mock'

  async search(input: FlightSearchInput): Promise<NormalizedFareResult[]> {
    logger.debug({ input }, 'MockAdapter.search called')
    await new Promise((resolve) => setTimeout(resolve, 50))

    const key: MockRoute = `${input.origin}-${input.destination}`
    return MOCK_DATA[key] ?? []
  }

  async healthCheck(): Promise<AdapterHealthResult> {
    return { isHealthy: true, responseMs: 1 }
  }
}
