import { z } from 'zod'

// --- Helpers de validação de data ---

const isoDate = z
  .string()
  .min(1, 'Campo obrigatório')
  .refine((v) => !isNaN(Date.parse(v)), { message: 'Data inválida' })

const optionalIsoDate = z
  .string()
  .optional()
  .refine((v) => !v || !isNaN(Date.parse(v)), { message: 'Data inválida' })

const airportCode = z
  .string()
  .min(3, 'Informe ao menos 3 caracteres')
  .max(3, 'Código IATA deve ter 3 letras')
  .regex(/^[A-Z]{3}$/, 'Use o código IATA (ex: GRU)')

const cabinClassEnum = z.enum(['Economy', 'Premium Economy', 'Business', 'First'])
const passengersSchema = z.coerce.number().min(1, 'Mínimo 1 passageiro').max(9, 'Máximo 9 passageiros')

// --- Modo Exato ---
// Origem → destino fixo, datas exatas, volta opcional.

export const exactSchema = z
  .object({
    mode: z.literal('exact'),
    origin: airportCode,
    destination: airportCode,
    departureDate: isoDate,
    returnDate: optionalIsoDate,
    oneWay: z.boolean(),
    cabinClass: cabinClassEnum,
    passengers: passengersSchema,
  })
  .refine((d) => d.origin !== d.destination, {
    message: 'Origem e destino não podem ser iguais',
    path: ['destination'],
  })
  .refine(
    (d) => !d.returnDate || d.returnDate >= d.departureDate,
    {
      message: 'Data de volta deve ser após a data de ida',
      path: ['returnDate'],
    },
  )

// --- Modo Flexível ---
// Janela de datas + duração mínima/máxima da viagem.

export const flexibleSchema = z
  .object({
    mode: z.literal('flexible'),
    origin: airportCode,
    destination: airportCode,
    dateRangeStart: isoDate,
    dateRangeEnd: isoDate,
    minDays: z.coerce.number().min(1, 'Mínimo 1 dia'),
    maxDays: z.coerce.number().min(1, 'Mínimo 1 dia'),
    cabinClass: cabinClassEnum,
    passengers: passengersSchema,
  })
  .refine((d) => d.origin !== d.destination, {
    message: 'Origem e destino não podem ser iguais',
    path: ['destination'],
  })
  .refine((d) => d.dateRangeEnd >= d.dateRangeStart, {
    message: 'Data final deve ser após a data inicial',
    path: ['dateRangeEnd'],
  })
  .refine((d) => d.minDays <= d.maxDays, {
    message: 'Duração mínima deve ser ≤ à duração máxima',
    path: ['maxDays'],
  })

// --- Modo Anywhere ---
// Destino é opcional — usuário quer descobrir oportunidades sem destino fixo.

export const anywhereSchema = z
  .object({
    mode: z.literal('anywhere'),
    origin: airportCode,
    destination: z.string().optional(),
    departureDate: isoDate,
    returnDate: optionalIsoDate,
    oneWay: z.boolean(),
    cabinClass: cabinClassEnum,
    passengers: passengersSchema,
  })
  .refine(
    (d) => !d.destination || d.destination !== d.origin,
    {
      message: 'Origem e destino não podem ser iguais',
      path: ['destination'],
    },
  )
  .refine(
    (d) => !d.returnDate || d.returnDate >= d.departureDate,
    {
      message: 'Data de volta deve ser após a data de ida',
      path: ['returnDate'],
    },
  )

// --- Tipos de output prontos para integração com backend ---

export type ExactSearchParams   = z.infer<typeof exactSchema>
export type FlexibleSearchParams = z.infer<typeof flexibleSchema>
export type AnywhereSearchParams = z.infer<typeof anywhereSchema>
export type SearchParams = ExactSearchParams | FlexibleSearchParams | AnywhereSearchParams

export type SearchMode = SearchParams['mode']

// Valida de acordo com o modo ativo e retorna erros por campo.
export function validateSearch(
  mode: SearchMode,
  data: Record<string, unknown>,
): { success: true; data: SearchParams } | { success: false; errors: Record<string, string> } {
  const schema = mode === 'exact' ? exactSchema : mode === 'flexible' ? flexibleSchema : anywhereSchema
  const result = schema.safeParse({ ...data, mode })

  if (result.success) return { success: true, data: result.data as SearchParams }

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[issue.path.length - 1] as string
    if (key && !errors[key]) errors[key] = issue.message
  }
  return { success: false, errors }
}
