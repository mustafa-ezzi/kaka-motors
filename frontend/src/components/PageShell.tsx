import { useEffect, useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'wouter'
import { ScrollTrigger } from '../lib/gsap'

export function PageShell({ children }: { children: ReactNode }) {
  const [location] = useLocation()

  // Wouter keeps the previous scroll offset on navigation, which lands the user
  // in empty space below a shorter page.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 140)
    return () => window.clearTimeout(id)
  }, [location])

  return (
    <main key={location} className="page-enter relative z-10" id="main" tabIndex={-1}>
      {children}
    </main>
  )
}
