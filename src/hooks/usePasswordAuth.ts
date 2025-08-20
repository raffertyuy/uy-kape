import { useState, useEffect } from 'react'
import type { PasswordAuthState } from '@/types/app.types'

export function usePasswordAuth(requiredPassword: string, role: 'guest' | 'admin') {
  const [state, setState] = useState<PasswordAuthState>({
    isAuthenticated: false,
    role: undefined,
  })

  // Check if user is already authenticated (from sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem(`auth_${role}`)
    if (stored === 'true') {
      setState({
        isAuthenticated: true,
        role,
      })
    }
  }, [role])

  const authenticate = async (password: string): Promise<boolean> => {
    if (password === requiredPassword) {
      setState({
        isAuthenticated: true,
        role,
      })
      // Store authentication state for page refreshes
      sessionStorage.setItem(`auth_${role}`, 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setState({
      isAuthenticated: false,
      role: undefined,
    })
    sessionStorage.removeItem(`auth_${role}`)
  }

  return {
    isAuthenticated: state.isAuthenticated,
    role: state.role,
    authenticate,
    logout,
  }
}