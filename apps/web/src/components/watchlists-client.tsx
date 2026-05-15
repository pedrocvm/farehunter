'use client'

import { useState } from 'react'
import { WatchlistCard } from '@/components/watchlist-card'
import { WatchlistCreateModal } from '@/components/watchlist-create-modal'
import type { Watchlist, CreateWatchlistInput } from '@/lib/watchlist-data'
import { createWatchlist, toggleWatchlistStatus, deleteWatchlist } from '@/lib/watchlist-data'

export function WatchlistsClient({ initial }: { initial: Watchlist[] }) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(initial)
  const [showModal, setShowModal] = useState(false)

  async function handleCreate(input: CreateWatchlistInput) {
    // Optimistic update: adiciona localmente antes da resposta da API
    const created = await createWatchlist(input)
    setWatchlists((prev) => [created, ...prev])
  }

  async function handleToggle(id: string) {
    setWatchlists((prev) =>
      prev.map((wl) => {
        if (wl.id !== id) return wl
        const next = wl.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        toggleWatchlistStatus(id, next) // fire-and-forget; sem await p/ não bloquear UI
        return { ...wl, status: next }
      }),
    )
  }

  async function handleDelete(id: string) {
    setWatchlists((prev) => prev.filter((wl) => wl.id !== id))
    deleteWatchlist(id) // fire-and-forget
  }

  const active = watchlists.filter((wl) => wl.status === 'ACTIVE').length

  return (
    <section className="space-y-6">
      {/* Barra superior: contagem + botão criar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {watchlists.length === 0
            ? 'Nenhuma watchlist criada.'
            : `${active} ativa${active !== 1 ? 's' : ''} · ${watchlists.length} no total`}
        </p>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + Criar watchlist
        </button>
      </div>

      {/* Grid ou estado vazio */}
      {watchlists.length === 0 ? (
        <EmptyWatchlists onCreateClick={() => setShowModal(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {watchlists.map((wl) => (
            <WatchlistCard
              key={wl.id}
              watchlist={wl}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal de criação */}
      {showModal && (
        <WatchlistCreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </section>
  )
}

function EmptyWatchlists({ onCreateClick }: { onCreateClick: () => void }) {
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
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 0 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 0 1-6 0v-1m6 0H9"/>
      </svg>
      <p className="text-base font-medium">Nenhuma watchlist ainda</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Crie uma para o radar monitorar rotas automaticamente.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Criar primeira watchlist
      </button>
    </div>
  )
}
