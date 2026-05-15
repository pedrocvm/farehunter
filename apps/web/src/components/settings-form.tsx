'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Settings = {
  defaultAirport: string
  currency: string
  baggagePreference: string
  acceptAlternativeAirports: boolean
  minAlertScore: number
  localAiEnabled: boolean
  telegramEnabled: boolean
}

const DEFAULTS: Settings = {
  defaultAirport: '',
  currency: 'BRL',
  baggagePreference: 'any',
  acceptAlternativeAirports: true,
  minAlertScore: 75,
  localAiEnabled: false,
  telegramEnabled: false,
}

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

const selectCls = inputCls

// --- Componentes de layout de campo ---

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  )
}

function Field({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="sm:w-56 shrink-0">{children}</div>
    </div>
  )
}

// Toggle acessível (checkbox estilizado)
function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        checked ? 'bg-primary' : 'bg-muted',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

// Badge "Em breve" para features futuras
function ComingSoon() {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      Em breve
    </span>
  )
}

// --- Componente principal ---

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSaved(false)
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    // TODO: chamar PATCH /api/settings quando o backend estiver pronto
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Preferências de busca */}
      <FieldGroup title="Preferências de busca">
        <Field
          label="Aeroporto padrão"
          description="Código IATA do aeroporto de origem preferido (ex: GRU, CGH)."
        >
          <input
            type="text"
            value={settings.defaultAirport}
            onChange={(e) => set('defaultAirport', e.target.value.toUpperCase())}
            placeholder="Ex: GRU"
            maxLength={3}
            className={cn(inputCls, 'uppercase tracking-widest')}
          />
        </Field>

        <Field
          label="Moeda padrão"
          description="Moeda usada para exibir preços e alertas."
        >
          <select
            value={settings.currency}
            onChange={(e) => set('currency', e.target.value)}
            className={selectCls}
          >
            <option value="BRL">BRL — Real brasileiro</option>
            <option value="USD">USD — Dólar americano</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — Libra esterlina</option>
          </select>
        </Field>

        <Field
          label="Preferência de bagagem"
          description="Tipo de bagagem mínima para incluir nas buscas."
        >
          <select
            value={settings.baggagePreference}
            onChange={(e) => set('baggagePreference', e.target.value)}
            className={selectCls}
          >
            <option value="any">Qualquer (sem filtro)</option>
            <option value="hand">Somente bagagem de mão</option>
            <option value="10kg">Mínimo 10 kg</option>
            <option value="23kg">Mínimo 23 kg</option>
            <option value="32kg">Mínimo 32 kg</option>
          </select>
        </Field>

        <Field
          label="Aceitar aeroportos alternativos"
          description="Incluir aeroportos próximos à origem/destino preferido."
        >
          <Toggle
            checked={settings.acceptAlternativeAirports}
            onChange={(v) => set('acceptAlternativeAirports', v)}
            label="Aceitar aeroportos alternativos"
          />
        </Field>
      </FieldGroup>

      {/* Alertas */}
      <FieldGroup title="Alertas">
        <Field
          label="Score mínimo de alerta"
          description="Só recebe alertas para ofertas com score de oportunidade acima deste valor (0–100)."
        >
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.minAlertScore}
              onChange={(e) => set('minAlertScore', Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-10 text-right text-sm font-bold tabular-nums">
              {settings.minAlertScore}
            </span>
          </div>
        </Field>
      </FieldGroup>

      {/* Integrações futuras */}
      <FieldGroup title="Integrações">
        <Field
          label="IA local"
          description="Usar modelo de IA no dispositivo para scoring personalizado."
        >
          <div className="flex items-center gap-3">
            <Toggle
              checked={settings.localAiEnabled}
              onChange={(v) => set('localAiEnabled', v)}
              disabled
              label="Ativar IA local"
            />
            <ComingSoon />
          </div>
        </Field>

        <Field
          label="Notificações via Telegram"
          description="Receber alertas de ofertas diretamente no Telegram."
        >
          <div className="flex items-center gap-3">
            <Toggle
              checked={settings.telegramEnabled}
              onChange={(v) => set('telegramEnabled', v)}
              disabled
              label="Ativar Telegram"
            />
            <ComingSoon />
          </div>
        </Field>
      </FieldGroup>

      {/* Rodapé */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <p className="text-sm text-emerald-600 font-medium">
            Configurações salvas!
          </p>
        )}
        <button
          type="submit"
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Salvar configurações
        </button>
      </div>
    </form>
  )
}
