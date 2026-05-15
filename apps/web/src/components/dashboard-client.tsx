'use client'

import { useState, useMemo } from 'react'
import type { Deal, DealStatus } from '@/lib/types'
import { DealCard } from '@/components/deal-card'
import { DealModal } from '@/components/deal-modal'
import { statusLabel } from '@/components/deal-status-badge'
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Filtros</span>
            {isFiltered && (
              // Conta quantos filtros estão ativos — feedback visual rápido
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Limpar filtros
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

      {/* Contagem — só exibe quando há resultados */}
      {filtered.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filtered.length === 1 ? '1 oferta encontrada.' : `${filtered.length} ofertas encontradas.`}
        </p>
      )}

      {/* Grid de cards ou estado vazio */}
      {filtered.length === 0 ? (
        <EmptyFiltered
          hasFilters={isFiltered}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
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

type EmptyFilteredProps = {
  hasFilters: boolean
  onClear: () => void
}

function EmptyFiltered({ hasFilters, onClear }: EmptyFilteredProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      {hasFilters ? (
        <>
          {/* Ícone: lupa com X — indica busca sem resultado */}
          <svg
            className="mb-4 h-10 w-10 text-muted-foreground/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
            <path d="m8.5 8.5 5 5m0-5-5 5" />
          </svg>
          <p className="text-base font-medium">
            Nenhuma oferta encontrada com esses filtros.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente ampliar os critérios de busca.
          </p>
          {/* Atalho para limpar sem precisar rolar até o painel */}
          <button
            type="button"
            onClick={onClear}
            className="mt-4 rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Limpar filtros
          </button>
        </>
      ) : (
        <>
          {/* Ícone: radar — indica ausência de dados, não erro */}
          <svg
            className="mb-4 h-10 w-10 text-muted-foreground/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="M12 6a6 6 0 0 1 6 6" />
          </svg>
          <p className="text-base font-medium">Nenhuma oferta disponível</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Volte mais tarde — o radar continua varrendo.
          </p>
        </>
      )}
    </div>
  )
}
