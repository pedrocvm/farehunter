import { cn } from '@/lib/utils'
import type { DealStatus } from '@/lib/types'

// DealStatus é definido em @/lib/types — importado aqui para uso no componente.
// Re-exportado para que consumidores que só precisam do tipo possam importar
// de um lugar só, sem precisar conhecer a estrutura interna.
export type { DealStatus }

type StatusConfig = {
  label: string
  className: string
}

const STATUS_CONFIG: Record<DealStatus, StatusConfig> = {
  ACTIVE:         { label: 'Ativa',            className: 'bg-emerald-100 text-emerald-700' },
  EXPIRED:        { label: 'Expirada',         className: 'bg-slate-100   text-slate-500'   },
  UNVERIFIED:     { label: 'Não verificada',   className: 'bg-blue-100    text-blue-700'    },
  REVALIDATED:    { label: 'Revalidada',       className: 'bg-purple-100  text-purple-700'  },
  POSSIBLE_ERROR: { label: 'Possível erro',    className: 'bg-red-100     text-red-700'     },
  LOW_CONFIDENCE: { label: 'Baixa confiança',  className: 'bg-amber-100   text-amber-700'   },
  NEEDS_REVIEW:   { label: 'Precisa revisão',  className: 'bg-orange-100  text-orange-700'  },
}

export function DealStatusBadge({ status }: { status: DealStatus }) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  )
}

// Retorna o texto do status sem renderizar JSX — util em listas/selects
export function statusLabel(status: DealStatus): string {
  return STATUS_CONFIG[status].label
}
