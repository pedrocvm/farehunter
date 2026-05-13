import { cn } from '@/lib/utils'

type ScoreBadgeProps = {
  label: string
  score: number
  // `compact` omite o label — util para o card onde o espaco e restrito
  compact?: boolean
}

// Faixas de cor mapeadas por nota (0-100)
function scoreStyle(score: number): string {
  if (score >= 90) return 'bg-emerald-100 text-emerald-800'
  if (score >= 75) return 'bg-green-100 text-green-700'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700'
  if (score >= 40) return 'bg-slate-100 text-slate-600'
  return 'bg-red-100 text-red-700'
}

export function ScoreBadge({ label, score, compact = false }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        scoreStyle(score),
      )}
      title={`${label}: ${score}`}
    >
      {!compact && <span className="opacity-70">{label}</span>}
      <span className="font-bold">{score}</span>
    </span>
  )
}
