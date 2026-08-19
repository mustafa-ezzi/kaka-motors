import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useSearch } from 'wouter'
import { CatalogState } from '../components/CatalogState'
import { Seo } from '../components/Seo'
import { ShowroomImage } from '../components/ShowroomImage'
import { ApiError, apiPost } from '../lib/api'
import { featuredVehicle, publishedVehicles, useCatalog } from '../lib/catalog'
import { testDriveSchema } from '../lib/test-drive'

type FormState = {
  name: string
  email: string
  phone: string
  date: string
  slot: 'morning' | 'afternoon' | 'evening'
  city: string
  vehicleSlug: string
  message: string
  consent: boolean
  hpField: string
}

type FieldKey = 'name' | 'email' | 'phone' | 'date' | 'slot' | 'vehicleSlug' | 'consent'

type CreatedRequest = {
  reference: string
  name: string
}

const FIELD_IDS: Record<FieldKey, string> = {
  name: 'drive-name',
  email: 'drive-email',
  phone: 'drive-phone',
  date: 'drive-date',
  slot: 'drive-slot',
  vehicleSlug: 'drive-vehicle',
  consent: 'drive-consent',
}

export function TestDrivePage() {
  const search = useSearch()
  const { vehicles, cities, content, loading, error } = useCatalog()
  const cars = publishedVehicles(vehicles)
  const featured = featuredVehicle(vehicles)
  const requested = new URLSearchParams(search).get('car')
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    date: '',
    slot: 'afternoon',
    city: cities[0] ?? 'Karachi',
    vehicleSlug: requested && cars.some((car) => car.slug === requested) ? requested : (featured?.slug ?? ''),
    message: '',
    consent: false,
    hpField: '',
  })
  const [errors, setErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [created, setCreated] = useState<CreatedRequest | null>(null)
  const [pending, setPending] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setForm((current) => {
      const nextCity = cities.includes(current.city) ? current.city : (cities[0] ?? current.city)
      const nextSlug =
        cars.some((car) => car.slug === current.vehicleSlug)
          ? current.vehicleSlug
          : requested && cars.some((car) => car.slug === requested)
            ? requested
            : (featured?.slug ?? current.vehicleSlug)
      if (nextCity === current.city && nextSlug === current.vehicleSlug) return current
      return { ...current, city: nextCity, vehicleSlug: nextSlug }
    })
  }, [cars, cities, featured?.slug, requested])

  const selected = useMemo(
    () => cars.find((car) => car.slug === form.vehicleSlug) ?? featured,
    [cars, featured, form.vehicleSlug],
  )

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const parsed = testDriveSchema.safeParse(form)
    if (!parsed.success) {
      const nextFields: Partial<Record<FieldKey, string>> = {}
      const nextList: string[] = []
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (typeof key === 'string' && key in FIELD_IDS && !nextFields[key as FieldKey]) {
          nextFields[key as FieldKey] = issue.message
        }
        if (!nextList.includes(issue.message)) nextList.push(issue.message)
      })
      setFieldErrors(nextFields)
      setErrors(nextList)
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setErrors([])
    setFieldErrors({})
    setPending(true)
    try {
      const result = await apiPost<CreatedRequest>('/test-drive-requests/', {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        preferredDate: parsed.data.date,
        preferredSlot: parsed.data.slot,
        city: parsed.data.city,
        vehicleSlug: parsed.data.vehicleSlug,
        message: parsed.data.message ?? '',
        consent: true,
        source: `${window.location.pathname}${window.location.search}`,
        ...(parsed.data.hpField ? { hpField: parsed.data.hpField } : {}),
      })
      setCreated(result)
    } catch (err) {
      setErrors([err instanceof ApiError ? err.message : 'The studio could not take this request. Try again.'])
    } finally {
      setPending(false)
    }
  }

  const firstName = (created?.name || form.name).trim().split(' ')[0]
  const intro = content.testDriveIntro || `Name, mobile, a date. We confirm ${content.responseTimeCopy}.`

  if (loading || error) {
    return <CatalogState loading={loading} error={error} />
  }

  return (
    <section className="shell grid gap-10 pb-20 pt-28 md:grid-cols-2 md:items-stretch md:pt-32">
      <Seo
        title="Book a Test Drive — Kaka Motors"
        description="Request a private drive at the Kaka Motors Karachi studio."
        path="/test-drive"
        image={selected?.heroImageUrl}
      />
      <div className="relative min-h-[42vh] overflow-hidden md:min-h-[70vh]">
        {selected && (
          <ShowroomImage
            src={selected.heroImageUrl}
            srcSet={selected.heroSrcSet}
            alt={`${selected.name} waiting in the Karachi studio`}
            objectPosition={selected.heroObjectPosition}
            className="absolute inset-0 h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
        <div className="absolute bottom-6 left-6">
          <p className="eyebrow">Selected</p>
          <p className="display mt-2 text-3xl">{selected?.name}</p>
        </div>
      </div>

      <div className="glass p-6 md:p-10">
        {created ? (
          <div>
            <p className="eyebrow">Confirmed</p>
            <h1 className="display mt-4 text-4xl md:text-5xl">We’ll see you, {firstName}.</h1>
            <p className="mt-4 text-white/70">
              Request <span className="text-fog">{created.reference}</span> is with the studio. Expect a reply{' '}
              {content.responseTimeCopy}. Details remain with Kaka Motors.
            </p>
            <button
              type="button"
              className="focus-scarlet mt-8 border border-white/20 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em]"
              onClick={() => setCreated(null)}
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => void onSubmit(event)} noValidate className="relative overflow-hidden">
            <p className="eyebrow">Private drive</p>
            <h1 className="display mt-3 text-[clamp(2.2rem,4vw,3.4rem)]">Book the studio.</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{intro}</p>

            {errors.length > 0 && (
              <div
                ref={summaryRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="mt-6 border border-scarlet/40 bg-scarlet/10 px-4 py-3 text-sm text-scarlet-pale outline-none"
              >
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-scarlet-soft">
                  Fix these before we can book
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {errors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <label className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true">
              Leave blank
              <input
                tabIndex={-1}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                value={form.hpField}
                onChange={(event) => setForm({ ...form, hpField: event.target.value })}
              />
            </label>

            <label className="mt-8 block" htmlFor="drive-name">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Name</span>
              <input
                id="drive-name"
                className="focus-scarlet mt-2 min-h-11 w-full border border-white/15 bg-transparent px-3 py-3 text-fog"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'drive-name-error' : undefined}
              />
              {fieldErrors.name && (
                <p id="drive-name-error" className="mt-2 text-sm text-scarlet-pale">
                  {fieldErrors.name}
                </p>
              )}
            </label>
            <label className="mt-5 block" htmlFor="drive-email">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Email</span>
              <input
                id="drive-email"
                type="email"
                className="focus-scarlet mt-2 min-h-11 w-full border border-white/15 bg-transparent px-3 py-3 text-fog"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'drive-email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="drive-email-error" className="mt-2 text-sm text-scarlet-pale">
                  {fieldErrors.email}
                </p>
              )}
            </label>
            <label className="mt-5 block" htmlFor="drive-phone">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Mobile</span>
              <input
                id="drive-phone"
                type="tel"
                className="focus-scarlet mt-2 min-h-11 w-full border border-white/15 bg-transparent px-3 py-3 text-fog"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                autoComplete="tel"
                placeholder="03XX XXXXXXX"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'drive-phone-error' : undefined}
              />
              {fieldErrors.phone && (
                <p id="drive-phone-error" className="mt-2 text-sm text-scarlet-pale">
                  {fieldErrors.phone}
                </p>
              )}
            </label>
            <label className="mt-5 block" htmlFor="drive-date">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Preferred date</span>
              <input
                id="drive-date"
                type="date"
                className="focus-scarlet mt-2 min-h-11 w-full border border-white/15 bg-black/30 px-3 py-3 text-fog"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                aria-invalid={Boolean(fieldErrors.date)}
              />
            </label>
            <label className="mt-5 block" htmlFor="drive-slot">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Preferred time</span>
              <select
                id="drive-slot"
                className="focus-scarlet mt-2 min-h-11 w-full border border-white/15 bg-ink px-3 py-3 text-fog"
                value={form.slot}
                onChange={(event) =>
                  setForm({ ...form, slot: event.target.value as FormState['slot'] })
                }
              >
                <option value="morning">Morning · 10:00–13:00</option>
                <option value="afternoon">Afternoon · 13:00–17:00</option>
                <option value="evening">Evening · 17:00–20:00</option>
              </select>
            </label>
            <div className="mt-5">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Studio</span>
              <p className="mt-2 flex min-h-11 items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white/70">
                <MapPin size={14} className="shrink-0 text-amber" aria-hidden />
                {form.city} · one floor, by appointment
              </p>
            </div>

            <fieldset className="mt-6 border-0 p-0">
              <legend className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Vehicle</legend>
              <div id="drive-vehicle" className="mt-3 grid grid-cols-3 gap-2" role="listbox" aria-label="Choose a vehicle">
              {cars.length === 0 ? (
                <p className="col-span-3 text-sm text-white/55">Collection in motion</p>
              ) : (
                cars.map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    role="option"
                    aria-selected={form.vehicleSlug === car.slug}
                    onClick={() => setForm({ ...form, vehicleSlug: car.slug })}
                    className={`focus-scarlet min-h-11 px-2 py-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] md:text-[0.62rem] ${
                      form.vehicleSlug === car.slug
                        ? 'bg-scarlet text-white'
                        : 'border border-white/15 text-white/70'
                    }`}
                  >
                    {car.name}
                  </button>
                ))
              )}
              </div>
            </fieldset>

            <label className="mt-6 block">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Note for the studio</span>
              <textarea
                className="focus-scarlet mt-2 min-h-[5.5rem] w-full border border-white/15 bg-transparent px-3 py-3 text-fog"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                maxLength={600}
                placeholder="Anything we should know before we call."
              />
            </label>

            <label className="mt-6 flex items-start gap-3 text-sm text-white/60">
              <input
                id="drive-consent"
                type="checkbox"
                className="mt-1 h-5 w-5 accent-scarlet"
                checked={form.consent}
                onChange={(event) => setForm({ ...form, consent: event.target.checked })}
                aria-invalid={Boolean(fieldErrors.consent)}
              />
              I agree that Kaka Motors may use these details to confirm a private drive.
            </label>

            <button
              type="submit"
              disabled={pending || cars.length === 0}
              className="focus-scarlet mt-8 min-h-11 w-full bg-scarlet py-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] hover:bg-scarlet-hover disabled:opacity-60"
            >
              {pending ? 'Sending…' : 'Request appointment'}
            </button>
            {errors.length > 0 && created === null && (
              <button
                type="submit"
                disabled={pending}
              className="focus-scarlet mt-3 min-h-11 w-full border border-white/20 py-3 font-mono text-[0.62rem] uppercase tracking-[0.18em]"
              >
                Retry
              </button>
            )}
            <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/35">
              {content.privacyCopy || 'Privacy stays in the studio'} · Response {content.responseTimeCopy}
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
