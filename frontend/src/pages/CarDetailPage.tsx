import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'wouter'
import { ArrowLeft, Heart } from 'lucide-react'
import { ButtonLink } from '../components/ButtonLink'
import { CatalogState } from '../components/CatalogState'
import { Seo } from '../components/Seo'
import { ShowroomImage } from '../components/ShowroomImage'
import { SpecGrid } from '../components/SpecGrid'
import { useVehicle } from '../lib/catalog'
import { NotFoundPage } from './NotFoundPage'

const SHORTLIST_KEY = 'kaka-shortlist'

function readShortlist() {
  try {
    return JSON.parse(localStorage.getItem(SHORTLIST_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function CarDetailPage() {
  const params = useParams<{ slug: string }>()
  const { vehicle: car, loading, error, notFound } = useVehicle(params.slug ?? '')
  const [active, setActive] = useState(0)
  const [saved, setSaved] = useState(false)

  const rawMedia = car?.gallery ?? []
  // If no gallery, synthesise entries from hero / card images so the viewer always shows something
  const media = useMemo(() => {
    if (rawMedia.length > 0) return rawMedia
    const fallbacks = []
    if (car?.heroImageUrl) {
      fallbacks.push({
        id: 'hero',
        kind: 'image' as const,
        imageUrl: car.heroImageUrl,
        imageSrcSet: car.heroSrcSet,
        alt: car.name,
        objectPosition: car.heroObjectPosition ?? 'center',
        sortOrder: 0,
        label: 'Exterior',
      })
    }
    if (car?.cardImageUrl && car.cardImageUrl !== car?.heroImageUrl) {
      fallbacks.push({
        id: 'card',
        kind: 'image' as const,
        imageUrl: car.cardImageUrl,
        imageSrcSet: car.cardSrcSet,
        alt: car.name,
        objectPosition: 'center',
        sortOrder: 1,
        label: 'Studio',
      })
    }
    return fallbacks
  }, [rawMedia, car])
  const current = media[active] ?? media[0]
  const tabs = useMemo(() => media, [media])

  useEffect(() => {
    setActive(0)
    if (car) setSaved(readShortlist().includes(car.slug))
  }, [car])

  if (loading || error) {
    return <CatalogState loading={loading} error={error} />
  }
  if (notFound || !car) {
    return <NotFoundPage />
  }

  function toggleShortlist() {
    if (!car) return
    const slug = car.slug
    const next = new Set(readShortlist())
    if (next.has(slug)) {
      next.delete(slug)
      setSaved(false)
    } else {
      next.add(slug)
      setSaved(true)
    }
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify([...next]))
  }

  return (
    <article className="pb-20 pt-28 md:pt-36">
      <Seo
        title={`${car.name} — Kaka Motors`}
        description={car.summary}
        path={`/cars/${car.slug}`}
        image={car.heroImageUrl}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Vehicle',
          name: car.name,
          description: car.summary,
          image: car.heroImageUrl,
          brand: { '@type': 'Brand', name: 'Kaka Motors' },
        }}
      />

      {/* Header */}
      <div className="shell">
        <Link
          href="/showcase"
          className="focus-scarlet inline-flex min-h-11 items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/55 hover:text-scarlet-soft"
        >
          <ArrowLeft size={14} /> Back to collection
        </Link>
        <p className="eyebrow mt-4">{car.statusLabel}</p>
        <h1 className="display mt-2 text-[clamp(2.2rem,7vw,6rem)] leading-[1.02]">{car.name}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">{car.summary}</p>
      </div>

      {/* Image viewer */}
      <div className="shell mt-7 md:mt-9">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-panel"
          style={{ aspectRatio: '16 / 10' }}
        >
          {current && (
            <ShowroomImage
              key={current.id}
              src={current.imageUrl}
              srcSet={current.imageSrcSet}
              alt={current.alt || `${car.name} studio view`}
              objectPosition={current.objectPosition ?? 'center'}
              priority
              className="absolute inset-0 h-full w-full object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        </div>

        {/* Gallery switcher */}
        {tabs.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tabs.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                className={`focus-scarlet min-h-10 rounded-full px-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-colors ${
                  active === index
                    ? 'bg-white text-ink'
                    : 'border border-white/15 text-white/55 hover:border-white/40 hover:text-white'
                }`}
              >
                {item.label ?? `View ${index + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body content */}
      <div className="shell mt-10 grid gap-10 md:mt-14 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-12">
        <div>
          <p className="text-sm leading-relaxed text-white/70 md:text-base">{car.description}</p>

          {car.interiorStory && (
            <div className="mt-9">
              <p className="eyebrow">Interior</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">{car.interiorStory}</p>
            </div>
          )}

          {car.features.length > 0 && (
            <div className="mt-9">
              <p className="eyebrow">Equipment</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {car.features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-white/65"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-5 md:sticky md:top-28">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <SpecGrid specs={car.specs} />
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={`/test-drive?car=${car.slug}`}>Reserve a drive</ButtonLink>
            <button
              type="button"
              onClick={toggleShortlist}
              className={`focus-scarlet inline-flex min-h-11 items-center gap-2 rounded-full border px-5 font-mono text-[0.66rem] uppercase tracking-[0.18em] transition-colors ${
                saved ? 'border-scarlet text-scarlet-soft' : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'
              }`}
              aria-pressed={saved}
            >
              <Heart size={13} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Shortlisted' : 'Shortlist'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
