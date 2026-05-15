'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { validateSearch, type SearchMode, type SearchParams } from '@/lib/search-schema'

// --- Tipos internos do formulário ---

type FormState = {
  origin: string
  destination: string
  // Exact + Anywhere
  departureDate: string
  returnDate: string
  oneWay: boolean
  // Flexible
  dateRangeStart: string
  dateRangeEnd: string
  minDays: string
  maxDays: string
  // Comuns
  cabinClass: string
  passengers: string
}

const EMPTY_FORM: FormState = {
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: '',
  oneWay: false,
  dateRangeStart: '',
  dateRangeEnd: '',
  minDays: '3',
  maxDays: '10',
  cabinClass: 'Economy',
  passengers: '1',
}

// --- Configuração dos modos ---

type ModeConfig = { id: SearchMode; label: string; description: string }

const MODES: ModeConfig[] = [
  {
    id: 'exact',
    label: 'Exato',
    description: 'Datas e destino fixos',
  },
  {
    id: 'flexible',
    label: 'Flexível',
    description: 'Janela de datas e duração',
  },
  {
    id: 'anywhere',
    label: 'Qualquer destino',
    description: 'Descobrir oportunidades',
  },
]

const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First']

// --- Primitivos de UI ---

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

const selectCls = inputCls

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-medium text-muted-foreground">{children}</span>
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

function FieldWrap({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}

// --- Componente principal ---

type Props = {
  onSearch?: (params: SearchParams) => void
}

export function AdvancedSearchForm({ onSearch }: Props) {
  const [mode, setMode] = useState<SearchMode>('exact')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Limpa o erro do campo ao editar
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
  }

  function handleModeChange(next: SearchMode) {
    setMode(next)
    setErrors({})
    setSubmitted(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)

    const result = validateSearch(mode, {
      ...form,
      passengers: Number(form.passengers),
      minDays: Number(form.minDays),
      maxDays: Number(form.maxDays),
      // Em Anywhere, destino vazio é permitido
      destination: mode === 'anywhere' && !form.destination ? undefined : form.destination,
      returnDate: form.oneWay || !form.returnDate ? undefined : form.returnDate,
    })

    if (!result.success) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    onSearch?.(result.data)
    // TODO: navegar para /results ou chamar API
    console.info('[search] params', result.data)
  }

  const isAnywhere = mode === 'anywhere'
  const isFlexible = mode === 'flexible'
  const isExactOrAnywhere = mode === 'exact' || mode === 'anywhere'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* Seletor de modo */}
      <div
        className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1"
        role="tablist"
        aria-label="Modo de busca"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => handleModeChange(m.id)}
            className={cn(
              'flex flex-col items-center rounded-md px-2 py-2 text-center transition-colors',
              mode === m.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
            )}
          >
            <span className="text-sm font-semibold">{m.label}</span>
            <span className="mt-0.5 text-xs text-muted-foreground hidden sm:block">
              {m.description}
            </span>
          </button>
        ))}
      </div>

      {/* Campos do formulário */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Origem */}
          <FieldWrap>
            <Label>Origem *</Label>
            <input
              type="text"
              value={form.origin}
              onChange={(e) => setField('origin', e.target.value.toUpperCase())}
              placeholder="Ex: GRU"
              maxLength={3}
              autoComplete="off"
              className={cn(inputCls, 'uppercase tracking-widest', errors.origin && 'border-red-400 focus:ring-red-400')}
            />
            <ErrorMsg msg={errors.origin} />
          </FieldWrap>

          {/* Destino */}
          <FieldWrap>
            <Label>
              Destino
              {isAnywhere ? (
                <span className="ml-1 text-muted-foreground">(opcional)</span>
              ) : (
                <span className="text-red-500"> *</span>
              )}
            </Label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => setField('destination', e.target.value.toUpperCase())}
              placeholder={isAnywhere ? 'Qualquer destino' : 'Ex: LIS'}
              maxLength={3}
              autoComplete="off"
              className={cn(
                inputCls,
                'uppercase tracking-widest',
                errors.destination && 'border-red-400 focus:ring-red-400',
                isAnywhere && !form.destination && 'placeholder:italic',
              )}
            />
            <ErrorMsg msg={errors.destination} />
          </FieldWrap>

          {/* Datas: Exato + Anywhere */}
          {isExactOrAnywhere && (
            <>
              <FieldWrap>
                <Label>Data de ida *</Label>
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => setField('departureDate', e.target.value)}
                  className={cn(inputCls, errors.departureDate && 'border-red-400 focus:ring-red-400')}
                />
                <ErrorMsg msg={errors.departureDate} />
              </FieldWrap>

              <FieldWrap>
                <div className="mb-1 flex items-center justify-between">
                  <Label>Data de volta</Label>
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={form.oneWay}
                      onChange={(e) => setField('oneWay', e.target.checked)}
                      className="accent-primary"
                    />
                    Somente ida
                  </label>
                </div>
                <input
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => setField('returnDate', e.target.value)}
                  disabled={form.oneWay}
                  className={cn(inputCls, errors.returnDate && 'border-red-400 focus:ring-red-400')}
                />
                <ErrorMsg msg={errors.returnDate} />
              </FieldWrap>
            </>
          )}

          {/* Janela de datas: Flexível */}
          {isFlexible && (
            <>
              <FieldWrap>
                <Label>Partir a partir de *</Label>
                <input
                  type="date"
                  value={form.dateRangeStart}
                  onChange={(e) => setField('dateRangeStart', e.target.value)}
                  className={cn(inputCls, errors.dateRangeStart && 'border-red-400 focus:ring-red-400')}
                />
                <ErrorMsg msg={errors.dateRangeStart} />
              </FieldWrap>

              <FieldWrap>
                <Label>Partir até *</Label>
                <input
                  type="date"
                  value={form.dateRangeEnd}
                  onChange={(e) => setField('dateRangeEnd', e.target.value)}
                  className={cn(inputCls, errors.dateRangeEnd && 'border-red-400 focus:ring-red-400')}
                />
                <ErrorMsg msg={errors.dateRangeEnd} />
              </FieldWrap>

              {/* Duração da viagem */}
              <FieldWrap>
                <Label>Duração mínima (dias) *</Label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={form.minDays}
                  onChange={(e) => setField('minDays', e.target.value)}
                  className={cn(inputCls, errors.minDays && 'border-red-400 focus:ring-red-400')}
                />
                <ErrorMsg msg={errors.minDays} />
              </FieldWrap>

              <FieldWrap>
                <Label>Duração máxima (dias) *</Label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={form.maxDays}
                  onChange={(e) => setField('maxDays', e.target.value)}
                  className={cn(inputCls, errors.maxDays && 'border-red-400 focus:ring-red-400')}
                />
                <ErrorMsg msg={errors.maxDays} />
              </FieldWrap>
            </>
          )}

          {/* Classe */}
          <FieldWrap>
            <Label>Classe</Label>
            <select
              value={form.cabinClass}
              onChange={(e) => setField('cabinClass', e.target.value)}
              className={selectCls}
            >
              {CABIN_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FieldWrap>

          {/* Passageiros */}
          <FieldWrap>
            <Label>Passageiros</Label>
            <select
              value={form.passengers}
              onChange={(e) => setField('passengers', e.target.value)}
              className={cn(selectCls, errors.passengers && 'border-red-400')}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'adulto' : 'adultos'}
                </option>
              ))}
            </select>
            <ErrorMsg msg={errors.passengers} />
          </FieldWrap>
        </div>
      </div>

      {/* Erro geral de validação após submit */}
      {submitted && Object.keys(errors).length > 0 && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          Corrija os campos destacados antes de continuar.
        </p>
      )}

      {/* CTA */}
      <button
        type="submit"
        className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Buscar ofertas
      </button>
    </form>
  )
}
