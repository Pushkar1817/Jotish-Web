import React, { createContext, useContext, useState, useCallback } from 'react'
const AuthContext = createContext(null)
const CREDENTIALS = { username: 'testuser', password: 'Test123' }
const STORAGE_KEY = 'jotish_auth_user'
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const login = useCallback((username, password) => {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      const userData = { username, loggedInAt: Date.now() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }, [])
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('')
  return ctx
}
