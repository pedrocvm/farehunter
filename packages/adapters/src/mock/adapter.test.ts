import { describe, it, expect, beforeEach } from 'vitest'
import { MockAirlineAdapter } from './adapter.js'
import { MockAdapterFactory } from './factory.js'
import { generateFares } from './generator.js'
import { AdapterRegistry } from '../registry.js'
import type { FlightSearchInput } from '@farehunter/core'

const SEARCH_OPO_CDG: FlightSearchInput = {
  origin: 'OPO',
  destination: 'CDG',
  departureDate: '2026-07-10',
  returnDate: '2026-07-17',
  cabinClass: 'ECONOMY',
  passengers: { adults: 1, children: 0, infants: 0 },
}

describe('MockAirlineAdapter', () => {
  let adapter: MockAirlineAdapter

  beforeEach(() => {
    adapter = new MockAirlineAdapter()
  })

  it('has the correct name', () => {
    expect(adapter.name).toBe('mock')
  })

  it('returns fares for a known route', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    expect(fares.length).toBeGreaterThan(0)
  })

  it('returns empty array for an unknown route', async () => {
    const fares = await adapter.search({
      ...SEARCH_OPO_CDG,
      origin: 'XYZ',
      destination: 'ZZZ',
    })
    expect(fares).toHaveLength(0)
  })

  it('all fares have a valid 32-char resultHash', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    for (const fare of fares) {
      expect(fare.resultHash).toHaveLength(32)
      expect(fare.resultHash).toMatch(/^[0-9a-f]{32}$/)
    }
  })

  it('all fares have matching cabin class', async () => {
    const input = { ...SEARCH_OPO_CDG, cabinClass: 'BUSINESS' as const }
    const fares = await adapter.search(input)
    expect(fares.length).toBeGreaterThan(0)
    for (const fare of fares) {
      expect(fare.cabinClass).toBe('BUSINESS')
    }
  })

  it('all fares have positive price', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    for (const fare of fares) {
      expect(fare.price).toBeGreaterThan(0)
    }
  })

  it('fares are sorted by price ascending', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    for (let i = 1; i < fares.length; i++) {
      expect(fares[i]?.price).toBeGreaterThanOrEqual(fares[i - 1]?.price ?? 0)
    }
  })

  it('all fares have at least one segment', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    for (const fare of fares) {
      expect(fare.segments.length).toBeGreaterThan(0)
    }
  })

  it('round-trip fares have a returnAt date', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    const roundTrips = fares.filter((f) => f.tripType === 'ROUND_TRIP')
    expect(roundTrips.length).toBeGreaterThan(0)
    for (const fare of roundTrips) {
      expect(fare.returnAt).toBeDefined()
    }
  })

  it('one-way search returns ONE_WAY fares', async () => {
    const fares = await adapter.search({ ...SEARCH_OPO_CDG, returnDate: undefined })
    expect(fares.length).toBeGreaterThan(0)
    for (const fare of fares) {
      expect(fare.tripType).toBe('ONE_WAY')
      expect(fare.returnAt).toBeUndefined()
    }
  })

  it('business class fares cost more than economy', async () => {
    const econ = await adapter.search({ ...SEARCH_OPO_CDG, cabinClass: 'ECONOMY' })
    const biz = await adapter.search({ ...SEARCH_OPO_CDG, cabinClass: 'BUSINESS' })
    const avgEcon = econ.reduce((s, f) => s + f.price, 0) / econ.length
    const avgBiz = biz.reduce((s, f) => s + f.price, 0) / biz.length
    expect(avgBiz).toBeGreaterThan(avgEcon * 2)
  })

  it('summer fares cost more than winter fares for the same route', async () => {
    const summer = await adapter.search({ ...SEARCH_OPO_CDG, departureDate: '2026-08-01', returnDate: '2026-08-08' })
    const winter = await adapter.search({ ...SEARCH_OPO_CDG, departureDate: '2026-02-01', returnDate: '2026-02-08' })
    const avgSummer = summer.reduce((s, f) => s + f.price, 0) / summer.length
    const avgWinter = winter.reduce((s, f) => s + f.price, 0) / winter.length
    expect(avgSummer).toBeGreaterThan(avgWinter)
  })

  it('results are deterministic (same search = same fares)', async () => {
    const first = await adapter.search(SEARCH_OPO_CDG)
    const second = await adapter.search(SEARCH_OPO_CDG)
    expect(first.map((f) => f.resultHash)).toEqual(second.map((f) => f.resultHash))
    expect(first.map((f) => f.price)).toEqual(second.map((f) => f.price))
  })

  it('all fares have a valid currency (EUR)', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    for (const fare of fares) {
      expect(fare.currency).toBe('EUR')
    }
  })

  it('healthCheck returns isHealthy: true', async () => {
    const health = await adapter.healthCheck()
    expect(health.isHealthy).toBe(true)
    expect(health.responseMs).toBeGreaterThanOrEqual(0)
  })

  it('includes alternative-airport results when nearby airports exist', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    // OPO has VGO and SCQ as nearby; VGO-CDG route exists
    const altFares = fares.filter((f) => f.routeOrigin !== 'OPO')
    expect(altFares.length).toBeGreaterThan(0)
  })

  it('priceBreakdown total matches fare price', async () => {
    const fares = await adapter.search(SEARCH_OPO_CDG)
    for (const fare of fares) {
      if (fare.priceBreakdown) {
        expect(fare.priceBreakdown.total).toBeCloseTo(fare.price, 1)
      }
    }
  })
})

describe('MockAdapterFactory', () => {
  it('creates an adapter with the correct name', () => {
    const adapter = MockAdapterFactory.create('test-adapter')
    expect(adapter.name).toBe('test-adapter')
  })

  it('creates default name "mock" if none given', () => {
    const adapter = MockAdapterFactory.create()
    expect(adapter.name).toBe('mock')
  })

  it('createNamed returns one adapter per name', () => {
    const adapters = MockAdapterFactory.createNamed(['a', 'b', 'c'])
    expect(adapters).toHaveLength(3)
    expect(adapters.map((a) => a.name)).toEqual(['a', 'b', 'c'])
  })
})

describe('AdapterRegistry', () => {
  let registry: AdapterRegistry

  beforeEach(() => {
    registry = new AdapterRegistry()
  })

  it('starts empty', () => {
    expect(registry.count()).toBe(0)
  })

  it('register and get work correctly', () => {
    const adapter = MockAdapterFactory.create()
    registry.register(adapter)
    expect(registry.has('mock')).toBe(true)
    expect(registry.get('mock')).toBe(adapter)
    expect(registry.count()).toBe(1)
  })

  it('unregister removes the adapter', () => {
    registry.register(MockAdapterFactory.create())
    expect(registry.unregister('mock')).toBe(true)
    expect(registry.has('mock')).toBe(false)
    expect(registry.count()).toBe(0)
  })

  it('unregister returns false for unknown adapter', () => {
    expect(registry.unregister('nonexistent')).toBe(false)
  })

  it('searchAll returns results from all registered adapters', async () => {
    registry.register(MockAdapterFactory.create('a'))
    registry.register(MockAdapterFactory.create('b'))
    const results = await registry.searchAll(SEARCH_OPO_CDG)
    expect(results.size).toBe(2)
    expect(results.get('a')?.length).toBeGreaterThan(0)
    expect(results.get('b')?.length).toBeGreaterThan(0)
  })

  it('healthCheckAll returns health for all adapters', async () => {
    registry.register(MockAdapterFactory.create('alpha'))
    const health = await registry.healthCheckAll()
    expect(health.size).toBe(1)
    expect(health.get('alpha')?.isHealthy).toBe(true)
  })
})

describe('generateFares', () => {
  it('returns empty for unknown route', () => {
    const fares = generateFares({
      origin: 'ZZZ',
      destination: 'YYY',
      departureDate: '2026-07-10',
      cabinClass: 'ECONOMY',
      adults: 1,
      source: 'mock',
    })
    expect(fares).toHaveLength(0)
  })

  it('returns multiple fares for a well-served route', () => {
    const fares = generateFares({
      origin: 'OPO',
      destination: 'CDG',
      departureDate: '2026-07-10',
      cabinClass: 'ECONOMY',
      adults: 1,
      source: 'mock',
    })
    expect(fares.length).toBeGreaterThan(1)
  })

  it('all hashes in the result are unique', () => {
    const fares = generateFares({
      origin: 'OPO',
      destination: 'MAD',
      departureDate: '2026-07-15',
      cabinClass: 'ECONOMY',
      adults: 1,
      source: 'mock',
    })
    const hashes = fares.map((f) => f.resultHash)
    const unique = new Set(hashes)
    expect(unique.size).toBe(hashes.length)
  })
})
