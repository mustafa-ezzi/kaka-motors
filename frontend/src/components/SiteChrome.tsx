import { type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { BrandMark } from './BrandMark'

const nav = [
  { href: '/showcase', label: 'Showcase' },
  { href: '/about', label: 'About' },
]

function useStudioClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)

  return { time }
}

export function SiteHeader() {
  const [location] = useLocation()
  const [open, setOpen] = useState(false)
  const { time } = useStudioClock()

  useEffect(() => {
    setOpen(false)
  }, [location])

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="shell pt-4 md:pt-5">
        <div className="tile crystal crystal-ink px-4 py-3 md:px-5">
          <div className="flex items-center justify-between gap-4">
            <BrandMark />
            <div className="hidden items-center gap-7 md:flex">
              <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/55">
                <span className="studio-pulse" aria-hidden />
                Karachi · {time}
              </p>
              <nav className="flex items-center gap-1">
                {nav.map((item) => {
                  const active = location === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`focus-scarlet inline-flex min-h-11 items-center rounded-full px-3 font-mono text-[0.68rem] uppercase tracking-[0.22em] transition-colors ${
                        active ? 'bg-white/10 text-amber' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <Link
                href="/test-drive"
                className="focus-scarlet inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#0f1318] transition-colors hover:bg-amber"
              >
                Test drive
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <button
              type="button"
              className="focus-scarlet grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white md:hidden"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <div
            className={`grid transition-[grid-template-rows] duration-300 md:hidden ${
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <nav className="overflow-hidden">
              <div className="flex flex-col gap-4 border-t border-white/10 pb-2 pt-4">
                <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/55">
                  <span className="studio-pulse" aria-hidden />
                  Karachi · {time}
                </p>
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-mono text-sm uppercase tracking-[0.2em] ${
                      location === item.href ? 'text-amber' : 'text-white/80'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/test-drive"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#0f1318]"
                >
                  Test drive
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const { time } = useStudioClock()

  return (
    <footer className="relative z-10 mt-16 pb-8 md:mt-24 md:pb-10">
      <div className="shell">
        <div className="tile crystal crystal-ink relative overflow-hidden px-6 py-10 md:px-12 md:py-12">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-signal" />
          <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto] md:items-end">
            <div>
              <BrandMark />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
                A private Karachi studio for machines that still mean something.
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-amber">Studio</p>
              <p className="mt-3 text-sm text-white">Karachi</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/55">
                <span className="studio-pulse" aria-hidden />
                Open · {time}
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-amber">Visit</p>
              <FooterLink href="/showcase">Collection</FooterLink>
              <FooterLink href="/about">Our story</FooterLink>
              <FooterLink href="/test-drive">Book a drive</FooterLink>
            </div>
            <Link
              href="/test-drive"
              className="focus-scarlet inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#0f1318] transition-colors hover:bg-amber md:self-end"
            >
              Reserve
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="mt-10 border-t border-white/10 pt-6 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/40">
            © {new Date().getFullYear()} Kaka Motors · Private appointments · PK
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-3 block text-sm text-white/75 transition-colors hover:text-amber"
    >
      {children}
    </Link>
  )
}
