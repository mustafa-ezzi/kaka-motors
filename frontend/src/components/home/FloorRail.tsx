import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import type { Vehicle } from '../../lib/types'
import { ButtonLink } from '../ButtonLink'
import { ShowroomImage } from '../ShowroomImage'

// ─── Mobile swipe carousel ───────────────────────────────────────────────────

function MobileCarousel({ vehicles, light }: { vehicles: Vehicle[]; light: boolean }) {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)

  // Sync active index with scroll-snap position
  const onScroll = useCallback(() => {
    if (isScrolling.current) return
    const el = trackRef.current
    if (!el) return
    const cardWidth = el.offsetWidth
    const idx = Math.round(el.scrollLeft / cardWidth)
    setActive(Math.min(Math.max(idx, 0), vehicles.length - 1))
  }, [vehicles.length])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  const scrollTo = (idx: number) => {
    const el = trackRef.current
    if (!el) return
    isScrolling.current = true
    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' })
    setActive(idx)
    setTimeout(() => { isScrolling.current = false }, 600)
  }

  return (
    <div className="relative">
      {/* Background image crossfade */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {vehicles.map((car, i) => (
          <div
            key={car.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: i === active ? 0.18 : 0,
              backgroundImage: `url(${car.cardImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: i === active ? 'scale(1)' : 'scale(1.06)',
              transition: 'opacity 700ms ease, transform 700ms ease',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 to-ink/90" />
      </div>

      {/* Scroll-snap track */}
      <div
        ref={trackRef}
        className="relative flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {vehicles.map((car, i) => (
          <article
            key={car.id}
            className="snap-center shrink-0 w-full px-5 py-8"
            style={{ scrollSnapAlign: 'center' }}
          >
            {/* Card image with scale-in when active */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                aspectRatio: '4/5',
                transform: i === active ? 'scale(1)' : 'scale(0.96)',
                transition: 'transform 500ms cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <ShowroomImage
                src={car.cardImageUrl}
                srcSet={car.cardSrcSet}
                alt={car.name}
                className="h-full w-full object-cover"
                sizes="90vw"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

              {/* Text overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className={`font-mono text-[0.6rem] uppercase tracking-[0.22em] ${light ? 'text-signal' : 'text-amber'}`}>
                  {car.statusLabel}
                </p>
                <h3
                  className="display mt-2 text-white"
                  style={{
                    fontSize: 'clamp(1.8rem,6vw,2.4rem)',
                    opacity: i === active ? 1 : 0.4,
                    transform: i === active ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 400ms ease, transform 400ms ease',
                  }}
                >
                  {car.name}
                </h3>
                <p
                  className="mt-2 text-sm text-white/65 line-clamp-2"
                  style={{
                    opacity: i === active ? 1 : 0,
                    transition: 'opacity 400ms ease 80ms',
                  }}
                >
                  {car.summary}
                </p>
                <div
                  className="mt-5"
                  style={{
                    opacity: i === active ? 1 : 0,
                    transform: i === active ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 350ms ease 120ms, transform 350ms ease 120ms',
                  }}
                >
                  <ButtonLink href={`/cars/${car.slug}`} variant={light ? 'deep' : 'primary'}>
                    Inspect ↗
                  </ButtonLink>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Dot indicators */}
      {vehicles.length > 1 && (
        <div className="relative flex justify-center gap-2 pb-8" role="tablist" aria-label="Select car">
          {vehicles.map((car, i) => (
            <button
              key={car.id}
              role="tab"
              aria-selected={i === active}
              aria-label={car.name}
              onClick={() => scrollTo(i)}
              className="h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              style={{
                width: i === active ? '2rem' : '0.5rem',
                background: i === active
                  ? (light ? 'var(--color-signal, #22d3ee)' : 'var(--color-amber, #f59e0b)')
                  : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Desktop horizontal scroll rail ──────────────────────────────────────────

function DesktopRail({ vehicles, light }: { vehicles: Vehicle[]; light: boolean }) {
  const pinRef = useRef<HTMLDivElement>(null)
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
    <div ref={pinRef} className="relative overflow-hidden">
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
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export function FloorRail({ vehicles, light = false }: { vehicles: Vehicle[]; light?: boolean }) {
  return (
    <section className="floor-rail relative">
      <div className="shell py-10 md:py-14">
        <p className={`font-mono text-[0.66rem] uppercase tracking-[0.26em] ${light ? 'text-amber' : 'text-scarlet-soft'}`}>
          Current line-up
        </p>
        <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)] text-white">
          On the <span className={light ? 'text-signal' : 'text-amber'}>floor</span>
        </h2>
      </div>

      {/* Mobile: swipe carousel */}
      <div className="md:hidden">
        <MobileCarousel vehicles={vehicles} light={light} />
      </div>

      {/* Desktop: GSAP horizontal pin */}
      <div className="hidden md:block overflow-hidden">
        <DesktopRail vehicles={vehicles} light={light} />
      </div>
    </section>
  )
}
