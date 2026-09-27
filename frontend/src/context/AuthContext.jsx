import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService, profileService } from '../services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('wellness_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const { data } = await profileService.get()
        if (!cancelled) setUser(data)
      } catch {
        localStorage.removeItem('wellness_token')
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      async login(email, password) {
        const { data } = await authService.login({ email, password })
        localStorage.setItem('wellness_token', data.access_token)
        setToken(data.access_token)
        return data
      },
      async register(payload) {
        await authService.register(payload)
        const { data } = await authService.login({
          email: payload.email,
          password: payload.password,
        })
        localStorage.setItem('wellness_token', data.access_token)
        setToken(data.access_token)
        return data
      },
      logout() {
        localStorage.removeItem('wellness_token')
        setToken(null)
        setUser(null)
      },
      async refreshProfile() {
        const { data } = await profileService.get()
        setUser(data)
        return data
      },
    }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
