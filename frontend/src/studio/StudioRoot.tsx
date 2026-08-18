import { useEffect, type ReactNode } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { AuthProvider, useAuth } from './auth'
import { StudioChrome } from './StudioChrome'
import { StudioContentPage } from './pages/StudioContentPage'
import { StudioDashboardPage } from './pages/StudioDashboardPage'
import { StudioLeadPage } from './pages/StudioLeadPage'
import { StudioLocationPage } from './pages/StudioLocationPage'
import { StudioLoginPage } from './pages/StudioLoginPage'
import { StudioSettingsPage } from './pages/StudioSettingsPage'
import { StudioVehicleFormPage } from './pages/StudioVehicleFormPage'
import { StudioVehicleListPage } from './pages/StudioVehicleListPage'

function Guard({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!loading && !token) setLocation('/studio/login')
  }, [loading, token, setLocation])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center bg-ink px-6 text-fog">
        <p className="eyebrow">Loading studio</p>
      </div>
    )
  }
  if (!token) return null
  return <StudioChrome>{children}</StudioChrome>
}

function StudioRoutes() {
  return (
    <Switch>
      <Route path="/studio/login" component={StudioLoginPage} />
      <Route path="/studio/vehicles/new">
        <Guard>
          <StudioVehicleFormPage />
        </Guard>
      </Route>
      <Route path="/studio/vehicles/:id">
        <Guard>
          <StudioVehicleFormPage />
        </Guard>
      </Route>
      <Route path="/studio/vehicles">
        <Guard>
          <StudioVehicleListPage />
        </Guard>
      </Route>
      <Route path="/studio/locations">
        <Guard>
          <StudioLocationPage />
        </Guard>
      </Route>
      <Route path="/studio/leads">
        <Guard>
          <StudioLeadPage />
        </Guard>
      </Route>
      <Route path="/studio/content">
        <Guard>
          <StudioContentPage />
        </Guard>
      </Route>
      <Route path="/studio/settings">
        <Guard>
          <StudioSettingsPage />
        </Guard>
      </Route>
      <Route path="/studio">
        <Guard>
          <StudioDashboardPage />
        </Guard>
      </Route>
    </Switch>
  )
}

export function StudioRoot() {
  return (
    <AuthProvider>
      <StudioRoutes />
    </AuthProvider>
  )
}
