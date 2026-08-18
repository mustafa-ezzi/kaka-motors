import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Vehicle } from '../../lib/types'
import { ShowroomImage } from '../ShowroomImage'

export function HomeBackdrop({ vehicles, index }: { vehicles: Vehicle[]; index: number }) {
  const active = vehicles[index]

  useEffect(() => {
    document.documentElement.classList.add('home-stage')
    return () => document.documentElement.classList.remove('home-stage')
  }, [])

  useEffect(() => {
    if (!active?.heroImageUrl) return
    let link = document.head.querySelector<HTMLLinkElement>('link[data-km-hero]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.setAttribute('data-km-hero', '1')
      document.head.appendChild(link)
    }
    link.href = active.heroImageUrl
    if (active.heroSrcSet) link.setAttribute('imagesrcset', active.heroSrcSet)
  }, [active?.heroImageUrl, active?.heroSrcSet])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="home-backdrop pointer-events-none" aria-hidden>
      {vehicles.map((car, carIndex) => (
        <div
          key={car.id}
          className="absolute inset-0"
          style={{ opacity: carIndex === index ? 1 : 0, transition: 'opacity 700ms ease' }}
        >
          <ShowroomImage
            src={car.heroImageUrl}
            srcSet={car.heroSrcSet}
            alt=""
            decorative
            priority={carIndex === index}
            objectPosition={car.heroObjectPosition ?? 'center 38%'}
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-[#0f1318]/25" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,19,24,0.55)_0%,rgba(15,19,24,0.12)_52%,rgba(15,19,24,0.4)_100%)]" />
    </div>,
    document.body,
  )
}
