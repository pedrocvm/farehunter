import { describe, it, expect } from 'vitest'
import { NormalizerService } from './normalizer.js'
import type { NormalizedFareResult } from '../types.js'

const VALID_FARE: NormalizedFareResult = {
  id: 'test-id-123',
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
  includedBagKg: 0,
  status: 'ACTIVE',
  alertLevel: 'EXCELLENT',
  resultHash: 'a'.repeat(32),
  source: 'mock',
  fetchedAt: '2026-05-11T10:00:00Z',
  segments: [
    {
      sequence: 0,
      originCode: 'OPO',
      destinationCode: 'CDG',
      airlineCode: 'FR',
      departureAt: '2026-07-10T06:25:00Z',
      arrivalAt: '2026-07-10T08:40:00Z',
      cabinClass: 'ECONOMY',
    },
  ],
}

describe('NormalizerService', () => {
  const svc = new NormalizerService()

  it('accepts a fully valid fare', () => {
    const result = svc.normalize(VALID_FARE)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.routeOrigin).toBe('OPO')
      expect(result.data.price).toBe(35)
    }
  })

  it('rejects null input', () => {
    const result = svc.normalize(null)
    expect(result.ok).toBe(false)
  })

  it('rejects input with missing required field (routeOrigin)', () => {
    const { routeOrigin: _, ...rest } = VALID_FARE
    const result = svc.normalize(rest)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('routeOrigin')
    }
  })

  it('rejects fare with negative price', () => {
    const result = svc.normalize({ ...VALID_FARE, price: -10 })
    expect(result.ok).toBe(false)
  })

  it('rejects fare with invalid status', () => {
    const result = svc.normalize({ ...VALID_FARE, status: 'BOGUS_STATUS' })
    expect(result.ok).toBe(false)
  })

  it('defaults currency to EUR when missing', () => {
    const { currency: _, ...rest } = VALID_FARE
    const result = svc.normalize(rest)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.currency).toBe('EUR')
    }
  })

  it('defaults status to UNVERIFIED when missing', () => {
    const { status: _, ...rest } = VALID_FARE
    const result = svc.normalize(rest)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.status).toBe('UNVERIFIED')
    }
  })

  it('defaults fetchedAt to now when missing', () => {
    const { fetchedAt: _, ...rest } = VALID_FARE
    const before = Date.now()
    const result = svc.normalize(rest)
    const after = Date.now()
    expect(result.ok).toBe(true)
    if (result.ok) {
      const ts = new Date(result.data.fetchedAt).getTime()
      expect(ts).toBeGreaterThanOrEqual(before)
      expect(ts).toBeLessThanOrEqual(after)
    }
  })

  it('computes resultHash when missing', () => {
    const { resultHash: _, ...rest } = VALID_FARE
    const result = svc.normalize(rest)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.resultHash).toHaveLength(32)
      expect(result.data.resultHash).toMatch(/^[0-9a-f]{32}$/)
    }
  })

  it('keeps existing resultHash when valid', () => {
    const existingHash = 'b'.repeat(32)
    const result = svc.normalize({ ...VALID_FARE, resultHash: existingHash })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.resultHash).toBe(existingHash)
    }
  })

  describe('normalizeMany', () => {
    it('separates valid from invalid', () => {
      const raws = [
        VALID_FARE,
        { ...VALID_FARE, id: 'fare-2', resultHash: 'c'.repeat(32) },
        null,
        { ...VALID_FARE, price: -1 },
      ]
      const { valid, errors } = svc.normalizeMany(raws)
      expect(valid).toHaveLength(2)
      expect(errors).toHaveLength(2)
    })

    it('returns empty arrays for empty input', () => {
      const { valid, errors } = svc.normalizeMany([])
      expect(valid).toHaveLength(0)
      expect(errors).toHaveLength(0)
    })
  })
})
