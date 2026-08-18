import { type FormEvent, useEffect, useState } from 'react'
import { studioGet, studioSend } from '../api'
import type { SiteContent } from '../../lib/types'

const empty: SiteContent = {
  homeEyebrow: '',
  homeHeadline: '',
  homeCtaLabel: '',
  homeNarrative: '',
  aboutIntro: '',
  founderQuote: '',
  founderName: '',
  brandHistory: '',
  values: [],
  studioBlurb: '',
  responseTimeCopy: '',
}

export function StudioContentPage() {
  const [form, setForm] = useState<SiteContent & { testDriveIntro?: string; privacyCopy?: string }>(empty)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    studioGet<typeof form>('/studio/content/')
      .then(setForm)
      .catch((err: Error) => setError(err.message))
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      const saved = await studioSend<typeof form>('/studio/content/', 'PUT', {
        ...form,
        values: form.values,
      })
      setForm(saved)
      setMessage('Copy saved.')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save copy.')
    }
  }

  const input = 'focus-scarlet mt-2 w-full border border-white/15 bg-transparent px-3 py-3'

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <p className="eyebrow">Words</p>
      <h1 className="display mt-3 text-4xl">Site copy</h1>
      {error && <p className="mt-6 text-scarlet-soft">{error}</p>}
      {message && <p className="mt-6 text-ice">{message}</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {(
          [
            ['homeEyebrow', 'Home eyebrow'],
            ['homeHeadline', 'Home headline'],
            ['homeCtaLabel', 'Home CTA'],
            ['founderName', 'Founder name'],
            ['responseTimeCopy', 'Response time'],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">{label}</span>
            <input className={input} value={String(form[key] ?? '')} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
          </label>
        ))}
      </div>
      {(
        [
          ['homeNarrative', 'Home narrative'],
          ['aboutIntro', 'About intro'],
          ['founderQuote', 'Founder quote'],
          ['brandHistory', 'History'],
          ['studioBlurb', 'Studio blurb'],
          ['testDriveIntro', 'Test-drive intro'],
          ['privacyCopy', 'Privacy copy'],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="mt-5 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">{label}</span>
          <textarea className={`${input} min-h-28`} value={String(form[key] ?? '')} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
        </label>
      ))}
      <button type="submit" className="focus-scarlet mt-8 bg-scarlet px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em]">
        Save copy
      </button>
    </form>
  )
}
