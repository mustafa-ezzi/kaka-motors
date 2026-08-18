import { useCallback, useRef, useState } from 'react'
import { featuredVehicle, publishedVehicles, useCatalog } from '../lib/catalog'
import { gsap, useGSAP } from '../lib/gsap'
import { ButtonLink } from '../components/ButtonLink'
import { CatalogState } from '../components/CatalogState'
import { CoverflowCarousel, HeroCarousel } from '../components/home/HeroCarousel'
import { FloorRail } from '../components/home/FloorRail'
import { BentoShowroom } from '../components/home/BentoShowroom'
import { HomeBackdrop } from '../components/home/HomeBackdrop'
import { NameMarquee } from '../components/home/NameMarquee'
import { orgJsonLd, Seo } from '../components/Seo'

export function HomePage() {
  const { vehicles, content, loading, error } = useCatalog()
  const featured = featuredVehicle(vehicles)
  const lineup = publishedVehicles(vehicles)
  const pageRef = useRef<HTMLDivElement>(null)
  const start = Math.max(0, lineup.findIndex((car) => car.featuredOnHome))
  const [index, setIndex] = useState(start)
  const onIndex = useCallback((next: number) => {
    setIndex(next)
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.home-reveal').forEach((el) => {
          gsap.from(el, {
            y: 36,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: pageRef, dependencies: [lineup.length], revertOnUpdate: true },
  )

  if (loading || error || !featured) {
    return <CatalogState loading={loading} error={error} empty={!featured} />
  }

  const active = lineup[index] ?? featured

  return (
    <div ref={pageRef} className="relative">
      <Seo
        title="Kaka Motors — Performance, with a point of view."
        description={content.homeNarrative}
        path="/"
        image={active.heroImageUrl}
        jsonLd={orgJsonLd}
      />
      <HomeBackdrop vehicles={lineup} index={index} />

      <HeroCarousel
        vehicles={lineup}
        ctaLabel={content.homeCtaLabel}
        eyebrow={content.homeEyebrow}
        headline={content.homeHeadline}
        index={index}
        onIndex={onIndex}
      />

      <div className="h-[24vh] md:h-[36vh]" aria-hidden />

      <NameMarquee names={lineup.map((car) => car.name)} />

      <section className="home-reveal shell py-24 md:py-32">
        <div className="tile crystal crystal-ink grid gap-8 p-6 md:grid-cols-[0.8fr_1.2fr] md:items-end md:p-10">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-amber">The studio</p>
          <div>
            <h2 className="display text-[clamp(2.1rem,4.4vw,3.6rem)] text-white">
              Fewer cars. <span className="text-amber">Better light.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80">{content.homeNarrative}</p>
          </div>
        </div>
      </section>

      <div className="h-[20vh] md:h-[32vh]" aria-hidden />

      <div className="home-reveal">
        <BentoShowroom vehicles={lineup} featured={active} responseTime={content.responseTimeCopy} />
      </div>

      <div className="h-[20vh] md:h-[32vh]" aria-hidden />

      <section className="home-reveal pb-8">
        <div className="shell mb-10">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-amber">Turntable</p>
          <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)] text-white">
            Pick a <span className="text-signal">machine</span>.
          </h2>
        </div>
        <CoverflowCarousel vehicles={lineup} light />
      </section>

      <div className="h-[18vh] md:h-[28vh]" aria-hidden />

      <FloorRail vehicles={lineup} light />

      <div className="h-[18vh] md:h-[28vh]" aria-hidden />

      <section className="home-reveal shell py-16 pb-28">
        <div className="tile crystal crystal-ink relative px-6 py-14 md:px-14">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-signal" />
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-amber">Private drive</p>
          <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] text-white">
            Book the studio. Bring a date, not a crowd.
          </h2>
          <p className="mt-4 max-w-lg text-white/80">
            Appointments in Karachi are confirmed {content.responseTimeCopy}. Details stay with Kaka Motors.
          </p>
          <div className="mt-8">
            <ButtonLink href="/test-drive" variant="light">
              Reserve a drive
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
