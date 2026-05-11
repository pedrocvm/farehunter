import { z } from 'zod'
import type { Flight } from '@farehunter/core'

export const SearchParamsSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().int().positive().default(1),
})

export type SearchParams = z.infer<typeof SearchParamsSchema>

export interface FlightAdapter {
  name: string
  search(params: SearchParams): Promise<Flight[]>
}
