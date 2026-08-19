import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'wouter'
import type { Vehicle } from '../../lib/types'
import { ButtonLink } from '../ButtonLink'
import { ShowroomImage } from '../ShowroomImage'

type Props = {
  vehicles: Vehicle[]
  ctaLabel: string
  eyebrow: string
  headline: string
  index: number
  onIndex: (index: number) => void
}

const statAccents = [
  { label: 'text-signal', value: 'text-signal' },
  { label: 'text-jade', value: 'text-jade' },
  { label: 'text-ember', value: 'text-ember' },
]

export function HeroCarousel({ vehicles, ctaLabel, eyebrow, headline, index, onIndex }: Props) {
  const active = vehicles[index] ?? vehicles[0]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (vehicles.length < 2) return undefined
    const id = window.setInterval(() => {
      onIndex((index + 1) % vehicles.length)
    }, 6400)
    return () => window.clearInterval(id)
  }, [vehicles.length, index, onIndex])

  if (!active) return null

  function go(delta: number) {
    onIndex((index + delta + vehicles.length) % vehicles.length)
  }

  const stats = [
    { label: '0–100', value: active.specs.acceleration.replace(' sec', 's') },
    { label: 'Output', value: active.specs.power.replace(' ', '') },
    { label: 'V-max', value: active.specs.topSpeed.replace(' ', '') },
  ]

  return (
    <section className="hero-stage relative z-10 flex min-h-[100svh] items-end pb-10 pt-28 md:items-center md:pb-24 md:pt-32">
      <div className="shell grid w-full items-end gap-6 md:grid-cols-[1fr_auto] md:items-center md:gap-10">
        <div className="max-w-2xl">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-amber">{eyebrow}</p>
          <h1 className="display mt-4 text-[clamp(2.2rem,8vw,6.4rem)] leading-none text-white">{active.name}</h1>
          <p className="mt-4 max-w-md border-l-2 border-signal pl-4 text-sm leading-relaxed text-white/80 md:text-base md:text-lg">
            {headline}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={`/cars/${active.slug}`} variant="deep">
              {ctaLabel} {active.name}
            </ButtonLink>
            <ButtonLink href="/showcase" variant="ghost">
              Explore collection
            </ButtonLink>
          </div>
          <dl className="mt-6 grid max-w-md grid-cols-3 gap-2 md:mt-10 md:gap-3">
            {stats.map((stat, statIndex) => (
              <div key={stat.label} className="rounded-xl border border-white/15 bg-carbon/70 px-2 py-3 backdrop-blur-sm md:px-3 md:py-4">
                <dt className={`font-mono text-[0.5rem] uppercase tracking-[0.18em] md:text-[0.56rem] md:tracking-[0.2em] ${statAccents[statIndex].label}`}>
                  {stat.label}
                </dt>
                <dd className="display mt-1 text-base text-white md:text-2xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Nav — hidden on mobile, shown on md+ */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="focus-scarlet grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-carbon/60 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-carbon"
            onClick={() => go(-1)}
            aria-label="Previous car"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {vehicles.map((car, carIndex) => (
              <button
                key={car.id}
                type="button"
                aria-label={`Show ${car.name}`}
                onClick={() => onIndex(carIndex)}
                className={`focus-scarlet grid h-11 min-w-11 place-items-center rounded-full ${carIndex === index ? 'bg-white/15' : ''}`}
              >
                <span className={`h-1.5 w-8 rounded-full ${carIndex === index ? 'bg-signal' : 'bg-white/30'}`} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="focus-scarlet grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-carbon/60 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-carbon"
            onClick={() => go(1)}
            aria-label="Next car"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Mobile dot nav */}
        <div className="flex items-center justify-between md:hidden">
          <button
            type="button"
            className="focus-scarlet grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-carbon/60 text-white backdrop-blur-sm"
            onClick={() => go(-1)}
            aria-label="Previous car"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {vehicles.map((car, carIndex) => (
              <button
                key={car.id}
                type="button"
                aria-label={`Show ${car.name}`}
                onClick={() => onIndex(carIndex)}
                className="focus-scarlet h-2 rounded-full transition-all"
                style={{ width: carIndex === index ? '2rem' : '0.5rem', background: carIndex === index ? '#e11d38' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
          <button
            type="button"
            className="focus-scarlet grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-carbon/60 text-white backdrop-blur-sm"
            onClick={() => go(1)}
            aria-label="Next car"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

export function CoverflowCarousel({ vehicles, light = false }: { vehicles: Vehicle[]; light?: boolean }) {
  const [index, setIndex] = useState(0)
  if (vehicles.length === 0) return null

  return (
    <div className="coverflow overflow-x-clip">
      <div className="relative mx-auto h-[380px] max-w-5xl overflow-hidden perspective-[1400px] md:h-[460px]">
        {vehicles.map((car, carIndex) => {
          const offset = carIndex - index
          return (
            <Link
              key={car.id}
              href={`/cars/${car.slug}`}
              className="coverflow-card focus-scarlet absolute left-1/2 top-0 h-full w-[min(78%,640px)] -translate-x-1/2 overflow-hidden rounded-2xl will-change-transform"
              style={{
                transform: `translateX(${offset * 58}%) rotateY(${offset * -32}deg) scale(${offset === 0 ? 1 : 0.78})`,
                zIndex: 20 - Math.abs(offset),
                opacity: Math.abs(offset) > 2 ? 0 : 1,
                filter: offset === 0 ? 'none' : 'saturate(0.7)',
              }}
            >
            <ShowroomImage
              src={car.cardImageUrl}
              srcSet={car.cardSrcSet}
              alt={car.name}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 78vw, 640px"
            />
              <div className="absolute bottom-0 left-0 right-0 bg-carbon/95 px-5 py-4">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-amber">{car.statusLabel}</p>
                <p className="display mt-1 text-2xl text-white md:text-3xl">{car.name}</p>
              </div>
            </Link>
          )
        })}
      </div>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          className={`focus-scarlet min-h-11 rounded-full px-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors ${
            light
              ? 'border border-white/25 bg-carbon/60 text-white backdrop-blur-sm hover:bg-white hover:text-carbon'
              : 'border border-white/20'
          }`}
          onClick={() => setIndex((current) => (current - 1 + vehicles.length) % vehicles.length)}
        >
          Prev
        </button>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/70">
          {index + 1} / {vehicles.length}
        </p>
        <button
          type="button"
          className={`focus-scarlet min-h-11 rounded-full px-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors ${
            light
              ? 'border border-white/25 bg-carbon/60 text-white backdrop-blur-sm hover:bg-white hover:text-carbon'
              : 'border border-white/20'
          }`}
          onClick={() => setIndex((current) => (current + 1) % vehicles.length)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
