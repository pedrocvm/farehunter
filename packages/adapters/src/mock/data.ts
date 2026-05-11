export interface RouteProfile {
  origin: string
  destination: string
  distanceKm: number
  durationDirectMin: number
  airlines: string[]
  minPriceEur: number
  avgPriceEur: number
  maxPriceEur: number
  layoverAirport?: string
  altOrigins?: string[]
}

export interface AirlineProfile {
  code: string
  name: string
  isLowCost: boolean
  priceMultiplier: number
  includedBagKg: number
  aircraft: string[]
  typicalHours: number[]
}

export const AIRLINE_PROFILES: Readonly<Record<string, AirlineProfile>> = {
  FR: { code: 'FR', name: 'Ryanair', isLowCost: true, priceMultiplier: 0.62, includedBagKg: 0, aircraft: ['Boeing 737-800', 'Boeing 737 MAX 200'], typicalHours: [6, 20] },
  VY: { code: 'VY', name: 'Vueling', isLowCost: true, priceMultiplier: 0.72, includedBagKg: 0, aircraft: ['Airbus A319', 'Airbus A320'], typicalHours: [7, 13, 19] },
  U2: { code: 'U2', name: 'easyJet', isLowCost: true, priceMultiplier: 0.70, includedBagKg: 0, aircraft: ['Airbus A319', 'Airbus A320'], typicalHours: [7, 14, 20] },
  W6: { code: 'W6', name: 'Wizz Air', isLowCost: true, priceMultiplier: 0.58, includedBagKg: 0, aircraft: ['Airbus A320', 'Airbus A321'], typicalHours: [6, 21] },
  HV: { code: 'HV', name: 'Transavia', isLowCost: true, priceMultiplier: 0.68, includedBagKg: 0, aircraft: ['Boeing 737-700', 'Boeing 737-800'], typicalHours: [8, 18] },
  TP: { code: 'TP', name: 'TAP Air Portugal', isLowCost: false, priceMultiplier: 1.05, includedBagKg: 23, aircraft: ['Airbus A319', 'Airbus A320', 'Airbus A321', 'Airbus A330-900'], typicalHours: [8, 12, 17, 20] },
  IB: { code: 'IB', name: 'Iberia', isLowCost: false, priceMultiplier: 1.08, includedBagKg: 23, aircraft: ['Airbus A319', 'Airbus A320', 'Airbus A330'], typicalHours: [9, 13, 18] },
  UX: { code: 'UX', name: 'Air Europa', isLowCost: false, priceMultiplier: 0.95, includedBagKg: 23, aircraft: ['Boeing 737-800', 'Boeing 787-8'], typicalHours: [9, 16] },
  AF: { code: 'AF', name: 'Air France', isLowCost: false, priceMultiplier: 1.12, includedBagKg: 23, aircraft: ['Airbus A318', 'Airbus A319', 'Airbus A320', 'Airbus A380'], typicalHours: [8, 12, 17] },
  BA: { code: 'BA', name: 'British Airways', isLowCost: false, priceMultiplier: 1.18, includedBagKg: 23, aircraft: ['Airbus A319', 'Airbus A320', 'Boeing 777'], typicalHours: [9, 14, 19] },
  KL: { code: 'KL', name: 'KLM', isLowCost: false, priceMultiplier: 1.10, includedBagKg: 23, aircraft: ['Embraer E175', 'Boeing 737-700', 'Boeing 787-9'], typicalHours: [8, 13, 18] },
  LH: { code: 'LH', name: 'Lufthansa', isLowCost: false, priceMultiplier: 1.15, includedBagKg: 23, aircraft: ['Airbus A319', 'Airbus A320', 'Boeing 747-8'], typicalHours: [9, 14, 19] },
  TK: { code: 'TK', name: 'Turkish Airlines', isLowCost: false, priceMultiplier: 0.88, includedBagKg: 23, aircraft: ['Airbus A321', 'Boeing 737-800', 'Boeing 777-300ER'], typicalHours: [5, 14, 22] },
  LA: { code: 'LA', name: 'LATAM Airlines', isLowCost: false, priceMultiplier: 0.98, includedBagKg: 23, aircraft: ['Boeing 767-300', 'Boeing 787-9'], typicalHours: [22, 23] },
}

export const ROUTE_PROFILES: RouteProfile[] = [
  // ─── Iberia ───────────────────────────────────────────────────────────────
  { origin: 'OPO', destination: 'MAD', distanceKm: 450, durationDirectMin: 75, airlines: ['VY', 'IB', 'FR', 'UX'], minPriceEur: 18, avgPriceEur: 65, maxPriceEur: 220 },
  { origin: 'OPO', destination: 'BCN', distanceKm: 1050, durationDirectMin: 105, airlines: ['VY', 'FR', 'IB'], minPriceEur: 22, avgPriceEur: 75, maxPriceEur: 250 },
  { origin: 'LIS', destination: 'MAD', distanceKm: 625, durationDirectMin: 70, airlines: ['IB', 'VY', 'UX', 'TP'], minPriceEur: 25, avgPriceEur: 70, maxPriceEur: 200 },
  { origin: 'LIS', destination: 'BCN', distanceKm: 1250, durationDirectMin: 95, airlines: ['VY', 'IB', 'TP', 'FR'], minPriceEur: 28, avgPriceEur: 85, maxPriceEur: 260 },
  { origin: 'VGO', destination: 'MAD', distanceKm: 400, durationDirectMin: 55, airlines: ['VY', 'IB'], minPriceEur: 25, avgPriceEur: 70, maxPriceEur: 180 },

  // ─── France ──────────────────────────────────────────────────────────────
  { origin: 'OPO', destination: 'CDG', distanceKm: 1450, durationDirectMin: 130, airlines: ['FR', 'TP', 'AF'], minPriceEur: 22, avgPriceEur: 90, maxPriceEur: 310, altOrigins: ['VGO'] },
  { origin: 'OPO', destination: 'ORY', distanceKm: 1450, durationDirectMin: 130, airlines: ['FR', 'U2', 'VY'], minPriceEur: 20, avgPriceEur: 80, maxPriceEur: 270 },
  { origin: 'LIS', destination: 'CDG', distanceKm: 1800, durationDirectMin: 120, airlines: ['TP', 'AF', 'FR'], minPriceEur: 28, avgPriceEur: 100, maxPriceEur: 320 },
  { origin: 'VGO', destination: 'CDG', distanceKm: 1500, durationDirectMin: 140, airlines: ['FR', 'VY'], minPriceEur: 20, avgPriceEur: 75, maxPriceEur: 240 },

  // ─── UK ─────────────────────────────────────────────────────────────────
  { origin: 'OPO', destination: 'LHR', distanceKm: 1750, durationDirectMin: 150, airlines: ['BA', 'TP', 'FR'], minPriceEur: 65, avgPriceEur: 180, maxPriceEur: 450, layoverAirport: 'LIS' },
  { origin: 'OPO', destination: 'LGW', distanceKm: 1750, durationDirectMin: 145, airlines: ['FR', 'U2', 'BA'], minPriceEur: 35, avgPriceEur: 110, maxPriceEur: 320 },
  { origin: 'LIS', destination: 'LHR', distanceKm: 2200, durationDirectMin: 135, airlines: ['TP', 'BA', 'FR'], minPriceEur: 70, avgPriceEur: 190, maxPriceEur: 480 },

  // ─── Netherlands / Germany ───────────────────────────────────────────────
  { origin: 'OPO', destination: 'AMS', distanceKm: 1900, durationDirectMin: 165, airlines: ['KL', 'FR', 'TP'], minPriceEur: 55, avgPriceEur: 140, maxPriceEur: 380, layoverAirport: 'LIS' },
  { origin: 'OPO', destination: 'FRA', distanceKm: 2100, durationDirectMin: 175, airlines: ['FR', 'LH', 'TP'], minPriceEur: 45, avgPriceEur: 130, maxPriceEur: 350, layoverAirport: 'MAD' },
  { origin: 'LIS', destination: 'FRA', distanceKm: 2400, durationDirectMin: 170, airlines: ['LH', 'TP', 'FR'], minPriceEur: 60, avgPriceEur: 145, maxPriceEur: 390 },
  { origin: 'LIS', destination: 'AMS', distanceKm: 2300, durationDirectMin: 160, airlines: ['KL', 'TP', 'FR'], minPriceEur: 55, avgPriceEur: 135, maxPriceEur: 370 },

  // ─── Long-haul ───────────────────────────────────────────────────────────
  { origin: 'LIS', destination: 'GRU', distanceKm: 9350, durationDirectMin: 660, airlines: ['TP', 'LA'], minPriceEur: 380, avgPriceEur: 650, maxPriceEur: 1100 },
  { origin: 'LIS', destination: 'GIG', distanceKm: 9225, durationDirectMin: 640, airlines: ['TP', 'LA'], minPriceEur: 370, avgPriceEur: 640, maxPriceEur: 1080 },
  { origin: 'LIS', destination: 'JFK', distanceKm: 5450, durationDirectMin: 420, airlines: ['TP', 'TK', 'UX'], minPriceEur: 380, avgPriceEur: 700, maxPriceEur: 1200, layoverAirport: 'MAD' },
  { origin: 'OPO', destination: 'JFK', distanceKm: 5700, durationDirectMin: 450, airlines: ['TP', 'IB', 'TK'], minPriceEur: 420, avgPriceEur: 750, maxPriceEur: 1300, layoverAirport: 'LIS' },
]

export const NEARBY_AIRPORTS: Readonly<Record<string, string[]>> = {
  OPO: ['VGO', 'SCQ'],
  LIS: ['FAO'],
  CDG: ['ORY'],
  LHR: ['LGW'],
  GRU: ['GIG'],
  JFK: [],
}

export const CABIN_MULTIPLIER: Readonly<Record<string, number>> = {
  ECONOMY: 1.0,
  PREMIUM_ECONOMY: 1.85,
  BUSINESS: 4.2,
  FIRST: 8.0,
}

export const SEASON_MULTIPLIER: Readonly<Record<number, number>> = {
  1: 0.82,
  2: 0.80,
  3: 0.90,
  4: 0.95,
  5: 1.00,
  6: 1.18,
  7: 1.30,
  8: 1.28,
  9: 1.05,
  10: 0.95,
  11: 0.82,
  12: 1.12,
}
