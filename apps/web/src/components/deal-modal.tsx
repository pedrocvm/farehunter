'use client'

import { useEffect, useRef } from 'react'
import { DealDetail } from '@/components/deal-detail'
import type { Deal } from '@/components/deal-card'

type DealModalProps = {
  deal: Deal
  onClose: () => void
}

export function DealModal({ deal, onClose }: DealModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Fecha com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Trava scroll da página enquanto o modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Foca o painel ao abrir (acessibilidade)
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  return (
    // Overlay escuro
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        // Fecha ao clicar fora do painel
        if (e.target === e.currentTarget) onClose()
      }}
      aria-modal="true"
      role="dialog"
      aria-label={`Detalhes: ${deal.origin} → ${deal.destination}`}
    >
      {/* Painel central */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-background shadow-2xl outline-none"
      >
        {/* Barra superior sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <span className="text-sm font-semibold text-muted-foreground">
            Detalhes da oferta
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <DealDetail deal={deal} />
        </div>
      </div>
    </div>
  )
}
