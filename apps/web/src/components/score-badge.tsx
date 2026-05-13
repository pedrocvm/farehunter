import { cn } from '@/lib/utils'

export type ScoreBadgeProps = {
  score: number
  // label é opcional:
  //   - passado  → aparece visualmente antes do número (ex: "Oportunidade 92")
  //   - omitido  → exibe apenas o número (útil quando o label já está na UI ao redor)
  label?: string
}

// Mapeia o valor numérico para a classe de cor correspondente.
// Clampa para [0, 100] antes de avaliar para evitar resultados inesperados.
function scoreStyle(score: number): string {
  const s = Math.min(100, Math.max(0, score))
  if (s >= 90) return 'bg-emerald-100 text-emerald-800'  // verde forte
  if (s >= 75) return 'bg-green-100   text-green-700'    // verde
  if (s >= 60) return 'bg-yellow-100  text-yellow-700'   // amarelo
  if (s >= 40) return 'bg-slate-100   text-slate-600'    // cinza
  return 'bg-red-100 text-red-700'                       // vermelho
}

export function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const clamped = Math.min(100, Math.max(0, score))

  // aria-label garante que leitores de tela descrevam o valor com contexto,
  // independentemente de o label visual estar visível ou não.
  const ariaLabel = label ? `${label}: ${clamped}` : `Score: ${clamped}`

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        scoreStyle(clamped),
      )}
    >
      {label && <span className="opacity-70">{label}</span>}
      <span className="font-bold tabular-nums">{clamped}</span>
    </span>
  )
}
