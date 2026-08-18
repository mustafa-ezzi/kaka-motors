import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { studioGet, studioSend, getStudioToken, setStudioToken } from './api'

export type StaffUser = {
  username: string
  isSuperuser: boolean
}

type AuthContextValue = {
  token: string | null
  user: StaffUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStudioToken())
  const [user, setUser] = useState<StaffUser | null>(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    let cancelled = false
    studioGet<StaffUser>('/auth/me/')
      .then((row) => {
        if (!cancelled) setUser(row)
      })
      .catch(() => {
        if (!cancelled) {
          setStudioToken(null)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      async login(username, password) {
        const result = await studioSend<{ token: string; user: StaffUser }>('/auth/login/', 'POST', {
          username,
          password,
        })
        setStudioToken(result.token)
        setToken(result.token)
        setUser(result.user)
      },
      async logout() {
        try {
          await studioSend('/auth/logout/', 'POST')
        } catch {
          /* token already invalid */
        }
        setStudioToken(null)
        setToken(null)
        setUser(null)
      },
    }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
