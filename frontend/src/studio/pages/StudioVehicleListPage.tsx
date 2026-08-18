import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { studioGet, studioSend } from '../api'
import type { Vehicle } from '../../lib/types'

export function StudioVehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (status) params.set('status', status)
    const suffix = params.toString() ? `?${params}` : ''
    try {
      setVehicles(await studioGet<Vehicle[]>(`/studio/vehicles/${suffix}`))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load vehicles.')
    }
  }

  useEffect(() => {
    void load()
  }, [status])

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This removes it from the public site.`)) return
    await studioSend(`/studio/vehicles/${id}/`, 'DELETE')
    await load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="display mt-3 text-4xl">Vehicles</h1>
        </div>
        <Link
          href="/studio/vehicles/new"
          className="focus-scarlet bg-scarlet px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] hover:bg-scarlet-hover"
        >
          New vehicle
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void load()
          }}
          placeholder="Search name or slug"
          className="focus-scarlet min-w-[16rem] border border-white/15 bg-transparent px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="focus-scarlet border border-white/15 bg-ink px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em]"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <button
          type="button"
          onClick={() => void load()}
          className="focus-scarlet border border-white/20 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em]"
        >
          Search
        </button>
      </div>

      {error && <p className="mt-6 text-scarlet-soft">{error}</p>}

      <div className="mt-8 overflow-x-auto border border-white/10">
        <table className="w-full text-left">
          <thead className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/40">
            <tr className="border-b border-white/10">
              <th className="p-4">Car</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {vehicles.map((car) => (
              <tr key={car.id} className="border-b border-white/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {car.cardImageUrl ? (
                      <img src={car.cardImageUrl} alt="" className="h-12 w-16 object-cover" />
                    ) : (
                      <span className="grid h-12 w-16 place-items-center border border-white/10 text-[0.6rem] text-white/30">
                        No img
                      </span>
                    )}
                    <div>
                      <p className="display text-xl">{car.name}</p>
                      <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/40">{car.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-white/65">{car.category}</td>
                <td className="p-4 text-sm text-white/65">{car.status}</td>
                <td className="p-4 text-sm text-white/65">{car.featuredOnHome ? 'Yes' : '—'}</td>
                <td className="p-4 text-right">
                  <Link href={`/studio/vehicles/${car.id}`} className="mr-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ice">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => void remove(car.id, car.name)}
                    className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-scarlet-soft"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-white/50">
                  No vehicles yet. Add the first car to the floor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
