import { type FormEvent, useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { BrandMark } from '../../components/BrandMark'
import { ApiError } from '../../lib/api'
import { useAuth } from '../auth'

export function StudioLoginPage() {
  const { login, token } = useAuth()
  const [, setLocation] = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (token) setLocation('/studio')
  }, [token, setLocation])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      await login(username, password)
      setLocation('/studio')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-fog">
      <form onSubmit={(event) => void onSubmit(event)} className="glass w-full max-w-md p-8 md:p-10">
        <BrandMark />
        <p className="eyebrow mt-10">Studio control</p>
        <h1 className="display mt-3 text-3xl">Sign in to the floor.</h1>
        <p className="mt-4 text-sm text-white/60">Staff only. The public showroom stays separate.</p>
        {error && <p className="mt-6 border border-scarlet/40 bg-scarlet/10 px-4 py-3 text-sm text-scarlet-pale">{error}</p>}
        <label className="mt-8 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Username</span>
          <input
            className="focus-scarlet mt-2 w-full border border-white/15 bg-transparent px-3 py-3"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="mt-5 block">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50">Password</span>
          <input
            type="password"
            className="focus-scarlet mt-2 w-full border border-white/15 bg-transparent px-3 py-3"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="focus-scarlet mt-8 w-full bg-scarlet py-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] hover:bg-scarlet-hover disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Enter studio'}
        </button>
      </form>
    </div>
  )
}
