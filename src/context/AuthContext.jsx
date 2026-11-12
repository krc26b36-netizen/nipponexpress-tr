import { createContext, useState, useEffect, useCallback } from 'react'
import * as authService from '../lib/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    authService.initAuth().then(() => {
      const session = authService.getSession()
      setUser(session)
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (email, password, requireAdmin = false) => {
    try {
      const u = await authService.login(email, password, requireAdmin)
      setUser(u)
      setAuthError(null)
      return u
    } catch (e) {
      setAuthError(e.message)
      throw e
    }
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    try {
      const u = await authService.register({ name, email, password })
      setUser(u)
      setAuthError(null)
      return u
    } catch (e) {
      setAuthError(e.message)
      throw e
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
