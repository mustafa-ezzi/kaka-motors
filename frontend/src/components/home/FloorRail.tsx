import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import type { Vehicle } from '../../lib/types'
import { ButtonLink } from '../ButtonLink'
import { ShowroomImage } from '../ShowroomImage'

export function FloorRail({ vehicles, light = false }: { vehicles: Vehicle[]; light?: boolean }) {
  const pinRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const pin = pinRef.current
      const track = trackRef.current
      if (!pin || !track || vehicles.length === 0) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80)
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        requestAnimationFrame(() => ScrollTrigger.refresh())
      })

      return () => mm.revert()
    },
    { scope: pinRef, dependencies: [vehicles.length], revertOnUpdate: true },
  )

  return (
    <section ref={pinRef} className="floor-rail relative overflow-hidden">
      <div className="shell py-10 md:py-14">
        <p className={`font-mono text-[0.66rem] uppercase tracking-[0.26em] ${light ? 'text-amber' : 'text-scarlet-soft'}`}>
          Current line-up
        </p>
        <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)] text-white">
          On the <span className={light ? 'text-signal' : 'text-amber'}>floor</span>
        </h2>
      </div>
      <div ref={trackRef} className="flex w-max gap-5 px-6 pb-16 md:px-[max(1.5rem,calc((100%-78rem)/2+1.5rem))]">
        {vehicles.map((car) => (
          <article
            key={car.id}
            className={`relative h-[70vh] w-[min(82vw,780px)] shrink-0 overflow-hidden bg-panel ${
              light ? 'panel-light rounded-2xl' : ''
            }`}
          >
            <ShowroomImage
              src={car.cardImageUrl}
              srcSet={car.cardSrcSet}
              alt={car.name}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 82vw, 780px"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 bg-carbon/95 px-8 py-6">
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-amber">{car.statusLabel}</p>
                <h3 className="display mt-2 text-[clamp(2rem,4vw,3.4rem)] text-white">{car.name}</h3>
                <p className="mt-2 max-w-md text-sm text-white/65">{car.summary}</p>
              </div>
              <ButtonLink href={`/cars/${car.slug}`} variant={light ? 'deep' : 'primary'}>
                Inspect
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
