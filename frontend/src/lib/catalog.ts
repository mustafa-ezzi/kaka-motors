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

export function useCatalog() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [content, setContent] = useState<SiteContent>(mockContent)
  const [cities, setCities] = useState<string[]>(mockCities)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [vehicleRows, contentRow, locationRows] = await Promise.all([
          apiGet<Vehicle[]>('/vehicles/'),
          apiGet<SiteContent>('/content/'),
          apiGet<LocationRow[]>('/locations/'),
        ])
        if (cancelled) return
        setVehicles(vehicleRows.map(withAccent))
        setContent({ ...mockContent, ...contentRow })
        if (locationRows.length) {
          setCities(locationRows.map((row) => row.city))
        }
        setError(null)
      } catch {
        if (!cancelled) {
          setVehicles([])
          setError('The studio catalog could not be reached. Confirm Django is running on port 8001.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
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
