import { useEffect, useState } from 'react'
import { mockCities, mockContent } from '../data/mock-content'
import { ApiError, apiGet } from './api'
import type { SiteContent, Vehicle } from './types'

type LocationRow = { id: number; city: string; studioName: string; address: string; active: boolean }

const ACCENT: Record<Vehicle['category'], string> = {
  performance: '#f23848',
  electric: '#dce6ed',
  executive: '#ffbd69',
}

function withAccent(car: Vehicle): Vehicle {
  return { ...car, accent: car.accent ?? ACCENT[car.category] }
}

export function featuredVehicle(list: Vehicle[]) {
  return (
    list.find((car) => car.featuredOnHome && car.status === 'published') ??
    list.filter((car) => car.status === 'published').sort((a, b) => a.sortOrder - b.sortOrder)[0]
  )
}

export function publishedVehicles(list: Vehicle[]) {
  return list.filter((car) => car.status === 'published').sort((a, b) => a.sortOrder - b.sortOrder)
}

export function vehicleBySlug(slug: string, list: Vehicle[]) {
  return publishedVehicles(list).find((car) => car.slug === slug)
}

// ─── Module-level cache ───────────────────────────────────────────────────────
// The catalog is fetched once per page load. Subsequent useCatalog() calls
// (e.g. navigating to /showcase) resolve instantly from the cache instead of
// showing a loading state again.

type CatalogCache = {
  vehicles: Vehicle[]
  content: SiteContent
  cities: string[]
}

let catalogCache: CatalogCache | null = null
let catalogPromise: Promise<CatalogCache> | null = null

async function fetchCatalog(): Promise<CatalogCache> {
  const [vehicleRows, contentRow, locationRows] = await Promise.all([
    apiGet<Vehicle[]>('/vehicles/'),
    apiGet<SiteContent>('/content/'),
    apiGet<LocationRow[]>('/locations/'),
  ])
  return {
    vehicles: vehicleRows.map(withAccent),
    content: { ...mockContent, ...contentRow },
    cities: locationRows.length ? locationRows.map((row) => row.city) : mockCities,
  }
}

function getCatalogPromise(): Promise<CatalogCache> {
  if (!catalogPromise) {
    catalogPromise = fetchCatalog().catch((err) => {
      // Reset so the next mount can retry
      catalogPromise = null
      throw err
    })
  }
  return catalogPromise
}

export function useCatalog() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(catalogCache?.vehicles ?? [])
  const [content, setContent] = useState<SiteContent>(catalogCache?.content ?? mockContent)
  const [cities, setCities] = useState<string[]>(catalogCache?.cities ?? mockCities)
  // If we already have a cache, start as not-loading so there's no flash
  const [loading, setLoading] = useState(catalogCache === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (catalogCache) {
      // Already resolved — apply immediately, no fetch needed
      setVehicles(catalogCache.vehicles)
      setContent(catalogCache.content)
      setCities(catalogCache.cities)
      setLoading(false)
      return
    }

    let cancelled = false

    getCatalogPromise()
      .then((data) => {
        if (cancelled) return
        catalogCache = data
        setVehicles(data.vehicles)
        setContent(data.content)
        setCities(data.cities)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) {
          setVehicles([])
          setError('The studio catalog could not be reached. Confirm Django is running on port 8001.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { vehicles, content, cities, loading, error }
}

export function useVehicle(slug: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!slug) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const row = await apiGet<Vehicle>(`/vehicles/${slug}/`)
        if (!cancelled) setVehicle(withAccent(row))
      } catch (err) {
        if (cancelled) return
        setVehicle(null)
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError('This car could not be loaded. Try again in a moment.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  return { vehicle, loading, error, notFound }
}
