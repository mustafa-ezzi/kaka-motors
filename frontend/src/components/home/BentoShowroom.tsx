import { motion, type Variants } from 'framer-motion'
import { ArrowUpRight, Clock, Gauge, MapPin, Sparkles, Zap } from 'lucide-react'
import { Link } from 'wouter'
import type { Vehicle } from '../../lib/types'

type Props = {
  vehicles: Vehicle[]
  featured: Vehicle
  responseTime: string
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const tile: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 190, damping: 22 },
  },
}

const lift = {
  y: -6,
  transition: { type: 'spring' as const, stiffness: 330, damping: 20 },
}

export function BentoShowroom({ vehicles, featured, responseTime }: Props) {
  const categories = [...new Set(vehicles.map((car) => car.category))]

  return (
    <section className="shell py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-amber">One floor</p>
          <h2 className="display mt-3 text-[clamp(2.1rem,4.4vw,3.6rem)] text-white">
            Everything lives <span className="text-signal">in Karachi</span>.
          </h2>
        </div>
        <p className="max-w-sm border-l-2 border-ember pl-4 text-base leading-relaxed text-white/75">
          A single studio, a short catalog, and an appointment that actually holds. No branches, no queue.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        className="mt-12 grid gap-5 md:grid-cols-4"
      >
        <motion.div
          variants={tile}
          whileHover={lift}
          className="tile crystal crystal-ink p-6 md:col-span-2 md:row-span-2 md:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-amber">Featured</p>
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white">
              {featured.statusLabel}
            </span>
          </div>
          <motion.img
            src={featured.heroImageUrl}
            srcSet={featured.heroSrcSet}
            alt={featured.name}
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="mx-auto mt-6 h-[min(38vh,300px)] w-full object-contain"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          />
          <h3 className="display mt-5 text-3xl text-white md:text-4xl">{featured.name}</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">{featured.summary}</p>
          <Link
            href={`/cars/${featured.slug}`}
            className="focus-scarlet mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0f1318] transition-colors hover:bg-amber"
          >
            Inspect <ArrowUpRight size={14} />
          </Link>
        </motion.div>

        <motion.div variants={tile} whileHover={lift} className="tile crystal crystal-ruby p-6">
          <Zap size={20} className="text-amber" />
          <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">0–100 km/h</p>
          <p className="display mt-2 text-4xl text-white">{featured.specs.acceleration}</p>
        </motion.div>

        <motion.div variants={tile} whileHover={lift} className="tile crystal crystal-petrol p-6">
          <Gauge size={20} className="text-amber" />
          <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">Output</p>
          <p className="display mt-2 text-4xl text-white">{featured.specs.power}</p>
        </motion.div>

        <motion.div variants={tile} whileHover={lift} className="tile crystal crystal-ember p-6">
          <Sparkles size={20} className="text-amber" />
          <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">V-max</p>
          <p className="display mt-2 text-4xl text-white">{featured.specs.topSpeed}</p>
        </motion.div>

        <motion.div variants={tile} whileHover={lift} className="tile crystal crystal-ink p-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">On the floor</p>
          <p className="display mt-2 text-5xl text-white">{vehicles.length}</p>
          <p className="mt-3 text-sm text-white/80">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}, curated by hand.
          </p>
        </motion.div>

        <motion.div variants={tile} whileHover={lift} className="tile crystal crystal-ink p-6 md:col-span-2 md:p-8">
          <MapPin size={20} className="text-amber" />
          <h3 className="display mt-5 text-2xl text-white md:text-3xl">Karachi studio</h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
            The only Kaka Motors floor. Private viewings, one car at a time, lights set before you arrive.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['By appointment', 'Mon–Sat', 'Karachi · PK'].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={tile} whileHover={lift} className="tile crystal crystal-ember p-6">
          <Clock size={20} className="text-amber" />
          <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">We reply</p>
          <p className="display mt-2 text-2xl text-white md:text-3xl">{responseTime}</p>
        </motion.div>

        <motion.div variants={tile} whileHover={lift} className="tile crystal crystal-signal p-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">Private drive</p>
          <h3 className="display mt-3 text-2xl text-white md:text-3xl">Take the keys.</h3>
          <Link
            href="/test-drive"
            className="focus-scarlet mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0f1318] transition-colors hover:bg-amber"
          >
            Reserve <ArrowUpRight size={14} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
