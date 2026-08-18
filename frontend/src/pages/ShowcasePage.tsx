import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CarCard } from '../components/CarCard'
import { CatalogState } from '../components/CatalogState'
import { Seo } from '../components/Seo'
import { publishedVehicles, useCatalog } from '../lib/catalog'
import type { VehicleCategory } from '../lib/types'

const filters: { id: 'all' | VehicleCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'performance', label: 'Performance' },
  { id: 'electric', label: 'Electric' },
  { id: 'executive', label: 'Executive' },
]

export function ShowcasePage() {
  const { vehicles, loading, error } = useCatalog()
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all')
  const cars = publishedVehicles(vehicles)
  const filtered = useMemo(
    () => (filter === 'all' ? cars : cars.filter((car) => car.category === filter)),
    [cars, filter],
  )

  if (loading || error) {
    return <CatalogState loading={loading} error={error} />
  }

  return (
    <section className="shell pb-20 pt-28 md:pt-32">
      <Seo
        title="Kaka Motors Showcase — A gallery of restless ideas."
        description="Filter the Karachi floor. Every car here is appointed, photographed, and ready to be driven."
        path="/showcase"
      />
      <p className="eyebrow reveal">Collection</p>
      <h1 className="display reveal reveal-delay-1 mt-4 max-w-3xl text-[clamp(2.6rem,6vw,5rem)]">
        A gallery of restless ideas.
      </h1>
      <p className="reveal reveal-delay-2 mt-5 max-w-xl text-white/65">
        Filter the floor. Every car here is appointed, photographed, and ready to be driven in Karachi.
      </p>

      <div className="mt-10 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`focus-scarlet min-h-11 px-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors ${
              filter === item.id
                ? 'bg-scarlet text-white'
                : 'border border-white/15 text-white/70 hover:border-white/40 hover:text-fog'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/40">
        {filtered.length} curated {filtered.length === 1 ? 'vehicle' : 'vehicles'}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-16 text-white/55">Collection in motion</p>
      ) : (
        <motion.div layout className="mt-8 grid gap-5 md:grid-cols-2">
          {filtered.map((car, index) => (
            <motion.div
              layout
              key={car.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <CarCard car={car} featured={index === 0 && filter === 'all'} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-20 grid gap-6 md:grid-cols-2">
        <article className="border border-white/10 p-8">
          <p className="eyebrow">Beyond the showroom</p>
          <h2 className="display mt-3 text-3xl">Private roads, not public lots.</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Drives are scheduled, not queued. We keep the catalog short so the appointment still feels like one.
          </p>
        </article>
        <article className="border border-white/10 p-8">
          <p className="eyebrow">Studio note</p>
          <h2 className="display mt-3 text-3xl">The machine stays the protagonist.</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Photography, copy, and specs are written for the car on the floor — not a campaign that outlives it.
          </p>
        </article>
      </div>
    </section>
  )
}
