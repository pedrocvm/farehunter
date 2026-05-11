import { createHash, randomUUID } from 'crypto'
import { ResultHashService } from '@farehunter/core'
import type { NormalizedFareResult, FareSegment, CabinClass, TripType } from '@farehunter/core'
import {
  ROUTE_PROFILES,
  AIRLINE_PROFILES,
  CABIN_MULTIPLIER,
  SEASON_MULTIPLIER,
  type RouteProfile,
  type AirlineProfile,
} from './data.js'

function seededFloat(seed: string, min: number, max: number): number {
  const hex = createHash('md5').update(seed).digest('hex')
  const n = parseInt(hex.slice(0, 8), 16) / 0xffffffff
  return min + n * (max - min)
}

function seededInt(seed: string, min: number, max: number): number {
  return Math.floor(seededFloat(seed, min, max + 0.999))
}

function seededPick<T>(seed: string, items: T[]): T {
  const idx = seededInt(seed, 0, items.length - 1)
  return items[idx] as T
}

function buildIso(date: string, hour: number, minute = 0): string {
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString().replace('.000Z', 'Z')
}

function getMonth(date: string): number {
  return parseInt(date.slice(5, 7), 10)
}

function computePrice(
  route: RouteProfile,
  airline: AirlineProfile,
  cabinClass: CabinClass,
  date: string,
  adults: number,
  priceSeed: string,
): number {
  const month = getMonth(date)
  const season = SEASON_MULTIPLIER[month] ?? 1.0
  const cabin = CABIN_MULTIPLIER[cabinClass] ?? 1.0
  const variance = seededFloat(priceSeed, 0.88, 1.14)
  const perPerson = route.avgPriceEur * airline.priceMultiplier * season * cabin * variance
  const clamped = Math.max(route.minPriceEur * cabin, Math.min(route.maxPriceEur * cabin, perPerson))
  return Math.round(clamped * adults * 100) / 100
}

function buildSegments(
  origin: string,
  destination: string,
  airlineCode: string,
  cabinClass: CabinClass,
  departureAt: string,
  durationMin: number,
  stops: number,
  layoverAirport: string | undefined,
  aircraft: string,
): FareSegment[] {
  if (stops === 0 || !layoverAirport) {
    const arrivalAt = addMinutes(departureAt, durationMin)
    return [
      {
        sequence: 0,
        originCode: origin,
        destinationCode: destination,
        airlineCode,
        departureAt,
        arrivalAt,
        durationMinutes: durationMin,
        cabinClass,
        aircraft,
      },
    ]
  }

  const leg1Min = Math.round(durationMin * 0.35)
  const layoverMin = 75
  const leg2Min = durationMin - leg1Min

  const arr1 = addMinutes(departureAt, leg1Min)
  const dep2 = addMinutes(arr1, layoverMin)
  const arr2 = addMinutes(dep2, leg2Min)

  return [
    {
      sequence: 0,
      originCode: origin,
      destinationCode: layoverAirport,
      airlineCode,
      departureAt,
      arrivalAt: arr1,
      durationMinutes: leg1Min,
      cabinClass,
      aircraft,
    },
    {
      sequence: 1,
      originCode: layoverAirport,
      destinationCode: destination,
      airlineCode,
      departureAt: dep2,
      arrivalAt: arr2,
      durationMinutes: leg2Min,
      cabinClass,
      aircraft,
    },
  ]
}

export interface GenerateInput {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  cabinClass: CabinClass
  adults: number
  source: string
}

export function generateFares(input: GenerateInput): NormalizedFareResult[] {
  const profile = ROUTE_PROFILES.find(
    (r) => r.origin === input.origin && r.destination === input.destination,
  )
  if (!profile) return []

  const results: NormalizedFareResult[] = []
  const tripType: TripType = input.returnDate ? 'ROUND_TRIP' : 'ONE_WAY'

  for (const airlineCode of profile.airlines) {
    const airline = AIRLINE_PROFILES[airlineCode]
    if (!airline) continue

    const hourSeed = `${input.origin}${input.destination}${airlineCode}`
    const firstHour = airline.typicalHours.at(0) ?? 6
    const lastHour = airline.typicalHours.at(-1) ?? firstHour
    const slots = airline.typicalHours.length >= 2 ? [firstHour, lastHour] : [firstHour]

    for (const hour of slots) {
      const priceSeed = `${input.origin}${input.destination}${airlineCode}${input.departureDate}${String(hour)}`
      const price = computePrice(profile, airline, input.cabinClass, input.departureDate, input.adults, priceSeed)
      const depMin = seededInt(`${hourSeed}${String(hour)}`, 0, 29)
      const departureAt = buildIso(input.departureDate, hour, depMin)

      const actualStops = profile.distanceKm > 3000 && !profile.layoverAirport ? 0
        : profile.layoverAirport && airline.code === 'TP' ? 1
        : 0

      const durationMin = profile.durationDirectMin + actualStops * 90
      const layoverMin = actualStops > 0 ? 75 : undefined

      const aircraft = seededPick(`${airlineCode}${input.departureDate}${String(hour)}`, airline.aircraft)
      const segments = buildSegments(
        input.origin,
        input.destination,
        airlineCode,
        input.cabinClass,
        departureAt,
        durationMin,
        actualStops,
        profile.layoverAirport,
        aircraft,
      )

      const returnAt = input.returnDate
        ? buildIso(input.returnDate, seededInt(`ret${hourSeed}${String(hour)}`, 12, 21), seededInt(`retm${hourSeed}${String(hour)}`, 0, 50))
        : undefined

      const expiryHours = seededInt(`exp${priceSeed}`, 8, 72)
      const expiresAt = new Date(Date.now() + expiryHours * 3_600_000).toISOString()

      const taxes = Math.round(price * seededFloat(`tax${priceSeed}`, 0.20, 0.35) * 100) / 100
      const fees = Math.round(seededFloat(`fee${priceSeed}`, 3, 18) * 100) / 100

      const resultHash = ResultHashService.compute({
        origin: input.origin,
        destination: input.destination,
        airlineCode,
        cabinClass: input.cabinClass,
        tripType,
        departureAt,
        ...(returnAt !== undefined && { returnAt }),
        adults: input.adults,
        totalPrice: price,
        source: input.source,
      })

      const fare: NormalizedFareResult = {
        id: randomUUID(),
        routeOrigin: input.origin,
        routeDestination: input.destination,
        airlineCode,
        cabinClass: input.cabinClass,
        tripType,
        departureAt,
        ...(returnAt !== undefined && { returnAt }),
        durationMinutes: durationMin,
        layoverMinutes: layoverMin,
        stops: actualStops,
        price,
        currency: 'EUR',
        priceBreakdown: {
          base: Math.round((price - taxes - fees) * 100) / 100,
          taxes,
          fees,
          total: price,
          currency: 'EUR',
        },
        includedBagKg: input.cabinClass === 'BUSINESS' || input.cabinClass === 'FIRST'
          ? 32
          : airline.includedBagKg,
        status: 'UNVERIFIED',
        alertLevel: 'NORMAL',
        resultHash,
        source: input.source,
        fetchedAt: new Date().toISOString(),
        expiresAt,
        segments,
      }

      results.push(fare)
    }
  }

  return results.sort((a, b) => a.price - b.price)
}

export function findRouteProfile(origin: string, destination: string): RouteProfile | undefined {
  return ROUTE_PROFILES.find((r) => r.origin === origin && r.destination === destination)
}
