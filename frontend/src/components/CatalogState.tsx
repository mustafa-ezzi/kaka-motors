export function CatalogState({
  loading,
  error,
  empty = false,
  emptyLabel = 'Collection in motion',
}: {
  loading: boolean
  error: string | null
  empty?: boolean
  emptyLabel?: string
}) {
  if (loading) {
    return (
      <section className="shell flex min-h-[60vh] items-center pt-28">
        <p className="eyebrow">Loading the floor</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="shell flex min-h-[60vh] items-center pt-28">
        <div>
          <p className="eyebrow">Studio unreachable</p>
          <p className="mt-4 max-w-lg opacity-70">{error}</p>
        </div>
      </section>
    )
  }

  if (empty) {
    return (
      <section className="shell flex min-h-[80vh] items-center pt-28">
        <div>
          <p className="eyebrow">{emptyLabel}</p>
          <p className="mt-4 max-w-lg opacity-70">The floor is being reset. Check back shortly.</p>
        </div>
      </section>
    )
  }

  return null
}
