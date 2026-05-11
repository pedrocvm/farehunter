import { createHash } from 'crypto'
import type { CabinClass, TripType } from '../enums.js'

export interface HashParams {
  origin: string
  destination: string
  airlineCode: string
  cabinClass: CabinClass
  tripType: TripType
  departureAt: string
  returnAt?: string
  adults?: number
  totalPrice: number
  source: string
}

function toMinutePrecision(iso: string): string {
  return iso.slice(0, 16)
}

export class ResultHashService {
  static compute(params: HashParams): string {
    const dep = toMinutePrecision(params.departureAt)
    const ret = params.returnAt ? toMinutePrecision(params.returnAt) : ''
    const priceCents = Math.round(params.totalPrice * 100)

    const key = [
      params.origin.toUpperCase(),
      params.destination.toUpperCase(),
      params.airlineCode.toUpperCase(),
      params.cabinClass,
      params.tripType,
      dep,
      ret,
      String(params.adults ?? 1),
      String(priceCents),
      params.source,
    ].join('::')

    return createHash('sha256').update(key).digest('hex').slice(0, 32)
  }

  static routeKey(params: Pick<HashParams, 'origin' | 'destination' | 'airlineCode' | 'cabinClass' | 'departureAt'>): string {
    return [
      params.origin.toUpperCase(),
      params.destination.toUpperCase(),
      params.airlineCode.toUpperCase(),
      params.cabinClass,
      toMinutePrecision(params.departureAt),
    ].join('::')
  }
}
