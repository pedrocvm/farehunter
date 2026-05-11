import { prisma } from './index.js'

async function seed() {
  console.log('Seeding database...')

  await prisma.flight.createMany({
    data: [
      {
        origin: 'GRU',
        destination: 'LIS',
        departureAt: new Date('2025-08-10T10:00:00Z'),
        returnAt: new Date('2025-08-24T18:00:00Z'),
        price: 1850.0,
        currency: 'BRL',
        airline: 'TAP',
        stops: 0,
        source: 'mock',
        score: 88.5,
      },
      {
        origin: 'GRU',
        destination: 'BCN',
        departureAt: new Date('2025-09-01T08:00:00Z'),
        returnAt: null,
        price: 2100.0,
        currency: 'BRL',
        airline: 'Iberia',
        stops: 1,
        source: 'mock',
        score: 72.0,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seed complete.')
  await prisma.$disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
