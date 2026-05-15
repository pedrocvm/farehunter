'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

// Tipos internos do formulário — sem relação com Deal/Flight do backend ainda.
// Quando a API estiver pronta, SearchParams de packages/adapters/src/types.ts
// substituirá este tipo e a função handleSubmit fará a chamada real.
type SearchFields = {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  cabinClass: string
  passengers: string
  maxPrice: string
}

type FieldErrors = Partial<Record<keyof SearchFields, string>>

const EMPTY: SearchFields = {
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: '',
  cabinClass: 'Economy',
  passengers: '1',
  maxPrice: '',
}

const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First']

// --- Validação ---

function validate(fields: SearchFields): FieldErrors {
  const errors: FieldErrors = {}
  const today = new Date().toISOString().split('T')[0]!

  if (!fields.origin.trim()) {
    errors.origin = 'Origem obrigatória.'
  } else if (!/^[A-Z]{3}$/.test(fields.origin.toUpperCase())) {
    errors.origin = 'Use o código IATA de 3 letras (ex: GRU).'
  }

  if (!fields.destination.trim()) {
    errors.destination = 'Destino obrigatório.'
  } else if (!/^[A-Z]{3}$/.test(fields.destination.toUpperCase())) {
    errors.destination = 'Use o código IATA de 3 letras (ex: LIS).'
  } else if (
    fields.destination.toUpperCase() === fields.origin.toUpperCase()
  ) {
    errors.destination = 'Destino deve ser diferente da origem.'
  }

  if (!fields.departureDate) {
    errors.departureDate = 'Data de ida obrigatória.'
  } else if (fields.departureDate < today) {
    errors.departureDate = 'A data de ida não pode ser no passado.'
  }

  if (fields.returnDate && fields.departureDate && fields.returnDate < fields.departureDate) {
    errors.returnDate = 'A volta deve ser após a ida.'
  }

  const pax = Number(fields.passengers)
  if (!Number.isInteger(pax) || pax < 1 || pax > 9) {
    errors.passengers = 'Entre 1 e 9 passageiros.'
  }

  if (fields.maxPrice && Number(fields.maxPrice) <= 0) {
    errors.maxPrice = 'Informe um valor positivo.'
  }

  return errors
}

// --- Estilos base ---

const inputBase =
  'w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const inputValid = 'border-border'
const inputError = 'border-destructive focus:ring-destructive/40'

// --- Sub-componentes ---

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// --- Componente principal ---

export function SearchForm() {
  const [fields, setFields] = useState<SearchFields>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)

  function set(key: keyof SearchFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    // Limpa o erro do campo ao digitar
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const normalized: SearchFields = {
      ...fields,
      origin: fields.origin.trim().toUpperCase(),
      destination: fields.destination.trim().toUpperCase(),
    }
    setFields(normalized)

    const errs = validate(normalized)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    // TODO: substituir por chamada real à API quando o backend estiver pronto.
    // Exemplo futuro:
    //   await fetch('/api/search', { method: 'POST', body: JSON.stringify(normalized) })
    console.info('[SearchForm] busca enviada:', normalized)
    setSubmitted(true)
  }

  function reset() {
    setFields(EMPTY)
    setErrors({})
    setSubmitted(false)
  }

  // --- Estado pós-submit ---
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-7 w-7 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Busca registrada!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          O radar está varrendo as opções de{' '}
          <strong>{fields.origin}</strong> → <strong>{fields.destination}</strong>.
          Os resultados aparecerão no dashboard em breve.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Nova busca
          </button>
          <a
            href="/"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ver ofertas
          </a>
        </div>
      </div>
    )
  }

  // --- Formulário ---
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="space-y-6">
        {/* Rota */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Rota
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Origem" required error={errors.origin}>
              <input
                type="text"
                placeholder="GRU"
                maxLength={3}
                value={fields.origin}
                onChange={(e) => set('origin', e.target.value.toUpperCase())}
                className={cn(inputBase, errors.origin ? inputError : inputValid)}
                aria-invalid={!!errors.origin}
              />
            </Field>

            <Field label="Destino" required error={errors.destination}>
              <input
                type="text"
                placeholder="LIS"
                maxLength={3}
                value={fields.destination}
                onChange={(e) => set('destination', e.target.value.toUpperCase())}
                className={cn(inputBase, errors.destination ? inputError : inputValid)}
                aria-invalid={!!errors.destination}
              />
            </Field>
          </div>
        </div>

        {/* Datas */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Datas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ida" required error={errors.departureDate}>
              <input
                type="date"
                value={fields.departureDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => set('departureDate', e.target.value)}
                className={cn(inputBase, errors.departureDate ? inputError : inputValid)}
                aria-invalid={!!errors.departureDate}
              />
            </Field>

            <Field label="Volta" error={errors.returnDate}>
              <input
                type="date"
                value={fields.returnDate}
                min={fields.departureDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => set('returnDate', e.target.value)}
                className={cn(inputBase, errors.returnDate ? inputError : inputValid)}
                aria-invalid={!!errors.returnDate}
              />
            </Field>
          </div>
        </div>

        {/* Preferências */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Preferências
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Classe" error={errors.cabinClass}>
              <select
                value={fields.cabinClass}
                onChange={(e) => set('cabinClass', e.target.value)}
                className={cn(inputBase, inputValid)}
              >
                {CABIN_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Passageiros" required error={errors.passengers}>
              <input
                type="number"
                min={1}
                max={9}
                value={fields.passengers}
                onChange={(e) => set('passengers', e.target.value)}
                className={cn(inputBase, errors.passengers ? inputError : inputValid)}
                aria-invalid={!!errors.passengers}
              />
            </Field>

            <Field label="Preço máximo (R$)" error={errors.maxPrice}>
              <input
                type="number"
                min={0}
                step={100}
                placeholder="Sem limite"
                value={fields.maxPrice}
                onChange={(e) => set('maxPrice', e.target.value)}
                className={cn(inputBase, errors.maxPrice ? inputError : inputValid)}
                aria-invalid={!!errors.maxPrice}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Botão */}
      <div className="mt-8">
        <button
          type="submit"
          className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-auto sm:px-10"
        >
          Buscar passagens
        </button>
      </div>
    </form>
  )
}
