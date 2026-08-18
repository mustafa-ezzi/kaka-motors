import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import studioInterior from '../../assets/studio-interior.png'
import { ShowroomImage } from '../ShowroomImage'

export function AboutBackdrop() {
  useEffect(() => {
    document.documentElement.classList.add('about-stage')
    return () => document.documentElement.classList.remove('about-stage')
  }, [])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="home-backdrop pointer-events-none" aria-hidden>
      <ShowroomImage
        src={studioInterior}
        alt=""
        decorative
        priority
        className="about-stage-photo absolute inset-0 h-full w-full object-cover object-[center_42%]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[#0f1318]/40" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,19,24,0.55)_0%,rgba(15,19,24,0.12)_38%,rgba(15,19,24,0.72)_100%)]" />
    </div>,
    document.body,
  )
}
