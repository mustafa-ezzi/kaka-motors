const hues = ['text-signal', 'text-ember', 'text-amber', 'text-jade', 'text-copper']

export function NameMarquee({ names }: { names: string[] }) {
  if (names.length === 0) return null
  const loop = [...names, ...names]

  return (
    <div className="overflow-hidden border-y border-white/10 bg-carbon/80 py-4 backdrop-blur-sm" aria-hidden>
      <div className="name-marquee flex w-max gap-10 whitespace-nowrap">
        {loop.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className={`flex items-center gap-10 font-display text-2xl font-bold tracking-tight md:text-3xl ${hues[index % hues.length]}`}
          >
            {name}
            <span className="text-white/35">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
