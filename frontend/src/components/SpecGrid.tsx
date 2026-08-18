export function SpecGrid({
  specs,
}: {
  specs: { power: string; acceleration: string; topSpeed: string; transmission?: string; weightBias?: string; length?: string }
}) {
  const items = [
    { label: 'Power', value: specs.power },
    { label: '0–100', value: specs.acceleration },
    { label: 'Top speed', value: specs.topSpeed },
    specs.transmission ? { label: 'Gearbox', value: specs.transmission } : null,
    specs.weightBias ? { label: 'Bias', value: specs.weightBias } : null,
    specs.length ? { label: 'Length', value: specs.length } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <dl className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="bg-ink px-4 py-5">
          <dt className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-white/40">{item.label}</dt>
          <dd className="display mt-2 text-2xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
