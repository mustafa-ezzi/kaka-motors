import { useState } from 'react'
import type { Vehicle } from '../../lib/types'
import { ButtonLink } from '../ButtonLink'
import { AccordionGallery } from './AccordionGallery'

export function FloorRail({ vehicles, light = false }: { vehicles: Vehicle[]; light?: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = vehicles[activeIdx] ?? vehicles[0]

  if (!vehicles.length) return null

  return (
    <section className="floor-rail relative overflow-x-hidden py-10 md:py-16">
      <div className="shell">
        {/* Heading */}
        <p className={`font-mono text-[0.66rem] uppercase tracking-[0.26em] ${light ? 'text-amber' : 'text-scarlet-soft'}`}>
          Current line-up
        </p>
        <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)] text-white">
          On the <span className={light ? 'text-signal' : 'text-amber'}>floor</span>
        </h2>

        {/* Accordion gallery */}
        <div className="mt-8">
          <AccordionGallery
            vehicles={vehicles}
            defaultIndex={0}
            height={500}
            expandRatio={0.52}
            gap={10}
            radius={14}
            tilt={7}
            parallax={0.5}
            duration={0.55}
            ease="power3.out"
            stagger={0.06}
            light={light}
            onActiveChange={setActiveIdx}
          />
        </div>

        {/* Active vehicle detail strip */}
        <div
          key={active.id}
          className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
          style={{
            animation: 'floor-detail-in 0.4s cubic-bezier(0.34,1.4,0.64,1) both',
          }}
        >
          <div>
            <p className={`font-mono text-[0.6rem] uppercase tracking-[0.22em] ${light ? 'text-signal' : 'text-amber'}`}>
              {active.statusLabel}
            </p>
            <h3 className="display mt-2 text-[clamp(1.8rem,3.5vw,2.8rem)] text-white">
              {active.name}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/65">
              {active.summary}
            </p>

            {/* Specs row */}
            {(active.specs.power || active.specs.acceleration || active.specs.topSpeed) && (
              <div className="mt-5 flex flex-wrap gap-6">
                {active.specs.acceleration && (
                  <div>
                    <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-white/40">0–100 km/h</p>
                    <p className="display mt-1 text-xl text-white">{active.specs.acceleration}</p>
                  </div>
                )}
                {active.specs.power && (
                  <div>
                    <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-white/40">Output</p>
                    <p className="display mt-1 text-xl text-white">{active.specs.power}</p>
                  </div>
                )}
                {active.specs.topSpeed && (
                  <div>
                    <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-white/40">V-max</p>
                    <p className="display mt-1 text-xl text-white">{active.specs.topSpeed}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <ButtonLink
            href={`/cars/${active.slug}`}
            variant={light ? 'deep' : 'primary'}
            className="shrink-0"
          >
            Inspect {active.name}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
