import { motion, type Variants } from 'framer-motion'
import { Clock, MapPin, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { AboutBackdrop } from '../components/about/AboutBackdrop'
import { ButtonLink } from '../components/ButtonLink'
import { NameMarquee } from '../components/home/NameMarquee'
import { orgJsonLd, Seo } from '../components/Seo'
import { publishedVehicles, useCatalog } from '../lib/catalog'
import { gsap, useGSAP } from '../lib/gsap'

const valueTones = ['crystal-ruby', 'crystal-petrol', 'crystal-ember'] as const

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

const tile: Variants = {
  hidden: { opacity: 0, y: 28 },
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

const beats = [
  {
    n: '01',
    title: 'The room',
    body: 'One floor in Karachi. Lights set before you arrive. No branches, no queue.',
  },
  {
    n: '02',
    title: 'The catalog',
    body: 'Short on purpose. Inventory moves. The standard does not.',
  },
  {
    n: '03',
    title: 'The conversation',
    body: 'It starts after you have already decided you want to drive.',
  },
]

export function AboutPage() {
  const { content, vehicles, cities } = useCatalog()
  const lineup = publishedVehicles(vehicles)
  const pageRef = useRef<HTMLDivElement>(null)
  const city = cities[0] ?? 'Karachi'

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.about-reveal').forEach((el) => {
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              toggleActions: 'play none none none',
            },
          })
        })

        const count = pageRef.current?.querySelector<HTMLElement>('.about-count')
        if (count && lineup.length) {
          const obj = { n: 0 }
          gsap.to(obj, {
            n: lineup.length,
            duration: 1.15,
            ease: 'power2.out',
            snap: { n: 1 },
            scrollTrigger: {
              trigger: count,
              start: 'top bottom',
              toggleActions: 'play none none none',
            },
            onUpdate: () => {
              count.textContent = String(Math.round(obj.n)).padStart(2, '0')
            },
          })
        }
      })
      return () => mm.revert()
    },
    { scope: pageRef, dependencies: [lineup.length, content.aboutIntro], revertOnUpdate: true },
  )

  return (
    <div ref={pageRef} className="relative">
      <Seo
        title="Our Story — Kaka Motors"
        description={content.aboutIntro}
        path="/about"
        jsonLd={orgJsonLd}
      />
      <AboutBackdrop />

      <section className="shell relative flex min-h-[92svh] flex-col justify-end pb-16 pt-32 md:pb-24">
        <p className="about-reveal font-mono text-[0.66rem] uppercase tracking-[0.28em] text-amber">Our story</p>
        <h1 className="about-reveal display mt-5 max-w-4xl text-[clamp(3rem,8vw,6.4rem)] text-white">
          A studio, <span className="text-amber">not a lot.</span>
        </h1>
        <p className="about-reveal mt-7 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
          {content.aboutIntro}
        </p>
        <div className="about-reveal mt-10 flex flex-wrap gap-2">
          {[city, 'By appointment', 'Private floor'].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white"
            >
              {chip}
            </span>
          ))}
        </div>
      </section>

      <div className="h-[16vh] md:h-[24vh]" aria-hidden />

      <section className="about-reveal shell">
        <blockquote className="tile crystal crystal-ink relative px-6 py-12 md:px-14 md:py-16">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-signal" />
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-amber">Founder note</p>
          <p className="display mt-6 max-w-3xl text-[clamp(1.6rem,3.6vw,3.1rem)] leading-[1.08] text-white">
            “{content.founderQuote}”
          </p>
          <footer className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/55">
            {content.founderName}
          </footer>
        </blockquote>
      </section>

      <div className="h-[14vh] md:h-[22vh]" aria-hidden />

      <section className="about-reveal shell grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
        <article className="tile crystal crystal-ink p-6 md:p-10">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-amber">History</p>
          <h2 className="display mt-4 text-[clamp(2rem,4vw,3.2rem)] text-white">
            Karachi first. <span className="text-signal">Karachi only.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80">{content.brandHistory}</p>
        </article>

        <div className="grid gap-5">
          <article className="tile crystal crystal-ruby p-6">
            <Sparkles size={18} className="text-amber" />
            <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">On the floor</p>
            <p className="about-count display mt-2 text-5xl text-white">
              {String(lineup.length).padStart(2, '0')}
            </p>
            <p className="mt-2 text-sm text-white/80">Machines, curated by hand.</p>
          </article>
          <article className="tile crystal crystal-petrol p-6">
            <MapPin size={18} className="text-amber" />
            <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">Studio</p>
            <p className="display mt-2 text-3xl text-white">{city}</p>
          </article>
          <article className="tile crystal crystal-ember p-6">
            <Clock size={18} className="text-amber" />
            <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-amber">We reply</p>
            <p className="display mt-2 text-2xl text-white">{content.responseTimeCopy}</p>
          </article>
        </div>
      </section>

      <div className="h-[12vh] md:h-[18vh]" aria-hidden />

      <section className="shell grid items-start gap-8 py-8 md:grid-cols-[0.72fr_1.28fr] md:gap-12">
        <div className="about-reveal md:sticky md:top-28">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-amber">The Kaka code</p>
          <h2 className="display mt-4 text-[clamp(2.2rem,4.4vw,3.6rem)] text-white">
            Three rules. <span className="text-ember">No decoration.</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
            Scarlet is a signal. Glass is a layer. The car stays the protagonist.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.16 }}
          className="grid gap-5"
        >
          {content.values.map((value, index) => (
            <motion.article
              key={value.title}
              variants={tile}
              whileHover={lift}
              className={`tile crystal ${valueTones[index % valueTones.length]} p-6 md:p-8`}
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-amber">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="display mt-4 text-3xl text-white md:text-4xl">{value.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">{value.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <div className="h-[12vh] md:h-[18vh]" aria-hidden />

      <section className="about-reveal shell">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-amber">How the floor works</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {beats.map((beat) => (
            <article key={beat.n} className="tile crystal crystal-ink p-6 md:p-8">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-signal">{beat.n}</p>
              <h3 className="display mt-5 text-2xl text-white md:text-3xl">{beat.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{beat.body}</p>
            </article>
          ))}
        </div>
      </section>

      {lineup.length > 0 && (
        <div className="mt-16 md:mt-24">
          <NameMarquee names={lineup.map((car) => car.name)} />
        </div>
      )}

      <div className="h-[12vh] md:h-[18vh]" aria-hidden />

      <section className="about-reveal shell pb-24 md:pb-32">
        <div className="tile crystal crystal-signal relative px-6 py-14 md:px-14">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-amber" />
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-amber">{city}</p>
          <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] text-white">The studio</h2>
          <p className="mt-4 max-w-lg text-white/85">{content.studioBlurb}</p>
          <div className="mt-8">
            <ButtonLink href="/test-drive" variant="light">
              Book a test drive
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
