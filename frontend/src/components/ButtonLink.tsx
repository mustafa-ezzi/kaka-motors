import { ArrowUpRight } from 'lucide-react'
import { Link } from 'wouter'
import type { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'light' | 'ghost' | 'outline' | 'deep'
  className?: string
}

export function ButtonLink({ href, children, variant = 'primary', className = '' }: Props) {
  const styles = {
    primary:
      'bg-scarlet text-white hover:bg-scarlet-hover',
    light:
      'bg-white text-[#0f1318] hover:bg-amber',
    ghost:
      'border border-white/25 text-fog hover:border-white hover:text-white',
    outline:
      'border border-carbon/25 text-carbon hover:border-carbon hover:bg-carbon hover:text-white',
    deep:
      'bg-crimson text-white hover:bg-oxblood',
  }[variant]

  return (
    <Link
      href={href}
      className={`focus-scarlet inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] transition-colors ${styles} ${className}`}
    >
      {children}
      <ArrowUpRight size={14} />
    </Link>
  )
}
