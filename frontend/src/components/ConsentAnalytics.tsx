import { useEffect, useState } from 'react'

const KEY = 'km-analytics-consent'
const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN

type Consent = 'granted' | 'denied' | null

function readConsent(): Consent {
  try {
    const value = localStorage.getItem(KEY)
    if (value === 'granted' || value === 'denied') return value
  } catch {
    /* private mode */
  }
  return null
}

function loadPlausible(domain: string) {
  if (document.getElementById('km-plausible')) return
  const script = document.createElement('script')
  script.id = 'km-plausible'
  script.defer = true
  script.setAttribute('data-domain', domain)
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
}

export function ConsentAnalytics() {
  const [consent, setConsent] = useState<Consent>(null)

  useEffect(() => {
    setConsent(readConsent())
  }, [])

  useEffect(() => {
    if (consent === 'granted' && DOMAIN) loadPlausible(DOMAIN)
  }, [consent])

  if (!DOMAIN || consent !== null) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4">
      <div className="shell">
        <div className="tile crystal crystal-ink flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-white/80">
            We can count visits with a privacy-first script. No ads, no sale of your details. The test-drive form still
            works if you decline.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="focus-scarlet min-h-11 rounded-full border border-white/25 px-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white"
              onClick={() => {
                localStorage.setItem(KEY, 'denied')
                setConsent('denied')
              }}
            >
              Decline
            </button>
            <button
              type="button"
              className="focus-scarlet min-h-11 rounded-full bg-white px-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#0f1318] hover:bg-amber"
              onClick={() => {
                localStorage.setItem(KEY, 'granted')
                setConsent('granted')
              }}
            >
              Allow analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
