'use client'

// Error boundary do segmento. Renderiza fallback simples quando o fetch
// da API /api/fares (ou qualquer erro do RSC) falha.
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Por enquanto so logamos no console — sem servico de telemetria ainda.
    console.error('[dashboard] erro ao renderizar:', error)
  }, [error])

  return (
    <section className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/40 py-16 text-center">
      <p className="text-lg font-medium">Não foi possível carregar as ofertas</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Houve um problema ao conversar com o radar. Tente novamente em
        instantes.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Tentar novamente
      </button>
    </section>
  )
}
