import { describe, it, expect, beforeEach } from 'vitest'
import { DeduplicatorService } from './deduplicator.js'
import { ResultHashService } from './hash.js'
import type { NormalizedFareResult } from '../types.js'

function makeFare(overrides: Partial<NormalizedFareResult> = {}): NormalizedFareResult {
  const base = {
    id: 'test-id',
    routeOrigin: 'OPO',
    routeDestination: 'CDG',
    airlineCode: 'FR',
    cabinClass: 'ECONOMY' as const,
    tripType: 'ROUND_TRIP' as const,
    departureAt: '2026-07-10T06:25:00Z',
    returnAt: '2026-07-17T14:30:00Z',
    durationMinutes: 135,
    stops: 0,
    price: 35,
    currency: 'EUR',
    status: 'ACTIVE' as const,
    alertLevel: 'EXCELLENT' as const,
    source: 'mock',
    fetchedAt: '2026-05-11T10:00:00Z',
    segments: [],
    ...overrides,
  }

  const resultHash = ResultHashService.compute({
    origin: base.routeOrigin,
    destination: base.routeDestination,
    airlineCode: base.airlineCode,
    cabinClass: base.cabinClass,
    tripType: base.tripType,
    departureAt: base.departureAt,
    returnAt: base.returnAt,
    adults: 1,
    totalPrice: base.price,
    source: base.source,
  })

  return { ...base, resultHash }
}

describe('DeduplicatorService', () => {
  let svc: DeduplicatorService

  beforeEach(() => {
    svc = new DeduplicatorService()
  })

  it('returns insert for a new fare', () => {
    const fare = makeFare()
    const result = svc.classify(fare)
    expect(result.action).toBe('insert')
    expect(result.existing).toBeUndefined()
  })

  it('returns skip for an exact duplicate (same hash)', () => {
    const fare = makeFare()
    svc.classify(fare)
    const result = svc.classify(fare)
    expect(result.action).toBe('skip')
    expect(result.existing).toBeDefined()
  })

  it('returns update when same flight slot has a lower price', () => {
    const expensive = makeFare({ price: 50, id: 'fare-1' })
    const cheap = makeFare({ price: 35, id: 'fare-2' })

    svc.classify(expensive)
    const result = svc.classify(cheap)

    expect(result.action).toBe('update')
    expect(result.existing?.price).toBe(50)
    expect(result.priceDropEur).toBeCloseTo(15)
  })

  it('returns skip when same flight slot has a higher price', () => {
    const cheap = makeFare({ price: 35, id: 'fare-1' })
    const expensive = makeFare({ price: 50, id: 'fare-2' })

    svc.classify(cheap)
    const result = svc.classify(expensive)

    expect(result.action).toBe('skip')
  })

  it('inserts two fares for the same route but different airlines', () => {
    const ryanair = makeFare({ airlineCode: 'FR', price: 35 })
    const vueling = makeFare({ airlineCode: 'VY', price: 45 })

    expect(svc.classify(ryanair).action).toBe('insert')
    expect(svc.classify(vueling).action).toBe('insert')
    expect(svc.size()).toBe(2)
  })

  it('inserts two fares for the same route but different departure dates', () => {
    const july10 = makeFare({ departureAt: '2026-07-10T06:25:00Z', returnAt: '2026-07-17T14:30:00Z' })
    const july20 = makeFare({ departureAt: '2026-07-20T06:25:00Z', returnAt: '2026-07-27T14:30:00Z' })

    expect(svc.classify(july10).action).toBe('insert')
    expect(svc.classify(july20).action).toBe('insert')
    expect(svc.size()).toBe(2)
  })

  it('has() returns true after insert', () => {
    const fare = makeFare()
    svc.classify(fare)
    expect(svc.has(fare.resultHash)).toBe(true)
  })

  it('has() returns false for unknown hash', () => {
    expect(svc.has('a'.repeat(32))).toBe(false)
  })

  it('size() reflects number of unique route-slots', () => {
    expect(svc.size()).toBe(0)
    svc.classify(makeFare({ price: 35 }))
    expect(svc.size()).toBe(1)
  })

  it('clear() resets all state', () => {
    svc.classify(makeFare())
    expect(svc.size()).toBe(1)
    svc.clear()
    expect(svc.size()).toBe(0)

    // After clear, same fare is inserted again
    const result = svc.classify(makeFare())
    expect(result.action).toBe('insert')
  })
})
