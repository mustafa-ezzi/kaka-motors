import { type FormEvent, useEffect, useState } from 'react'
import { studioGet, studioSend } from '../api'

type LocationRow = {
  id: number
  city: string
  studioName: string
  address: string
  active: boolean
}

const blank = { city: '', studioName: '', address: '', active: true }

export function StudioLocationPage() {
  const [rows, setRows] = useState<LocationRow[]>([])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setRows(await studioGet<LocationRow[]>('/studio/locations/'))
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message))
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      if (editing) {
        await studioSend(`/studio/locations/${editing}/`, 'PATCH', form)
      } else {
        await studioSend('/studio/locations/', 'POST', form)
      }
      setForm(blank)
      setEditing(null)
      await load()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save city.')
    }
  }

  async function remove(id: number) {
    if (!window.confirm('Remove this city?')) return
    await studioSend(`/studio/locations/${id}/`, 'DELETE')
    await load()
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="eyebrow">Cities</p>
        <h1 className="display mt-3 text-4xl">Locations</h1>
        {error && <p className="mt-6 text-scarlet-soft">{error}</p>}
        <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4 border border-white/10 p-6">
          <input className="focus-scarlet w-full border border-white/15 bg-transparent px-3 py-3" placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
          <input className="focus-scarlet w-full border border-white/15 bg-transparent px-3 py-3" placeholder="Studio name" value={form.studioName} onChange={(event) => setForm({ ...form, studioName: event.target.value })} />
          <textarea className="focus-scarlet w-full border border-white/15 bg-transparent px-3 py-3" placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <label className="flex items-center gap-3 text-sm text-white/70">
            <input type="checkbox" className="accent-scarlet" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            Active on the public form
          </label>
          <button type="submit" className="focus-scarlet bg-scarlet px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em]">
            {editing ? 'Update city' : 'Add city'}
          </button>
        </form>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="flex items-center justify-between border border-white/10 p-4">
            <div>
              <p className="display text-2xl">{row.city}</p>
              <p className="text-sm text-white/50">{row.studioName || '—'} · {row.active ? 'Active' : 'Hidden'}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ice" onClick={() => { setEditing(row.id); setForm({ city: row.city, studioName: row.studioName, address: row.address, active: row.active }) }}>
                Edit
              </button>
              <button type="button" className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-scarlet-soft" onClick={() => void remove(row.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
