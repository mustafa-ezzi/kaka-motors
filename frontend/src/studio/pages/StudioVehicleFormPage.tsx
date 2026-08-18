import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'wouter'
import { ApiError } from '../../lib/api'
import type { Vehicle, VehicleCategory, VehicleStatus } from '../../lib/types'
import { studioGet, studioSend, studioUpload } from '../api'

type FormState = {
  name: string
  slug: string
  category: VehicleCategory
  status: VehicleStatus
  statusLabel: string
  summary: string
  description: string
  interiorStory: string
  priceFrom: string
  currency: string
  sortOrder: string
  featuredOnHome: boolean
  power: string
  acceleration: string
  topSpeed: string
  transmission: string
  length: string
  features: string
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  category: 'performance',
  status: 'draft',
  statusLabel: '',
  summary: '',
  description: '',
  interiorStory: '',
  priceFrom: '',
  currency: 'PKR',
  sortOrder: '0',
  featuredOnHome: false,
  power: '',
  acceleration: '',
  topSpeed: '',
  transmission: '',
  length: '',
  features: '',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function fromVehicle(car: Vehicle): FormState {
  return {
    name: car.name,
    slug: car.slug,
    category: car.category,
    status: car.status,
    statusLabel: car.statusLabel ?? '',
    summary: car.summary,
    description: car.description,
    interiorStory: car.interiorStory ?? '',
    priceFrom: car.priceFrom != null ? String(car.priceFrom) : '',
    currency: car.currency,
    sortOrder: String(car.sortOrder),
    featuredOnHome: car.featuredOnHome,
    power: car.specs?.power ?? '',
    acceleration: car.specs?.acceleration ?? '',
    topSpeed: car.specs?.topSpeed ?? '',
    transmission: car.specs?.transmission ?? '',
    length: car.specs?.length ?? '',
    features: (car.features ?? []).join('\n'),
  }
}

export function StudioVehicleFormPage() {
  const params = useParams<{ id?: string }>()
  const isNew = !params.id
  const [, setLocation] = useLocation()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [car, setCar] = useState<Vehicle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [galleryAlt, setGalleryAlt] = useState('')
  const slugLocked = Boolean(car && car.status === 'published')

  useEffect(() => {
    if (!params.id) return
    studioGet<Vehicle>(`/studio/vehicles/${params.id}/`)
      .then((row) => {
        setCar(row)
        setForm(fromVehicle(row))
      })
      .catch((err: Error) => setError(err.message))
  }, [params.id])

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'name' && isNew && (!current.slug || current.slug === slugify(current.name))) {
        next.slug = slugify(String(value))
      }
      return next
    })
  }

  function payload() {
    return {
      name: form.name,
      slug: form.slug,
      category: form.category,
      status: form.status,
      statusLabel: form.statusLabel,
      summary: form.summary,
      description: form.description,
      interiorStory: form.interiorStory,
      priceFrom: form.priceFrom ? Number(form.priceFrom) : null,
      currency: form.currency,
      sortOrder: Number(form.sortOrder) || 0,
      featuredOnHome: form.featuredOnHome,
      specs: {
        power: form.power,
        acceleration: form.acceleration,
        topSpeed: form.topSpeed,
        transmission: form.transmission,
        length: form.length,
      },
      features: form.features
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      if (isNew) {
        const created = await studioSend<Vehicle>('/studio/vehicles/', 'POST', payload())
        setLocation(`/studio/vehicles/${created.id}`)
      } else if (params.id) {
        const saved = await studioSend<Vehicle>(`/studio/vehicles/${params.id}/`, 'PATCH', payload())
        setCar(saved)
        setForm(fromVehicle(saved))
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save.')
    } finally {
      setPending(false)
    }
  }

  async function upload(kind: 'card-image' | 'hero-image' | 'gallery', file: File) {
    if (!params.id) return
    setPending(true)
    setError(null)
    try {
      if (kind === 'gallery') {
        const saved = await studioUpload<Vehicle['gallery'][number]>(
          `/studio/vehicles/${params.id}/gallery/`,
          file,
          { alt: galleryAlt || `${form.name} gallery` },
        )
        setCar((current) => (current ? { ...current, gallery: [...current.gallery, saved] } : current))
        setGalleryAlt('')
      } else {
        const saved = await studioUpload<Vehicle>(`/studio/vehicles/${params.id}/${kind}/`, file)
        setCar(saved)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.')
    } finally {
      setPending(false)
    }
  }

  async function removeGallery(id: string) {
    await studioSend(`/studio/gallery/${id}/`, 'DELETE')
    setCar((current) =>
      current ? { ...current, gallery: current.gallery.filter((item) => item.id !== id) } : current,
    )
  }

  const input = 'focus-scarlet mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-fog'

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="eyebrow">{isNew ? 'New car' : 'Edit car'}</p>
        <h1 className="display mt-3 text-4xl">{form.name || 'Untitled vehicle'}</h1>
        {error && <p className="mt-6 border border-scarlet/40 bg-scarlet/10 px-4 py-3 text-sm text-scarlet-pale">{error}</p>}

        <label className="mt-8 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Name</span>
          <input className={input} value={form.name} onChange={(event) => patch('name', event.target.value)} required />
        </label>
        <label className="mt-5 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Slug</span>
          <input className={input} value={form.slug} onChange={(event) => patch('slug', event.target.value)} required disabled={slugLocked} />
        </label>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Category</span>
            <select className={`${input} bg-ink`} value={form.category} onChange={(event) => patch('category', event.target.value as VehicleCategory)}>
              <option value="performance">Performance</option>
              <option value="electric">Electric</option>
              <option value="executive">Executive</option>
            </select>
          </label>
          <label>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Status</span>
            <select className={`${input} bg-ink`} value={form.status} onChange={(event) => patch('status', event.target.value as VehicleStatus)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <label className="mt-5 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Status label</span>
          <input className={input} value={form.statusLabel} onChange={(event) => patch('statusLabel', event.target.value)} placeholder="In showroom" />
        </label>
        <label className="mt-5 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Summary</span>
          <textarea className={`${input} min-h-24`} value={form.summary} onChange={(event) => patch('summary', event.target.value)} required />
        </label>
        <label className="mt-5 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Description</span>
          <textarea className={`${input} min-h-32`} value={form.description} onChange={(event) => patch('description', event.target.value)} required />
        </label>
        <label className="mt-5 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Interior story</span>
          <textarea className={`${input} min-h-24`} value={form.interiorStory} onChange={(event) => patch('interiorStory', event.target.value)} />
        </label>
        <label className="mt-5 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Features (one per line)</span>
          <textarea className={`${input} min-h-24`} value={form.features} onChange={(event) => patch('features', event.target.value)} />
        </label>
      </div>

      <div className="space-y-6">
        <div className="border border-white/10 p-6">
          <p className="eyebrow">Specs</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(
              [
                ['power', 'Power'],
                ['acceleration', 'Acceleration'],
                ['topSpeed', 'Top speed'],
                ['transmission', 'Transmission'],
                ['length', 'Length'],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/45">{label}</span>
                <input className={input} value={form[key]} onChange={(event) => patch(key, event.target.value)} />
              </label>
            ))}
            <label>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/45">Price from</span>
              <input className={input} value={form.priceFrom} onChange={(event) => patch('priceFrom', event.target.value)} />
            </label>
            <label>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/45">Currency</span>
              <input className={input} value={form.currency} onChange={(event) => patch('currency', event.target.value)} />
            </label>
            <label>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/45">Sort order</span>
              <input className={input} value={form.sortOrder} onChange={(event) => patch('sortOrder', event.target.value)} />
            </label>
          </div>
          <label className="mt-5 flex items-center gap-3 text-sm text-white/70">
            <input type="checkbox" className="accent-scarlet" checked={form.featuredOnHome} onChange={(event) => patch('featuredOnHome', event.target.checked)} />
            Featured on home
          </label>
        </div>

        <div className="border border-white/10 p-6">
          <p className="eyebrow">Photography</p>
          {isNew ? (
            <p className="mt-4 text-sm text-white/55">Save the car first, then upload images.</p>
          ) : (
            <div className="mt-4 space-y-5">
              <label className="block text-sm text-white/70">
                Card image
                {car?.cardImageUrl && <img src={car.cardImageUrl} alt="" className="mt-2 h-28 w-full object-cover" />}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="mt-2 block text-xs" onChange={(event) => event.target.files?.[0] && void upload('card-image', event.target.files[0])} />
              </label>
              <label className="block text-sm text-white/70">
                Hero image
                {car?.heroImageUrl && <img src={car.heroImageUrl} alt="" className="mt-2 h-28 w-full object-cover" />}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="mt-2 block text-xs" onChange={(event) => event.target.files?.[0] && void upload('hero-image', event.target.files[0])} />
              </label>
              <div>
                <p className="text-sm text-white/70">Gallery</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {car?.gallery.map((item) => (
                    <figure key={item.id} className="relative">
                      <img src={item.imageUrl} alt={item.alt} className="h-24 w-full object-cover" />
                      <button type="button" onClick={() => void removeGallery(item.id)} className="absolute right-2 top-2 bg-ink/80 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.14em]">
                        Remove
                      </button>
                    </figure>
                  ))}
                </div>
                <input className={`${input} mt-3`} placeholder="Alt text" value={galleryAlt} onChange={(event) => setGalleryAlt(event.target.value)} />
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="mt-2 block text-xs" onChange={(event) => event.target.files?.[0] && void upload('gallery', event.target.files[0])} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={pending} className="focus-scarlet bg-scarlet px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] hover:bg-scarlet-hover disabled:opacity-60">
            {pending ? 'Saving…' : 'Save vehicle'}
          </button>
          <Link href="/studio/vehicles" className="border border-white/20 px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em]">
            Back to list
          </Link>
        </div>
      </div>
    </form>
  )
}
