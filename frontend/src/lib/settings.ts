import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'

export type PublicSettings = {
  studioDisplayName: string
  defaultCurrency: string
  maintenanceMode: boolean
}

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)

  useEffect(() => {
    let cancelled = false
    apiGet<PublicSettings>('/settings/')
      .then((row) => {
        if (!cancelled) setSettings(row)
      })
      .catch(() => {
        if (!cancelled) setSettings({ studioDisplayName: 'Kaka Motors', defaultCurrency: 'PKR', maintenanceMode: false })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return settings
}
