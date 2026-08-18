import { ArrowUpRight } from 'lucide-react'
import { Link } from 'wouter'
import type { Vehicle } from '../lib/types'
import { ShowroomImage } from './ShowroomImage'

export function CarCard({ car, featured = false }: { car: Vehicle; featured?: boolean }) {
  return (
    <Link
      href={`/cars/${car.slug}`}
      className={`group relative block aspect-[4/5] overflow-hidden bg-panel focus-scarlet md:aspect-[5/4] ${
        featured ? 'min-h-[420px] md:min-h-[540px]' : 'min-h-[280px]'
      }`}
    >
      <ShowroomImage
        src={car.cardImageUrl}
        srcSet={car.cardSrcSet}
        alt={`${car.name} — ${car.statusLabel}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        sizes={featured ? '(max-width: 768px) 100vw, 60vw' : '(max-width: 768px) 100vw, 40vw'}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: car.accent ?? '#f23848' }} />
            {car.statusLabel}
          </p>
          <h3 className="display mt-2 text-[clamp(1.6rem,3vw,2.6rem)]">{car.name}</h3>
          <p className="mt-2 max-w-md text-sm text-white/65">{car.summary}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center border border-white/20 bg-black/30 transition-colors group-hover:border-scarlet group-hover:bg-scarlet" aria-hidden>
          <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
