import { describe, it, expect } from 'vitest'
import { ResultHashService } from './hash.js'
import type { HashParams } from './hash.js'

const BASE: HashParams = {
  origin: 'OPO',
  destination: 'CDG',
  airlineCode: 'FR',
  cabinClass: 'ECONOMY',
  tripType: 'ROUND_TRIP',
  departureAt: '2026-07-10T06:25:00Z',
  returnAt: '2026-07-17T14:30:00Z',
  adults: 1,
  totalPrice: 35,
  source: 'mock',
}

describe('ResultHashService', () => {
  it('returns a 32-character hex string', () => {
    const hash = ResultHashService.compute(BASE)
    expect(hash).toHaveLength(32)
    expect(hash).toMatch(/^[0-9a-f]{32}$/)
  })

  it('is stable for identical inputs', () => {
    expect(ResultHashService.compute(BASE)).toBe(ResultHashService.compute(BASE))
  })

  it('changes when origin changes', () => {
    const other = ResultHashService.compute({ ...BASE, origin: 'LIS' })
    expect(other).not.toBe(ResultHashService.compute(BASE))
  })

  it('changes when destination changes', () => {
    const other = ResultHashService.compute({ ...BASE, destination: 'MAD' })
    expect(other).not.toBe(ResultHashService.compute(BASE))
  })

  it('changes when airline changes', () => {
    const other = ResultHashService.compute({ ...BASE, airlineCode: 'TP' })
    expect(other).not.toBe(ResultHashService.compute(BASE))
  })

  it('changes when price changes', () => {
    const other = ResultHashService.compute({ ...BASE, totalPrice: 36 })
    expect(other).not.toBe(ResultHashService.compute(BASE))
  })

  it('changes when cabin class changes', () => {
    const other = ResultHashService.compute({ ...BASE, cabinClass: 'BUSINESS' })
    expect(other).not.toBe(ResultHashService.compute(BASE))
  })

  it('changes when departure date changes', () => {
    const other = ResultHashService.compute({ ...BASE, departureAt: '2026-07-11T06:25:00Z' })
    expect(other).not.toBe(ResultHashService.compute(BASE))
  })

  it('is identical for same time but different seconds (minute precision)', () => {
    const a = ResultHashService.compute({ ...BASE, departureAt: '2026-07-10T06:25:00Z' })
    const b = ResultHashService.compute({ ...BASE, departureAt: '2026-07-10T06:25:45Z' })
    expect(a).toBe(b)
  })

  it('changes when returnAt changes', () => {
    const withReturn = ResultHashService.compute(BASE)
    const noReturn = ResultHashService.compute({ ...BASE, returnAt: undefined })
    expect(withReturn).not.toBe(noReturn)
  })

  it('is case-insensitive for airport codes', () => {
    const upper = ResultHashService.compute(BASE)
    const lower = ResultHashService.compute({ ...BASE, origin: 'opo', destination: 'cdg' })
    expect(upper).toBe(lower)
  })

  describe('routeKey', () => {
    it('returns a stable string for the same inputs', () => {
      const key = ResultHashService.routeKey({
        origin: 'OPO',
        destination: 'CDG',
        airlineCode: 'FR',
        cabinClass: 'ECONOMY',
        departureAt: '2026-07-10T06:25:00Z',
      })
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })

    it('does NOT change when price changes (price excluded from routeKey)', () => {
      const p1 = ResultHashService.compute({ ...BASE, totalPrice: 35 })
      const p2 = ResultHashService.compute({ ...BASE, totalPrice: 99 })
      // routeKey same, resultHash differs
      expect(p1).not.toBe(p2)

      const rk1 = ResultHashService.routeKey({ origin: 'OPO', destination: 'CDG', airlineCode: 'FR', cabinClass: 'ECONOMY', departureAt: '2026-07-10T06:25:00Z' })
      const rk2 = ResultHashService.routeKey({ origin: 'OPO', destination: 'CDG', airlineCode: 'FR', cabinClass: 'ECONOMY', departureAt: '2026-07-10T06:25:00Z' })
      expect(rk1).toBe(rk2)
    })
  })
})
