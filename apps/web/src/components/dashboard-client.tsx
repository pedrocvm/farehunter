'use client'

import { useState, useMemo } from 'react'
import { DealCard, type Deal } from '@/components/deal-card'
import { DealModal } from '@/components/deal-modal'
import { type DealStatus, statusLabel } from '@/components/deal-status-badge'
import { cn } from '@/lib/utils'

// Todos os status possiveis — usados para popular o select de filtro
const ALL_STATUSES: DealStatus[] = [
  'ACTIVE',
  'EXPIRED',
  'UNVERIFIED',
  'REVALIDATED',
  'POSSIBLE_ERROR',
  'LOW_CONFIDENCE',
  'NEEDS_REVIEW',
]

type Filters = {
  origin: string
  destination: string
  cabinClass: string
  status: string
  maxPrice: string
  minScore: string
}

const EMPTY_FILTERS: Filters = {
  origin: '',
  destination: '',
  cabinClass: '',
  status: '',
  maxPrice: '',
  minScore: '',
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// Componente de label + campo do filtro
function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

const selectCls =
  'rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

const inputCls = selectCls

export function DashboardClient({ deals }: { deals: Deal[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  // null = modal fechado; Deal = modal aberto com os dados da oferta selecionada
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  // Opcoes dinamicas derivadas dos dados reais
  const origins = useMemo(() => unique(deals.map((d) => d.origin)).sort(), [deals])
  const destinations = useMemo(
    () => unique(deals.map((d) => d.destination)).sort(),
    [deals],
  )
  const cabinClasses = useMemo(
    () => unique(deals.map((d) => d.cabinClass).filter(Boolean) as string[]).sort(),
    [deals],
  )

  // Aplicacao dos filtros
  const filtered = useMemo(() => {
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : Infinity
    const minScore = filters.minScore ? Number(filters.minScore) : 0

    return deals.filter((d) => {
      if (filters.origin && d.origin !== filters.origin) return false
      if (filters.destination && d.destination !== filters.destination) return false
      if (filters.cabinClass && d.cabinClass !== filters.cabinClass) return false
      if (filters.status && d.status !== filters.status) return false
      if (d.price > maxPrice) return false
      // Score minimo: considera opportunityScore; sem score passa pelo filtro
      if (
        filters.minScore &&
        d.opportunityScore != null &&
        d.opportunityScore < minScore
      )
        return false
      return true
    })
  }, [deals, filters])

  function set(field: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const isFiltered = Object.values(filters).some(Boolean)

  return (
    <section className="space-y-6">
      {/* Painel de filtros */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Filtros</span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <FilterField label="Origem">
            <select
              value={filters.origin}
              onChange={(e) => set('origin', e.target.value)}
              className={selectCls}
            >
              <option value="">Todas</option>
              {origins.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Destino">
            <select
              value={filters.destination}
              onChange={(e) => set('destination', e.target.value)}
              className={selectCls}
            >
              <option value="">Todos</option>
              {destinations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Classe">
            <select
              value={filters.cabinClass}
              onChange={(e) => set('cabinClass', e.target.value)}
              className={selectCls}
            >
              <option value="">Todas</option>
              {cabinClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Status">
            <select
              value={filters.status}
              onChange={(e) => set('status', e.target.value)}
              className={selectCls}
            >
              <option value="">Todos</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Preço máximo (R$)">
            <input
              type="number"
              min={0}
              step={100}
              placeholder="Ex: 2000"
              value={filters.maxPrice}
              onChange={(e) => set('maxPrice', e.target.value)}
              className={cn(inputCls, 'w-full')}
            />
          </FilterField>

          <FilterField label="Score mínimo (0–100)">
            <input
              type="number"
              min={0}
              max={100}
              step={5}
              placeholder="Ex: 75"
              value={filters.minScore}
              onChange={(e) => set('minScore', e.target.value)}
              className={cn(inputCls, 'w-full')}
            />
          </FilterField>
        </div>
      </div>

      {/* Contagem */}
      <div>
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? 'Nenhuma oferta encontrada.'
            : `${filtered.length} ${filtered.length === 1 ? 'oferta' : 'ofertas'} encontrada${filtered.length === 1 ? '' : 's'}.`}
        </p>
      </div>

      {/* Grid de cards ou estado vazio */}
      {filtered.length === 0 ? (
        <EmptyFiltered hasFilters={isFiltered} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={(e) => {
                e.preventDefault()
                setSelectedDeal(deal)
              }}
            />
          ))}
        </div>
      )}

      {/* Modal — renderizado sobre o dashboard quando uma oferta é selecionada */}
      {selectedDeal && (
        <DealModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
      )}
    </section>
  )
}

function EmptyFiltered({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      {hasFilters ? (
        <>
          <p className="text-lg font-medium">Nenhuma oferta encontrada com esses filtros.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente ampliar os critérios ou limpe os filtros.
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-medium">Nenhuma oferta disponível</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Volte mais tarde — o radar continua varrendo.
          </p>
        </>
      )}
    </div>
  )
}
