import { randomUUID } from 'crypto'
import { logger } from '@farehunter/core'
import type { Flight } from '@farehunter/core'
import type { FlightAdapter, SearchParams } from '../types.js'

const MOCK_FLIGHTS: Omit<Flight, 'id' | 'fetchedAt'>[] = [
  {
    origin: 'GRU',
    destination: 'LIS',
    departureAt: '2025-08-10T10:00:00Z',
    returnAt: '2025-08-24T18:00:00Z',
    price: 1850,
    currency: 'BRL',
    airline: 'TAP',
    stops: 0,
    source: 'mock',
  },
  {
    origin: 'GRU',
    destination: 'LIS',
    departureAt: '2025-08-15T22:00:00Z',
    returnAt: null,
    price: 2400,
    currency: 'BRL',
    airline: 'Iberia',
    stops: 1,
    source: 'mock',
  },
  {
    origin: 'GRU',
    destination: 'BCN',
    departureAt: '2025-09-01T08:00:00Z',
    returnAt: null,
    price: 2100,
    currency: 'BRL',
    airline: 'Iberia',
    stops: 1,
    source: 'mock',
  },
  {
    origin: 'CGH',
    destination: 'REC',
    departureAt: '2025-07-20T06:00:00Z',
    returnAt: '2025-07-27T20:00:00Z',
    price: 480,
    currency: 'BRL',
    airline: 'LATAM',
    stops: 0,
    source: 'mock',
  },
]

export class MockAdapter implements FlightAdapter {
  readonly name = 'mock'

  async search(params: SearchParams): Promise<Flight[]> {
    logger.debug({ params }, 'MockAdapter.search called')

    await new Promise((resolve) => setTimeout(resolve, 50))

    const now = new Date().toISOString()
    return MOCK_FLIGHTS
      .filter(
        (f) =>
          f.origin === params.origin && f.destination === params.destination,
      )
      .map((f) => ({ ...f, id: randomUUID(), fetchedAt: now }))
  }
}
