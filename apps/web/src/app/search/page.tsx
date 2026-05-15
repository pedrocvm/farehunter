import { SearchForm } from '@/components/search-form'

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Busca manual</h2>
        <p className="text-sm text-muted-foreground">
          Informe a rota e preferências — o radar buscará as melhores opções.
        </p>
      </div>

      <SearchForm />
    </div>
  )
}
