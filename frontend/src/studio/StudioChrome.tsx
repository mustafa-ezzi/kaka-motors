import type { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'
import { BrandMark } from '../components/BrandMark'
import { useAuth } from './auth'

const links = [
  { href: '/studio', label: 'Floor', exact: true },
  { href: '/studio/vehicles', label: 'Vehicles' },
  { href: '/studio/locations', label: 'Locations' },
  { href: '/studio/leads', label: 'Drives' },
  { href: '/studio/content', label: 'Copy' },
  { href: '/studio/settings', label: 'Settings' },
]

export function StudioChrome({ children }: { children: ReactNode }) {
  const [location] = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-ink text-fog">
      <header className="border-b border-white/10">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-5">
          <BrandMark compact />
          <nav className="flex flex-wrap items-center gap-5">
            {links.map((item) => {
              const active = item.exact ? location === item.href : location.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mono text-[0.68rem] uppercase tracking-[0.2em] ${
                    active ? 'text-scarlet-soft' : 'text-white/55 hover:text-fog'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{user?.username}</p>
            <a
              href="/"
              className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/55 hover:text-fog"
            >
              View site
            </a>
            <button
              type="button"
              onClick={() => void logout()}
              className="focus-scarlet font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/55 hover:text-scarlet-soft"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="shell py-10">{children}</main>
    </div>
  )
}
