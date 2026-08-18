import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { Route, Switch, useLocation } from 'wouter'
import { AmbientBackground } from './components/AmbientBackground'
import { ConsentAnalytics } from './components/ConsentAnalytics'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageShell } from './components/PageShell'
import { SiteFooter, SiteHeader } from './components/SiteChrome'
import { usePublicSettings } from './lib/settings'
import { AboutPage } from './pages/AboutPage'
import { CarDetailPage } from './pages/CarDetailPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ShowcasePage } from './pages/ShowcasePage'
import { TestDrivePage } from './pages/TestDrivePage'
import { StudioRoot } from './studio/StudioRoot'

function MaintenanceScreen({ name }: { name: string }) {
  return (
    <section className="shell flex min-h-screen flex-col justify-center">
      <p className="eyebrow">Studio pause</p>
      <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4.4rem)]">{name} is resetting the floor.</h1>
      <p className="mt-4 max-w-md text-white/70">Appointments and the catalog will return shortly.</p>
    </section>
  )
}

function PublicSite() {
  const [location] = useLocation()
  const settings = usePublicSettings()
  const isHome = location === '/'
  const isAbout = location === '/about'
  const isStage = isHome || isAbout

  useEffect(() => {
    document.documentElement.classList.toggle('home-light', isHome)
    return () => document.documentElement.classList.remove('home-light')
  }, [isHome])

  if (settings?.maintenanceMode) {
    return <MaintenanceScreen name={settings.studioDisplayName} />
  }

  return (
    <div
      className={`relative z-[1] min-h-screen ${
        isStage ? 'bg-transparent text-white' : 'noise overflow-x-clip bg-ink text-fog'
      }`}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!isStage && <AmbientBackground />}
      <SiteHeader />
      <PageShell>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/showcase" component={ShowcasePage} />
          <Route path="/cars/:slug" component={CarDetailPage} />
          <Route path="/test-drive" component={TestDrivePage} />
          <Route path="/about" component={AboutPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </PageShell>
      <SiteFooter />
      <ConsentAnalytics />
    </div>
  )
}

export default function App() {
  const [location] = useLocation()
  const isStudio = location.startsWith('/studio')

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">{isStudio ? <StudioRoot /> : <PublicSite />}</MotionConfig>
    </ErrorBoundary>
  )
}
