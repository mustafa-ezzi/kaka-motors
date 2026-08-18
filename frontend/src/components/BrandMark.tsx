import { Link } from 'wouter'

export function BrandMark({ compact = false, onLight = false }: { compact?: boolean; onLight?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3 focus-scarlet">
      <span className="relative grid h-8 w-8 place-items-center">
        <span className="absolute inset-0 rotate-45 border border-scarlet/90 transition-transform duration-500 group-hover:rotate-[225deg]" />
        <span className="h-2 w-2 bg-signal" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.05rem] font-bold tracking-tight ${onLight ? 'text-carbon' : 'text-fog'}`}>
          Kaka Motors
        </span>
        {!compact && (
          <span className={`mt-1 font-mono text-[0.58rem] uppercase tracking-[0.28em] ${onLight ? 'text-carbon/55' : 'text-white/45'}`}>
            Private studio
          </span>
        )}
      </span>
    </Link>
  )
}
