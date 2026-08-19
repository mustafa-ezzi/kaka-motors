import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import type { Vehicle } from '../../lib/types'

interface Props {
  vehicles: Vehicle[]
  defaultIndex?: number
  height?: number
  expandRatio?: number
  duration?: number
  ease?: string
  parallax?: number
  tilt?: number
  stagger?: number
  gap?: number
  radius?: number
  light?: boolean
  onActiveChange?: (index: number) => void
}

export function AccordionGallery({
  vehicles,
  defaultIndex = 0,
  height = 520,
  expandRatio = 0.52,
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 7,
  stagger = 0.06,
  gap = 10,
  radius = 16,
  light = false,
  onActiveChange,
}: Props) {
  const count = vehicles.length
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1))

  const rootRef    = useRef<HTMLDivElement>(null)
  const panelRefs  = useRef<(HTMLAnchorElement | null)[]>([])
  const mediaRefs  = useRef<(HTMLSpanElement | null)[]>([])
  const barRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const textRefs   = useRef<(HTMLSpanElement | null)[]>([])
  const tlRef      = useRef<gsap.core.Timeline | null>(null)
  const firstRun   = useRef(true)
  const mediaSzRef = useRef(320)

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const amber  = light ? '#22d3ee' : '#f0b429'   // signal vs amber
  const overlay = '#050b14'                        // ink

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current
      if (!panels.length) return

      const r    = Math.min(Math.max(expandRatio, 0.2), 0.9)
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1
      const sz   = mediaSzRef.current
      const dur  = animate && !prefersReduced ? duration : 0

      tlRef.current?.kill()
      const tl = gsap.timeline()

      panels.forEach((panel, i) => {
        if (!panel) return
        const isActive = i === active
        const media    = mediaRefs.current[i]
        const bar      = barRefs.current[i]
        const text     = textRefs.current[i]

        const rot = isActive ? 0 : i < active ? tilt : -tilt

        tl.to(panel, { flexGrow: isActive ? grow : 1, rotateY: rot, duration: dur, ease }, 0)

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i))
          const shift = drift * parallax * sz * 0.06
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: isActive ? 0 : shift,
              '--ag-gray': isActive ? 0 : 1,
              '--ag-dim': isActive ? 0 : 0.45,
              duration: dur,
              ease,
            },
            0,
          )
        }

        if (bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0)
          } else {
            tl.to([bar, text], { opacity: 0, x: -12, duration: dur * 0.6, ease }, 0)
          }
        }
      })

      tlRef.current = tl
    },
    [active, count, expandRatio, duration, ease, tilt, parallax, stagger, prefersReduced],
  )

  // Measure + ResizeObserver
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => {
      const rect  = el.getBoundingClientRect()
      const usable = Math.max(rect.width - gap * (count - 1), 120)
      const size  = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22)
      mediaSzRef.current = size
      el.style.setProperty('--ag-media-size', `${size}px`)
      applyLayout(!firstRun.current)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [applyLayout, gap, count, expandRatio])

  useEffect(() => {
    applyLayout(!firstRun.current)
    firstRun.current = false
  }, [applyLayout])

  useEffect(() => () => { tlRef.current?.kill() }, [])

  const activate = (i: number) => {
    setActive(i)
    onActiveChange?.(i)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); activate((i + 1) % count) }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); activate((i - 1 + count) % count) }
  }

  return (
    <div
      ref={rootRef}
      className="flex w-full [perspective:1400px]"
      style={{ gap: `${gap}px`, height: `${height}px` }}
      role="list"
      aria-label="Vehicle accordion"
    >
      {vehicles.map((car, i) => {
        const isActive = i === active
        return (
          <a
            key={car.id}
            ref={el => { panelRefs.current[i] = el }}
            href={`/cars/${car.slug}`}
            onClick={e => { if (!isActive) { e.preventDefault(); activate(i) } }}
            onMouseEnter={() => activate(i)}
            onFocus={() => activate(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={car.name}
            className="group relative block min-w-0 flex-[1_1_0] cursor-pointer overflow-hidden no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] focus-visible:ring-2 focus-visible:ring-amber"
            style={{
              borderRadius: `${radius}px`,
              willChange: 'flex-grow, transform',
              boxShadow: '0 12px 36px -16px rgba(0,0,0,0.85)',
              background: '#050b14',
            }}
          >
            {/* Image layer */}
            <span className="absolute inset-0 overflow-hidden [border-radius:inherit]">
              <span
                ref={el => { mediaRefs.current[i] = el }}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 'var(--ag-media-size, 320px)',
                  height: '100%',
                  willChange: 'transform, filter',
                  // @ts-ignore css custom props
                  filter: 'grayscale(var(--ag-gray, 1))',
                  '--ag-gray': 1,
                  '--ag-dim': 0.45,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img
                  src={car.cardImageUrl}
                  srcSet={car.cardSrcSet || undefined}
                  sizes="(max-width: 768px) 90vw, 600px"
                  alt={car.name}
                  draggable={false}
                  className="block h-full w-full select-none object-cover"
                />
              </span>

              {/* Gradient overlay */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 40%, ${overlay}cc 100%), color-mix(in srgb, ${overlay} calc(var(--ag-dim, 0.45) * 100%), transparent)`,
                }}
              />
            </span>

            {/* Label */}
            <span
              className="pointer-events-none absolute bottom-6 left-6 right-6 z-10 flex items-center gap-3"
              aria-hidden
            >
              <span
                ref={el => { barRefs.current[i] = el }}
                className="h-7 w-[3px] flex-none rounded-full opacity-0"
                style={{ background: amber, boxShadow: `0 0 14px ${amber}99` }}
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span
                  className="font-mono text-[0.58rem] uppercase tracking-[0.22em] opacity-60"
                  style={{ color: amber }}
                >
                  {car.statusLabel}
                </span>
                <span
                  ref={el => { textRefs.current[i] = el }}
                  className="truncate font-display text-[clamp(1.1rem,1.6vw,1.7rem)] font-semibold leading-tight text-white opacity-0 [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]"
                >
                  {car.name}
                </span>
              </span>
            </span>
          </a>
        )
      })}
    </div>
  )
}
