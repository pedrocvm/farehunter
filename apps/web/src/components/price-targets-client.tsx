'use client'

import { useState } from 'react'
import { PriceTargetCard } from '@/components/price-target-card'
import { deletePriceTarget } from '@/lib/price-target-data'
import { computeMetrics } from '@/lib/price-target-data'
import type { PriceTarget, PriceTargetStatus } from '@/lib/price-target-data'

// Ordena: REACHED primeiro, depois CLOSE, WATCHING, FAR
const STATUS_ORDER: PriceTargetStatus[] = ['REACHED', 'CLOSE', 'WATCHING', 'FAR']

export function PriceTargetsClient({ initial }: { initial: PriceTarget[] }) {
  const [targets, setTargets] = useState<PriceTarget[]>(initial)

  function handleDelete(id: string) {
    setTargets((prev) => prev.filter((t) => t.id !== id))
    deletePriceTarget(id)
  }

  // Ordena por proximidade à meta: targets atingidas primeiro
  const sorted = [...targets].sort((a, b) => {
    const ia = STATUS_ORDER.indexOf(computeMetrics(a).status)
    const ib = STATUS_ORDER.indexOf(computeMetrics(b).status)
    return ia - ib
  })

  const reachedCount = targets.filter((t) => computeMetrics(t).status === 'REACHED').length

  return (
    <section className="space-y-6">
      {/* Resumo + botão criar (stub) */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {targets.length === 0
            ? 'Nenhuma meta criada.'
            : `${reachedCount} de ${targets.length} ${reachedCount === 1 ? 'meta atingida' : 'metas atingidas'}`}
        </p>
        {/* TODO: abrir modal de criação quando o CRUD real estiver pronto */}
        <button
          type="button"
          disabled
          title="Em breve"
          className="cursor-not-allowed rounded-md bg-primary/40 px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          + Nova meta
        </button>
      </div>

      {targets.length === 0 ? (
        <EmptyTargets />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((t) => (
            <PriceTargetCard key={t.id} target={t} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  )
}

function EmptyTargets() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
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
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
      </svg>
      <p className="text-base font-medium">Nenhuma meta de preço</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Defina um alvo e o radar avisa quando o preço for atingido.
      </p>
    </div>
  )
}
