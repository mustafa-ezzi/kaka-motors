import { type FormEvent, useEffect, useState } from 'react'
import { studioGet, studioSend } from '../api'

type Settings = {
  studioDisplayName: string
  defaultCurrency: string
  maintenanceMode: boolean
  notificationEmail: string
}

export function StudioSettingsPage() {
  const [form, setForm] = useState<Settings>({
    studioDisplayName: 'Kaka Motors',
    defaultCurrency: 'PKR',
    maintenanceMode: false,
    notificationEmail: '',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    studioGet<Settings>('/studio/settings/')
      .then(setForm)
      .catch((err: Error) => setError(err.message))
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      setForm(await studioSend<Settings>('/studio/settings/', 'PUT', form))
      setMessage('Settings saved.')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.')
    }
  }

  const input = 'focus-scarlet mt-2 w-full border border-white/15 bg-transparent px-3 py-3'

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="max-w-xl">
      <p className="eyebrow">House</p>
      <h1 className="display mt-3 text-4xl">Settings</h1>
      {error && <p className="mt-6 text-scarlet-soft">{error}</p>}
      {message && <p className="mt-6 text-ice">{message}</p>}
      <label className="mt-8 block">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Studio name</span>
        <input className={input} value={form.studioDisplayName} onChange={(event) => setForm({ ...form, studioDisplayName: event.target.value })} />
      </label>
      <label className="mt-5 block">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Default currency</span>
        <input className={input} value={form.defaultCurrency} onChange={(event) => setForm({ ...form, defaultCurrency: event.target.value })} />
      </label>
      <label className="mt-5 block">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Notification email</span>
        <input type="email" className={input} value={form.notificationEmail} onChange={(event) => setForm({ ...form, notificationEmail: event.target.value })} />
      </label>
      <label className="mt-5 flex items-center gap-3 text-sm text-white/70">
        <input type="checkbox" className="accent-scarlet" checked={form.maintenanceMode} onChange={(event) => setForm({ ...form, maintenanceMode: event.target.checked })} />
        Maintenance mode
      </label>
      <button type="submit" className="focus-scarlet mt-8 bg-scarlet px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em]">
        Save settings
      </button>
    </form>
  )
}
