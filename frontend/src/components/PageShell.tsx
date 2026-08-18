import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'wouter'

export function PageShell({ children }: { children: ReactNode }) {
  const [location] = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className={`relative z-10 ${location === '/' || location === '/about' ? '' : 'overflow-x-clip'}`}
        id="main"
        tabIndex={-1}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  )
}
