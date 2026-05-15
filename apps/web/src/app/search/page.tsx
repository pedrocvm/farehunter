import { AdvancedSearchForm } from '@/components/advanced-search-form'

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buscar passagens</h1>
        <p className="text-sm text-muted-foreground">
          Escolha o modo de busca e informe suas preferências.
        </p>
      </div>

      <AdvancedSearchForm />
    </div>
  )
}
