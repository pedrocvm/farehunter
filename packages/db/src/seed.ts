import { createHash } from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function fareHash(...parts: string[]): string {
  return createHash('sha256').update(parts.join('::')).digest('hex').slice(0, 32)
}

function dt(iso: string): Date {
  return new Date(iso)
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000)
}

async function seed() {
  console.log('🌱 Seeding FareHunter...')

  // ─── Feature Flags ─────────────────────────────────────────────────────────

  await prisma.featureFlag.createMany({
    data: [
      { key: 'enable_playwright', value: false, description: 'Allow Playwright-based crawling' },
      { key: 'enable_ai_analysis', value: false, description: 'Allow AI fare analysis via Ollama' },
      { key: 'enable_proxy', value: false, description: 'Allow proxy usage in crawlers' },
      { key: 'enable_telegram_notifications', value: false, description: 'Send Telegram alerts' },
      { key: 'enable_real_adapters', value: false, description: 'Enable non-mock adapters' },
    ],
    skipDuplicates: true,
  })

  // ─── Airports ──────────────────────────────────────────────────────────────

  await prisma.airport.createMany({
    data: [
      { iataCode: 'OPO', name: 'Aeroporto Francisco Sá Carneiro', city: 'Porto', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon', latitude: 41.2481, longitude: -8.6814 },
      { iataCode: 'LIS', name: 'Aeroporto Humberto Delgado', city: 'Lisboa', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon', latitude: 38.7813, longitude: -9.1359 },
      { iataCode: 'FAO', name: 'Aeroporto de Faro', city: 'Faro', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon', latitude: 37.0144, longitude: -7.9659 },
      { iataCode: 'VGO', name: 'Aeroporto de Vigo-Peinador', city: 'Vigo', country: 'Espanha', countryCode: 'ES', timezone: 'Europe/Madrid', latitude: 42.2318, longitude: -8.6277 },
      { iataCode: 'SCQ', name: 'Aeroporto de Santiago de Compostela', city: 'Santiago de Compostela', country: 'Espanha', countryCode: 'ES', timezone: 'Europe/Madrid', latitude: 42.8963, longitude: -8.4151 },
      { iataCode: 'CDG', name: 'Aéroport Charles de Gaulle', city: 'Paris', country: 'França', countryCode: 'FR', timezone: 'Europe/Paris', latitude: 49.0097, longitude: 2.5479 },
      { iataCode: 'ORY', name: 'Aéroport d\'Orly', city: 'Paris', country: 'França', countryCode: 'FR', timezone: 'Europe/Paris', latitude: 48.7233, longitude: 2.3794 },
      { iataCode: 'MAD', name: 'Aeropuerto Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Espanha', countryCode: 'ES', timezone: 'Europe/Madrid', latitude: 40.4936, longitude: -3.5668 },
      { iataCode: 'BCN', name: 'Aeropuerto El Prat', city: 'Barcelona', country: 'Espanha', countryCode: 'ES', timezone: 'Europe/Madrid', latitude: 41.2971, longitude: 2.0785 },
      { iataCode: 'FCO', name: 'Aeroporto Leonardo da Vinci', city: 'Roma', country: 'Itália', countryCode: 'IT', timezone: 'Europe/Rome', latitude: 41.8003, longitude: 12.2389 },
      { iataCode: 'MXP', name: 'Aeroporto Malpensa', city: 'Milão', country: 'Itália', countryCode: 'IT', timezone: 'Europe/Rome', latitude: 45.6306, longitude: 8.7281 },
      { iataCode: 'LHR', name: 'London Heathrow Airport', city: 'Londres', country: 'Reino Unido', countryCode: 'GB', timezone: 'Europe/London', latitude: 51.477, longitude: -0.4613 },
      { iataCode: 'LGW', name: 'London Gatwick Airport', city: 'Londres', country: 'Reino Unido', countryCode: 'GB', timezone: 'Europe/London', latitude: 51.1537, longitude: -0.1821 },
      { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdão', country: 'Países Baixos', countryCode: 'NL', timezone: 'Europe/Amsterdam', latitude: 52.3086, longitude: 4.7639 },
      { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Alemanha', countryCode: 'DE', timezone: 'Europe/Berlin', latitude: 50.0379, longitude: 8.5622 },
      { iataCode: 'JFK', name: 'John F. Kennedy International Airport', city: 'Nova York', country: 'Estados Unidos', countryCode: 'US', timezone: 'America/New_York', latitude: 40.6413, longitude: -73.7781 },
      { iataCode: 'GRU', name: 'Aeroporto Internacional de Guarulhos', city: 'São Paulo', country: 'Brasil', countryCode: 'BR', timezone: 'America/Sao_Paulo', latitude: -23.4356, longitude: -46.4731 },
      { iataCode: 'GIG', name: 'Aeroporto Internacional Tom Jobim', city: 'Rio de Janeiro', country: 'Brasil', countryCode: 'BR', timezone: 'America/Sao_Paulo', latitude: -22.8099, longitude: -43.2505 },
    ],
    skipDuplicates: true,
  })

  // ─── Airlines ──────────────────────────────────────────────────────────────

  await prisma.airline.createMany({
    data: [
      { iataCode: 'TP', name: 'TAP Air Portugal', country: 'Portugal', isLowCost: false, hasFreeBag: true },
      { iataCode: 'FR', name: 'Ryanair', country: 'Irlanda', isLowCost: true, hasFreeBag: false },
      { iataCode: 'U2', name: 'easyJet', country: 'Reino Unido', isLowCost: true, hasFreeBag: false },
      { iataCode: 'IB', name: 'Iberia', country: 'Espanha', isLowCost: false, hasFreeBag: true },
      { iataCode: 'VY', name: 'Vueling', country: 'Espanha', isLowCost: true, hasFreeBag: false },
      { iataCode: 'UX', name: 'Air Europa', country: 'Espanha', isLowCost: false, hasFreeBag: true },
      { iataCode: 'HV', name: 'Transavia', country: 'Países Baixos', isLowCost: true, hasFreeBag: false },
      { iataCode: 'LH', name: 'Lufthansa', country: 'Alemanha', isLowCost: false, hasFreeBag: true },
      { iataCode: 'KL', name: 'KLM', country: 'Países Baixos', isLowCost: false, hasFreeBag: true },
      { iataCode: 'AF', name: 'Air France', country: 'França', isLowCost: false, hasFreeBag: true },
      { iataCode: 'BA', name: 'British Airways', country: 'Reino Unido', isLowCost: false, hasFreeBag: true },
      { iataCode: 'W6', name: 'Wizz Air', country: 'Hungria', isLowCost: true, hasFreeBag: false },
      { iataCode: 'TK', name: 'Turkish Airlines', country: 'Turquia', isLowCost: false, hasFreeBag: true },
      { iataCode: 'EK', name: 'Emirates', country: 'Emirados Árabes', isLowCost: false, hasFreeBag: true },
      { iataCode: 'QR', name: 'Qatar Airways', country: 'Qatar', isLowCost: false, hasFreeBag: true },
      { iataCode: 'LA', name: 'LATAM Airlines', country: 'Chile', isLowCost: false, hasFreeBag: true },
      { iataCode: 'AD', name: 'Azul Linhas Aéreas', country: 'Brasil', isLowCost: false, hasFreeBag: true },
      { iataCode: 'G3', name: 'Gol Linhas Aéreas', country: 'Brasil', isLowCost: true, hasFreeBag: false },
    ],
    skipDuplicates: true,
  })

  // ─── Source Adapter ────────────────────────────────────────────────────────

  const mockAdapter = await prisma.sourceAdapter.upsert({
    where: { name: 'mock' },
    create: {
      name: 'mock',
      displayName: 'Mock Adapter',
      status: 'MOCK',
      accessStatus: 'ALLOWED',
      requiresLogin: false,
      requiresProxy: false,
      usesPlaywright: false,
      isActive: true,
      notes: 'Adapter de desenvolvimento com dados mockados. Sem scraping real.',
    },
    update: {},
  })

  await prisma.sourceComplianceRecord.create({
    data: {
      adapterId: mockAdapter.id,
      scrapingAllowed: true,
      notes: 'Adapter mock — sem acesso real a fontes externas. Compliance N/A.',
    },
  })

  // ─── Routes ────────────────────────────────────────────────────────────────

  const routePairs = [
    ['OPO', 'CDG'],
    ['OPO', 'MAD'],
    ['OPO', 'LHR'],
    ['OPO', 'BCN'],
    ['OPO', 'FRA'],
    ['LIS', 'GRU'],
    ['LIS', 'JFK'],
    ['VGO', 'CDG'],
  ] as const

  const routes: Record<string, string> = {}

  for (const [origin, dest] of routePairs) {
    const route = await prisma.route.upsert({
      where: { originCode_destinationCode: { originCode: origin, destinationCode: dest } },
      create: { originCode: origin, destinationCode: dest, priority: origin === 'OPO' ? 10 : 5 },
      update: {},
    })
    routes[`${origin}-${dest}`] = route.id
  }

  // ─── User Demo ─────────────────────────────────────────────────────────────

  const user = await prisma.user.upsert({
    where: { email: 'pedro@farehunter.local' },
    create: {
      name: 'Pedro',
      email: 'pedro@farehunter.local',
      timezone: 'Europe/Lisbon',
      currency: 'EUR',
    },
    update: {},
  })

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      defaultOriginAirport: 'OPO',
      maxStops: 1,
      preferDirectFlights: false,
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      minTripDays: 3,
      maxTripDays: 14,
      adults: 1,
      children: 0,
      infants: 0,
      includedAirlines: [],
      excludedAirlines: [],
      excludedAirports: [],
      notifyOnExpiry: true,
      minAlertScore: 65.0,
    },
    update: {},
  })

  // ─── Scan Budget (zero-cost mode) ──────────────────────────────────────────

  await prisma.scanBudget.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      name: 'zero-cost-conservador',
      maxJobsPerDay: 50,
      maxPlaywrightPerDay: 0,
      maxAiCallsPerDay: 0,
      maxProxyRequestsPerDay: 0,
    },
    update: {},
  })

  // ─── Watchlists ────────────────────────────────────────────────────────────

  const watchEuropa = await prisma.watchlist.create({
    data: {
      userId: user.id,
      name: 'Europa Barata',
      originCode: 'OPO',
    },
  })

  const watchBrasil = await prisma.watchlist.create({
    data: {
      userId: user.id,
      name: 'Brasil Abaixo de 500€',
      originCode: 'LIS',
    },
  })

  const watchExecutiva = await prisma.watchlist.create({
    data: {
      userId: user.id,
      name: 'Executiva Barata',
      originCode: 'LIS',
    },
  })

  const watchWeekend = await prisma.watchlist.create({
    data: {
      userId: user.id,
      name: 'Fim de Semana Barato',
      originCode: 'OPO',
    },
  })

  // ─── Price Targets ─────────────────────────────────────────────────────────

  await prisma.priceTarget.createMany({
    data: [
      {
        userId: user.id,
        watchlistId: watchEuropa.id,
        originCode: 'OPO',
        destinationCode: 'CDG',
        cabinClass: 'ECONOMY',
        maxPrice: 90,
        currency: 'EUR',
        minTripDays: 3,
        maxTripDays: 10,
      },
      {
        userId: user.id,
        watchlistId: watchEuropa.id,
        originCode: 'OPO',
        destinationCode: 'BCN',
        cabinClass: 'ECONOMY',
        maxPrice: 60,
        currency: 'EUR',
        minTripDays: 2,
        maxTripDays: 7,
      },
      {
        userId: user.id,
        watchlistId: watchBrasil.id,
        originCode: 'LIS',
        destinationCode: 'GRU',
        cabinClass: 'ECONOMY',
        maxPrice: 500,
        currency: 'EUR',
        minTripDays: 7,
        maxTripDays: 21,
      },
      {
        userId: user.id,
        watchlistId: watchExecutiva.id,
        originCode: 'LIS',
        destinationCode: 'JFK',
        cabinClass: 'BUSINESS',
        maxPrice: 900,
        currency: 'EUR',
        minTripDays: 5,
        maxTripDays: 14,
      },
      {
        userId: user.id,
        watchlistId: watchWeekend.id,
        originCode: 'OPO',
        destinationCode: 'MAD',
        cabinClass: 'ECONOMY',
        maxPrice: 70,
        currency: 'EUR',
        minTripDays: 2,
        maxTripDays: 4,
      },
    ],
  })

  // ─── Notification Rules ────────────────────────────────────────────────────

  await prisma.notificationRule.createMany({
    data: [
      {
        userId: user.id,
        watchlistId: watchEuropa.id,
        name: 'Europa — Alerta Forte',
        minAlertLevel: 'STRONG',
        minScore: 70,
        channels: ['console'],
      },
      {
        userId: user.id,
        watchlistId: watchBrasil.id,
        name: 'Brasil — Qualquer Alerta',
        minAlertLevel: 'NORMAL',
        minScore: 50,
        channels: ['console'],
      },
      {
        userId: user.id,
        watchlistId: watchExecutiva.id,
        name: 'Executiva Barata — Excelente',
        minAlertLevel: 'EXCELLENT',
        minScore: 80,
        channels: ['console'],
      },
    ],
  })

  // ─── Search Jobs ───────────────────────────────────────────────────────────

  const jobOpoCdg = await prisma.searchJob.create({
    data: {
      routeId: routes['OPO-CDG']!,
      adapterId: mockAdapter.id,
      status: 'COMPLETED',
      departureDateMin: dt('2026-07-01T00:00:00Z'),
      departureDateMax: dt('2026-07-31T00:00:00Z'),
      returnDateMin: dt('2026-07-07T00:00:00Z'),
      returnDateMax: dt('2026-08-07T00:00:00Z'),
      priority: 10,
      attempts: 1,
      startedAt: new Date(Date.now() - 60000),
      completedAt: new Date(),
      resultsFound: 1,
    },
  })

  const jobOpoMad = await prisma.searchJob.create({
    data: {
      routeId: routes['OPO-MAD']!,
      adapterId: mockAdapter.id,
      status: 'COMPLETED',
      departureDateMin: dt('2026-06-01T00:00:00Z'),
      departureDateMax: dt('2026-06-30T00:00:00Z'),
      priority: 8,
      attempts: 1,
      startedAt: new Date(Date.now() - 120000),
      completedAt: new Date(),
      resultsFound: 2,
    },
  })

  const jobOpoLhr = await prisma.searchJob.create({
    data: {
      routeId: routes['OPO-LHR']!,
      adapterId: mockAdapter.id,
      status: 'COMPLETED',
      departureDateMin: dt('2026-08-01T00:00:00Z'),
      departureDateMax: dt('2026-08-31T00:00:00Z'),
      priority: 5,
      attempts: 1,
      startedAt: new Date(Date.now() - 180000),
      completedAt: new Date(),
      resultsFound: 1,
    },
  })

  const jobLisGru = await prisma.searchJob.create({
    data: {
      routeId: routes['LIS-GRU']!,
      adapterId: mockAdapter.id,
      status: 'COMPLETED',
      departureDateMin: dt('2026-08-01T00:00:00Z'),
      departureDateMax: dt('2026-09-30T00:00:00Z'),
      priority: 6,
      attempts: 1,
      startedAt: new Date(Date.now() - 240000),
      completedAt: new Date(),
      resultsFound: 1,
    },
  })

  const jobOpoBcn = await prisma.searchJob.create({
    data: {
      routeId: routes['OPO-BCN']!,
      adapterId: mockAdapter.id,
      status: 'COMPLETED',
      departureDateMin: dt('2026-06-01T00:00:00Z'),
      departureDateMax: dt('2026-06-30T00:00:00Z'),
      priority: 7,
      attempts: 1,
      startedAt: new Date(Date.now() - 300000),
      completedAt: new Date(),
      resultsFound: 2,
    },
  })

  const jobLisJfk = await prisma.searchJob.create({
    data: {
      routeId: routes['LIS-JFK']!,
      adapterId: mockAdapter.id,
      status: 'COMPLETED',
      cabinClass: 'BUSINESS',
      departureDateMin: dt('2026-09-01T00:00:00Z'),
      departureDateMax: dt('2026-09-30T00:00:00Z'),
      priority: 9,
      attempts: 1,
      startedAt: new Date(Date.now() - 360000),
      completedAt: new Date(),
      resultsFound: 1,
    },
  })

  const jobVgoCdg = await prisma.searchJob.create({
    data: {
      routeId: routes['VGO-CDG']!,
      adapterId: mockAdapter.id,
      status: 'COMPLETED',
      departureDateMin: dt('2026-07-01T00:00:00Z'),
      departureDateMax: dt('2026-07-31T00:00:00Z'),
      priority: 4,
      attempts: 1,
      startedAt: new Date(Date.now() - 420000),
      completedAt: new Date(),
      resultsFound: 1,
    },
  })

  const jobOpoFra = await prisma.searchJob.create({
    data: {
      routeId: routes['OPO-FRA']!,
      adapterId: mockAdapter.id,
      status: 'COMPLETED',
      departureDateMin: dt('2026-07-01T00:00:00Z'),
      departureDateMax: dt('2026-07-31T00:00:00Z'),
      priority: 4,
      attempts: 1,
      startedAt: new Date(Date.now() - 480000),
      completedAt: new Date(),
      resultsFound: 1,
    },
  })

  // ─── Fare Results ──────────────────────────────────────────────────────────
  // 1. OPO→CDG — EXCELLENT: Ryanair direto, 35€

  const fare1 = await prisma.fareResult.create({
    data: {
      routeId: routes['OPO-CDG']!,
      jobId: jobOpoCdg.id,
      airlineCode: 'FR',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: dt('2026-07-10T06:25:00Z'),
      returnAt: dt('2026-07-17T14:30:00Z'),
      durationMinutes: 135,
      stops: 0,
      price: 35,
      currency: 'EUR',
      priceEur: 35,
      taxes: 20,
      fees: 5,
      includedBagKg: 0,
      status: 'ACTIVE',
      alertLevel: 'EXCELLENT',
      resultHash: fareHash('OPO', 'CDG', '2026-07-10T06:25:00Z', 'FR', '35'),
      source: 'mock',
      expiresAt: addHours(new Date(), 24),
      opportunityScore: 92,
      confidenceScore: 85,
      personalFitScore: 88,
      expiryRiskScore: 62,
      travelFriction: 10,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare1.id,
        sequence: 0,
        originCode: 'OPO',
        destinationCode: 'CDG',
        airlineCode: 'FR',
        flightNumber: 'FR8234',
        departureAt: dt('2026-07-10T06:25:00Z'),
        arrivalAt: dt('2026-07-10T08:40:00Z'),
        durationMinutes: 135,
        cabinClass: 'ECONOMY',
        aircraft: 'Boeing 737-800',
      },
    ],
  })

  // 2. OPO→MAD — STRONG: Vueling direto, 45€

  const fare2 = await prisma.fareResult.create({
    data: {
      routeId: routes['OPO-MAD']!,
      jobId: jobOpoMad.id,
      airlineCode: 'VY',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: dt('2026-06-15T07:10:00Z'),
      returnAt: dt('2026-06-18T21:45:00Z'),
      durationMinutes: 75,
      stops: 0,
      price: 45,
      currency: 'EUR',
      priceEur: 45,
      taxes: 20,
      fees: 5,
      includedBagKg: 0,
      status: 'ACTIVE',
      alertLevel: 'STRONG',
      resultHash: fareHash('OPO', 'MAD', '2026-06-15T07:10:00Z', 'VY', '45'),
      source: 'mock',
      expiresAt: addHours(new Date(), 48),
      opportunityScore: 78,
      confidenceScore: 88,
      personalFitScore: 80,
      expiryRiskScore: 30,
      travelFriction: 8,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare2.id,
        sequence: 0,
        originCode: 'OPO',
        destinationCode: 'MAD',
        airlineCode: 'VY',
        flightNumber: 'VY1401',
        departureAt: dt('2026-06-15T07:10:00Z'),
        arrivalAt: dt('2026-06-15T08:25:00Z'),
        durationMinutes: 75,
        cabinClass: 'ECONOMY',
        aircraft: 'Airbus A319',
      },
    ],
  })

  // 3. OPO→LHR — NORMAL (oferta ruim): BA 1 escala via LIS, 280€

  const fare3 = await prisma.fareResult.create({
    data: {
      routeId: routes['OPO-LHR']!,
      jobId: jobOpoLhr.id,
      airlineCode: 'BA',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: dt('2026-08-05T08:00:00Z'),
      returnAt: dt('2026-08-12T19:30:00Z'),
      durationMinutes: 240,
      layoverMinutes: 75,
      stops: 1,
      price: 280,
      currency: 'EUR',
      priceEur: 280,
      taxes: 90,
      fees: 20,
      includedBagKg: 23,
      status: 'ACTIVE',
      alertLevel: 'NORMAL',
      resultHash: fareHash('OPO', 'LHR', '2026-08-05T08:00:00Z', 'BA', '280'),
      source: 'mock',
      expiresAt: addHours(new Date(), 72),
      opportunityScore: 35,
      confidenceScore: 90,
      personalFitScore: 45,
      expiryRiskScore: 15,
      travelFriction: 28,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare3.id,
        sequence: 0,
        originCode: 'OPO',
        destinationCode: 'LIS',
        airlineCode: 'TP',
        flightNumber: 'TP760',
        departureAt: dt('2026-08-05T08:00:00Z'),
        arrivalAt: dt('2026-08-05T09:00:00Z'),
        durationMinutes: 60,
        cabinClass: 'ECONOMY',
        aircraft: 'Embraer E190',
      },
      {
        fareId: fare3.id,
        sequence: 1,
        originCode: 'LIS',
        destinationCode: 'LHR',
        airlineCode: 'BA',
        flightNumber: 'BA501',
        departureAt: dt('2026-08-05T10:15:00Z'),
        arrivalAt: dt('2026-08-05T11:30:00Z'),
        durationMinutes: 135,
        cabinClass: 'ECONOMY',
        aircraft: 'Airbus A320',
      },
    ],
  })

  // 4. LIS→GRU — LOW_CONFIDENCE: TAP direto, 480€

  const fare4 = await prisma.fareResult.create({
    data: {
      routeId: routes['LIS-GRU']!,
      jobId: jobLisGru.id,
      airlineCode: 'TP',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: dt('2026-08-20T22:30:00Z'),
      returnAt: dt('2026-09-03T16:45:00Z'),
      durationMinutes: 660,
      stops: 0,
      price: 480,
      currency: 'EUR',
      priceEur: 480,
      taxes: 120,
      fees: 30,
      includedBagKg: 23,
      status: 'LOW_CONFIDENCE',
      alertLevel: 'NORMAL',
      resultHash: fareHash('LIS', 'GRU', '2026-08-20T22:30:00Z', 'TP', '480'),
      source: 'mock',
      expiresAt: addHours(new Date(), 6),
      opportunityScore: 65,
      confidenceScore: 30,
      personalFitScore: 55,
      expiryRiskScore: 85,
      travelFriction: 20,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare4.id,
        sequence: 0,
        originCode: 'LIS',
        destinationCode: 'GRU',
        airlineCode: 'TP',
        flightNumber: 'TP089',
        departureAt: dt('2026-08-20T22:30:00Z'),
        arrivalAt: dt('2026-08-21T03:30:00Z'),
        durationMinutes: 660,
        cabinClass: 'ECONOMY',
        aircraft: 'Airbus A330-900',
      },
    ],
  })

  // 5. OPO→BCN — EXPIRED: Ryanair direto, 29€

  const fare5 = await prisma.fareResult.create({
    data: {
      routeId: routes['OPO-BCN']!,
      jobId: jobOpoBcn.id,
      airlineCode: 'FR',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: dt('2026-06-01T06:00:00Z'),
      returnAt: dt('2026-06-04T21:00:00Z'),
      durationMinutes: 105,
      stops: 0,
      price: 29,
      currency: 'EUR',
      priceEur: 29,
      taxes: 16,
      fees: 3,
      includedBagKg: 0,
      status: 'EXPIRED',
      alertLevel: 'NORMAL',
      resultHash: fareHash('OPO', 'BCN', '2026-06-01T06:00:00Z', 'FR', '29'),
      source: 'mock',
      expiresAt: addHours(new Date(), -48),
      opportunityScore: null,
      confidenceScore: null,
      personalFitScore: null,
      expiryRiskScore: null,
      travelFriction: null,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare5.id,
        sequence: 0,
        originCode: 'OPO',
        destinationCode: 'BCN',
        airlineCode: 'FR',
        flightNumber: 'FR1844',
        departureAt: dt('2026-06-01T06:00:00Z'),
        arrivalAt: dt('2026-06-01T07:45:00Z'),
        durationMinutes: 105,
        cabinClass: 'ECONOMY',
      },
    ],
  })

  // 6. LIS→JFK — EXCELLENT (executiva): TAP business, 1200€

  const fare6 = await prisma.fareResult.create({
    data: {
      routeId: routes['LIS-JFK']!,
      jobId: jobLisJfk.id,
      airlineCode: 'TP',
      cabinClass: 'BUSINESS',
      tripType: 'ROUND_TRIP',
      departureAt: dt('2026-09-15T10:00:00Z'),
      returnAt: dt('2026-09-29T18:30:00Z'),
      durationMinutes: 420,
      stops: 0,
      price: 1200,
      currency: 'EUR',
      priceEur: 1200,
      taxes: 280,
      fees: 50,
      includedBagKg: 32,
      status: 'ACTIVE',
      alertLevel: 'EXCELLENT',
      resultHash: fareHash('LIS', 'JFK', '2026-09-15T10:00:00Z', 'TP', '1200'),
      source: 'mock',
      expiresAt: addHours(new Date(), 36),
      opportunityScore: 88,
      confidenceScore: 75,
      personalFitScore: 70,
      expiryRiskScore: 45,
      travelFriction: 12,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare6.id,
        sequence: 0,
        originCode: 'LIS',
        destinationCode: 'JFK',
        airlineCode: 'TP',
        flightNumber: 'TP201',
        departureAt: dt('2026-09-15T10:00:00Z'),
        arrivalAt: dt('2026-09-15T17:00:00Z'),
        durationMinutes: 420,
        cabinClass: 'BUSINESS',
        aircraft: 'Airbus A330-900',
      },
    ],
  })

  // 7. VGO→CDG — STRONG (aeroporto alternativo): Ryanair direto, 38€

  const fare7 = await prisma.fareResult.create({
    data: {
      routeId: routes['VGO-CDG']!,
      jobId: jobVgoCdg.id,
      airlineCode: 'FR',
      cabinClass: 'ECONOMY',
      tripType: 'ONE_WAY',
      departureAt: dt('2026-07-12T07:00:00Z'),
      durationMinutes: 140,
      stops: 0,
      price: 38,
      currency: 'EUR',
      priceEur: 38,
      taxes: 22,
      fees: 6,
      includedBagKg: 0,
      status: 'ACTIVE',
      alertLevel: 'STRONG',
      resultHash: fareHash('VGO', 'CDG', '2026-07-12T07:00:00Z', 'FR', '38'),
      source: 'mock',
      expiresAt: addHours(new Date(), 30),
      opportunityScore: 76,
      confidenceScore: 82,
      personalFitScore: 60,
      expiryRiskScore: 38,
      travelFriction: 32,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare7.id,
        sequence: 0,
        originCode: 'VGO',
        destinationCode: 'CDG',
        airlineCode: 'FR',
        flightNumber: 'FR9221',
        departureAt: dt('2026-07-12T07:00:00Z'),
        arrivalAt: dt('2026-07-12T09:20:00Z'),
        durationMinutes: 140,
        cabinClass: 'ECONOMY',
      },
    ],
  })

  // 8. OPO→FRA — NORMAL (fricção alta, 2 escalas longas): Ryanair, 89€

  const fare8 = await prisma.fareResult.create({
    data: {
      routeId: routes['OPO-FRA']!,
      jobId: jobOpoFra.id,
      airlineCode: 'FR',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: dt('2026-07-20T05:30:00Z'),
      returnAt: dt('2026-07-27T22:00:00Z'),
      durationMinutes: 540,
      layoverMinutes: 300,
      stops: 2,
      price: 89,
      currency: 'EUR',
      priceEur: 89,
      taxes: 30,
      fees: 9,
      includedBagKg: 0,
      status: 'ACTIVE',
      alertLevel: 'NORMAL',
      resultHash: fareHash('OPO', 'FRA', '2026-07-20T05:30:00Z', 'FR', '89'),
      source: 'mock',
      expiresAt: addHours(new Date(), 60),
      opportunityScore: 55,
      confidenceScore: 80,
      personalFitScore: 38,
      expiryRiskScore: 18,
      travelFriction: 72,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare8.id,
        sequence: 0,
        originCode: 'OPO',
        destinationCode: 'MAD',
        airlineCode: 'FR',
        flightNumber: 'FR4411',
        departureAt: dt('2026-07-20T05:30:00Z'),
        arrivalAt: dt('2026-07-20T07:15:00Z'),
        durationMinutes: 105,
        cabinClass: 'ECONOMY',
      },
      {
        fareId: fare8.id,
        sequence: 1,
        originCode: 'MAD',
        destinationCode: 'BCN',
        airlineCode: 'FR',
        flightNumber: 'FR3322',
        departureAt: dt('2026-07-20T11:00:00Z'),
        arrivalAt: dt('2026-07-20T12:10:00Z'),
        durationMinutes: 70,
        cabinClass: 'ECONOMY',
      },
      {
        fareId: fare8.id,
        sequence: 2,
        originCode: 'BCN',
        destinationCode: 'FRA',
        airlineCode: 'FR',
        flightNumber: 'FR7711',
        departureAt: dt('2026-07-20T14:30:00Z'),
        arrivalAt: dt('2026-07-20T16:30:00Z'),
        durationMinutes: 120,
        cabinClass: 'ECONOMY',
      },
    ],
  })

  // 9. OPO→BCN — NORMAL (sem bagagem): Ryanair, 19€

  const fare9 = await prisma.fareResult.create({
    data: {
      routeId: routes['OPO-BCN']!,
      jobId: jobOpoBcn.id,
      airlineCode: 'FR',
      cabinClass: 'ECONOMY',
      tripType: 'ONE_WAY',
      departureAt: dt('2026-06-28T06:30:00Z'),
      durationMinutes: 105,
      stops: 0,
      price: 19,
      currency: 'EUR',
      priceEur: 19,
      taxes: 12,
      fees: 2,
      includedBagKg: 0,
      status: 'ACTIVE',
      alertLevel: 'NORMAL',
      resultHash: fareHash('OPO', 'BCN', '2026-06-28T06:30:00Z', 'FR', '19'),
      source: 'mock',
      expiresAt: addHours(new Date(), 18),
      opportunityScore: 60,
      confidenceScore: 70,
      personalFitScore: 50,
      expiryRiskScore: 68,
      travelFriction: 12,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare9.id,
        sequence: 0,
        originCode: 'OPO',
        destinationCode: 'BCN',
        airlineCode: 'FR',
        flightNumber: 'FR1845',
        departureAt: dt('2026-06-28T06:30:00Z'),
        arrivalAt: dt('2026-06-28T08:15:00Z'),
        durationMinutes: 105,
        cabinClass: 'ECONOMY',
      },
    ],
  })

  // 10. OPO→MAD — NEEDS_REVIEW (possível erro tarifário): Vueling, 8€

  const fare10 = await prisma.fareResult.create({
    data: {
      routeId: routes['OPO-MAD']!,
      jobId: jobOpoMad.id,
      airlineCode: 'VY',
      cabinClass: 'ECONOMY',
      tripType: 'ROUND_TRIP',
      departureAt: dt('2026-07-05T07:10:00Z'),
      returnAt: dt('2026-07-08T21:45:00Z'),
      durationMinutes: 75,
      stops: 0,
      price: 8,
      currency: 'EUR',
      priceEur: 8,
      taxes: 5,
      fees: 3,
      includedBagKg: 0,
      status: 'NEEDS_REVIEW',
      alertLevel: 'RARE',
      resultHash: fareHash('OPO', 'MAD', '2026-07-05T07:10:00Z', 'VY', '8'),
      source: 'mock',
      expiresAt: addHours(new Date(), 3),
      opportunityScore: null,
      confidenceScore: 15,
      personalFitScore: null,
      expiryRiskScore: 95,
      travelFriction: 8,
    },
  })

  await prisma.fareSegment.createMany({
    data: [
      {
        fareId: fare10.id,
        sequence: 0,
        originCode: 'OPO',
        destinationCode: 'MAD',
        airlineCode: 'VY',
        flightNumber: 'VY1401',
        departureAt: dt('2026-07-05T07:10:00Z'),
        arrivalAt: dt('2026-07-05T08:25:00Z'),
        durationMinutes: 75,
        cabinClass: 'ECONOMY',
      },
    ],
  })

  // ─── Fare Snapshots ────────────────────────────────────────────────────────

  const snapshotData = [
    { fareId: fare1.id, price: 49, status: 'ACTIVE' as const },
    { fareId: fare1.id, price: 39, status: 'ACTIVE' as const },
    { fareId: fare1.id, price: 35, status: 'ACTIVE' as const },
    { fareId: fare2.id, price: 55, status: 'ACTIVE' as const },
    { fareId: fare2.id, price: 45, status: 'ACTIVE' as const },
    { fareId: fare4.id, price: 520, status: 'ACTIVE' as const },
    { fareId: fare4.id, price: 480, status: 'LOW_CONFIDENCE' as const },
    { fareId: fare5.id, price: 29, status: 'ACTIVE' as const },
    { fareId: fare5.id, price: 29, status: 'EXPIRED' as const },
    { fareId: fare10.id, price: 8, status: 'NEEDS_REVIEW' as const },
  ]

  for (let i = 0; i < snapshotData.length; i++) {
    const s = snapshotData[i]!
    await prisma.fareSnapshot.create({
      data: {
        fareId: s.fareId,
        price: s.price,
        currency: 'EUR',
        status: s.status,
        recordedAt: new Date(Date.now() - (snapshotData.length - i) * 3_600_000),
      },
    })
  }

  // ─── Price History ─────────────────────────────────────────────────────────

  await prisma.priceHistory.createMany({
    data: [
      { routeId: routes['OPO-CDG']!, fareId: fare1.id, price: 35, currency: 'EUR', departureMonth: '2026-07', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-CDG']!, price: 89, currency: 'EUR', departureMonth: '2026-07', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-CDG']!, price: 112, currency: 'EUR', departureMonth: '2026-08', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-MAD']!, fareId: fare2.id, price: 45, currency: 'EUR', departureMonth: '2026-06', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-MAD']!, price: 78, currency: 'EUR', departureMonth: '2026-06', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-MAD']!, price: 92, currency: 'EUR', departureMonth: '2026-07', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-LHR']!, fareId: fare3.id, price: 280, currency: 'EUR', departureMonth: '2026-08', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-LHR']!, price: 310, currency: 'EUR', departureMonth: '2026-07', cabinClass: 'ECONOMY' },
      { routeId: routes['LIS-GRU']!, fareId: fare4.id, price: 480, currency: 'EUR', departureMonth: '2026-08', cabinClass: 'ECONOMY' },
      { routeId: routes['LIS-GRU']!, price: 620, currency: 'EUR', departureMonth: '2026-07', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-BCN']!, fareId: fare5.id, price: 29, currency: 'EUR', departureMonth: '2026-06', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-BCN']!, price: 55, currency: 'EUR', departureMonth: '2026-06', cabinClass: 'ECONOMY' },
      { routeId: routes['LIS-JFK']!, fareId: fare6.id, price: 1200, currency: 'EUR', departureMonth: '2026-09', cabinClass: 'BUSINESS' },
      { routeId: routes['LIS-JFK']!, price: 2100, currency: 'EUR', departureMonth: '2026-08', cabinClass: 'BUSINESS' },
      { routeId: routes['VGO-CDG']!, fareId: fare7.id, price: 38, currency: 'EUR', departureMonth: '2026-07', cabinClass: 'ECONOMY' },
      { routeId: routes['OPO-FRA']!, fareId: fare8.id, price: 89, currency: 'EUR', departureMonth: '2026-07', cabinClass: 'ECONOMY' },
    ],
  })

  // ─── User Favorites & Feedback ─────────────────────────────────────────────

  await prisma.userFavorite.create({
    data: { userId: user.id, fareId: fare1.id, note: 'Incrível! Quero ir a Paris.' },
  })

  await prisma.userFavorite.create({
    data: { userId: user.id, fareId: fare6.id, note: 'Executiva barata, possível viagem de aniversário.' },
  })

  await prisma.userFeedback.createMany({
    data: [
      { userId: user.id, fareId: fare3.id, type: 'WEAK_ALERT', note: 'Muito caro para London.' },
      { userId: user.id, fareId: fare8.id, type: 'GOOD_PRICE_BAD_FLIGHT', note: '2 escalas é demais.' },
    ],
  })

  await prisma.silentRejection.createMany({
    data: [
      { fareId: fare5.id, userId: user.id, reason: 'Expirado antes de ser processado.' },
      { fareId: fare10.id, reason: 'Aguardando revisão manual — possível erro tarifário.' },
    ],
  })

  console.log('✅ Seed concluído com sucesso.')
  console.log(`   Aeroportos: 18`)
  console.log(`   Companhias: 18`)
  console.log(`   Rotas: ${Object.keys(routes).length}`)
  console.log(`   Tarifas: 10`)
  console.log(`   Usuário demo: pedro@farehunter.local (OPO)`)

  await prisma.$disconnect()
}

seed().catch((err: unknown) => {
  console.error('Seed falhou:', err)
  process.exit(1)
})
