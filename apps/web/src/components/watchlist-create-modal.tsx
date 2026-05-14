'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { CreateWatchlistInput } from '@/lib/watchlist-data'

type Props = {
  onClose: () => void
  onCreate: (input: CreateWatchlistInput) => void
}

type Fields = {
  name: string
  origin: string
  destination: string
  maxPrice: string
  cabinClass: string
}

type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = {
  name: '',
  origin: '',
  destination: '',
  maxPrice: '',
  cabinClass: 'Economy',
}

const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First']

const inputBase =
  'w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

function validate(f: Fields): Errors {
  const errors: Errors = {}
  if (!f.name.trim()) errors.name = 'Nome obrigatório.'
  if (!f.origin.trim()) {
    errors.origin = 'Origem obrigatória.'
  } else if (!/^[A-Z]{3}$/.test(f.origin)) {
    errors.origin = 'Código IATA de 3 letras (ex: GRU).'
  }
  if (!f.destination.trim()) errors.destination = 'Destino obrigatório.'
  if (f.maxPrice && Number(f.maxPrice) <= 0) errors.maxPrice = 'Valor deve ser positivo.'
  return errors
}

export function WatchlistCreateModal({ onClose, onCreate }: Props) {
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function set(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = { ...fields, origin: fields.origin.toUpperCase(), destination: fields.destination.toUpperCase() }
    const errs = validate(normalized)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    onCreate({
      name: normalized.name.trim(),
      origin: normalized.origin,
      destination: normalized.destination,
      maxPrice: normalized.maxPrice ? Number(normalized.maxPrice) : undefined,
      currency: 'BRL',
      cabinClass: normalized.cabinClass,
      status: 'ACTIVE',
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Criar watchlist"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-xl bg-background shadow-2xl outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold">Nova watchlist</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
          {/* Nome */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Nome <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Lisboa no inverno"
              value={fields.name}
              onChange={(e) => set('name', e.target.value)}
              className={cn(inputBase, errors.name ? 'border-destructive' : 'border-border')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive" role="alert">{errors.name}</p>}
          </div>

          {/* Rota */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Origem <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="GRU"
                maxLength={3}
                value={fields.origin}
                onChange={(e) => set('origin', e.target.value.toUpperCase())}
                className={cn(inputBase, errors.origin ? 'border-destructive' : 'border-border')}
                aria-invalid={!!errors.origin}
              />
              {errors.origin && <p className="text-xs text-destructive" role="alert">{errors.origin}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Destino <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="LIS"
                value={fields.destination}
                onChange={(e) => set('destination', e.target.value.toUpperCase())}
                className={cn(inputBase, errors.destination ? 'border-destructive' : 'border-border')}
                aria-invalid={!!errors.destination}
              />
              {errors.destination && <p className="text-xs text-destructive" role="alert">{errors.destination}</p>}
            </div>
          </div>

          {/* Preferências */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Preço máximo (R$)</label>
              <input
                type="number"
                min={0}
                step={100}
                placeholder="Sem limite"
                value={fields.maxPrice}
                onChange={(e) => set('maxPrice', e.target.value)}
                className={cn(inputBase, errors.maxPrice ? 'border-destructive' : 'border-border')}
              />
              {errors.maxPrice && <p className="text-xs text-destructive" role="alert">{errors.maxPrice}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Classe</label>
              <select
                value={fields.cabinClass}
                onChange={(e) => set('cabinClass', e.target.value)}
                className={cn(inputBase, 'border-border')}
              >
                {CABIN_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Criar watchlist
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
