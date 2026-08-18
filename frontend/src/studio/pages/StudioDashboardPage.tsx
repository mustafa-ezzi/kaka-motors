import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { studioGet } from '../api'

type Overview = {
  publishedVehicles: number
  draftVehicles: number
  newLeads: number
  activeCities: number
}

const cards: { key: keyof Overview; title: string; hint: string; href: string }[] = [
  { key: 'publishedVehicles', title: 'Published', hint: 'Live on the public site', href: '/studio/vehicles' },
  { key: 'draftVehicles', title: 'Drafts', hint: 'Hidden until you publish', href: '/studio/vehicles' },
  { key: 'newLeads', title: 'New drives', hint: 'Waiting on the studio', href: '/studio/leads' },
  { key: 'activeCities', title: 'Cities', hint: 'Shown on the appointment form', href: '/studio/locations' },
]

export function StudioDashboardPage() {
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    studioGet<Overview>('/studio/overview/')
      .then(setData)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <div>
      <p className="eyebrow">Studio</p>
      <h1 className="display mt-3 text-[clamp(2rem,4vw,3.4rem)]">The floor, from the inside.</h1>
      <p className="mt-4 max-w-xl text-white/60">Add cars, publish them, and the public site updates. No frontend deploy.</p>
      {error && <p className="mt-8 text-scarlet-soft">{error}</p>}
      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.key} href={card.href} className="border border-white/10 p-6 hover:border-white/25">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/45">{card.title}</p>
            <p className="display mt-4 text-4xl">{data ? data[card.key] : '—'}</p>
            <p className="mt-3 text-sm text-white/50">{card.hint}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10">
        <Link
          href="/studio/vehicles/new"
          className="focus-scarlet inline-flex bg-scarlet px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] hover:bg-scarlet-hover"
        >
          Add a vehicle
        </Link>
      </div>
    </div>
  )
}
