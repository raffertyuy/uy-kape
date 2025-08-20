import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePasswordAuth } from '../usePasswordAuth'

describe('usePasswordAuth', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with unauthenticated state', () => {
      const { result } = renderHook(() => 
        usePasswordAuth('test123', 'guest')
      )

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
      expect(typeof result.current.authenticate).toBe('function')
      expect(typeof result.current.logout).toBe('function')
    })

    it('should initialize with unauthenticated state for admin role', () => {
      const { result } = renderHook(() => 
        usePasswordAuth('admin456', 'admin')
      )

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
    })
  })

  describe('Authentication from sessionStorage', () => {
    it('should restore auth state from sessionStorage for guest', () => {
      // Pre-populate sessionStorage
      sessionStorage.setItem('auth_guest', 'true')

      const { result } = renderHook(() => 
        usePasswordAuth('guest123', 'guest')
      )

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.role).toBe('guest')
    })

    it('should restore auth state from sessionStorage for admin', () => {
      // Pre-populate sessionStorage
      sessionStorage.setItem('auth_admin', 'true')

      const { result } = renderHook(() => 
        usePasswordAuth('admin456', 'admin')
      )

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.role).toBe('admin')
    })

    it('should not restore auth state when sessionStorage value is not "true"', () => {
      sessionStorage.setItem('auth_guest', 'false')

      const { result } = renderHook(() => 
        usePasswordAuth('guest123', 'guest')
      )

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
    })

    it('should maintain separate auth states for guest and admin', () => {
      sessionStorage.setItem('auth_guest', 'true')
      sessionStorage.setItem('auth_admin', 'false')

      const { result: guestResult } = renderHook(() => 
        usePasswordAuth('guest123', 'guest')
      )

      const { result: adminResult } = renderHook(() => 
        usePasswordAuth('admin456', 'admin')
      )

      expect(guestResult.current.isAuthenticated).toBe(true)
      expect(guestResult.current.role).toBe('guest')
      expect(adminResult.current.isAuthenticated).toBe(false)
      expect(adminResult.current.role).toBeUndefined()
    })
  })

  describe('Authentication Process', () => {
    it('should authenticate with correct password', async () => {
      const { result } = renderHook(() => 
        usePasswordAuth('correct123', 'guest')
      )

      let authResult: boolean
      await act(async () => {
        authResult = await result.current.authenticate('correct123')
      })

      expect(authResult!).toBe(true)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.role).toBe('guest')
      expect(sessionStorage.getItem('auth_guest')).toBe('true')
    })

    it('should reject authentication with wrong password', async () => {
      const { result } = renderHook(() => 
        usePasswordAuth('correct123', 'guest')
      )

      let authResult: boolean
      await act(async () => {
        authResult = await result.current.authenticate('wrong123')
      })

      expect(authResult!).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
      expect(sessionStorage.getItem('auth_guest')).toBeNull()
    })

    it('should authenticate admin with correct admin password', async () => {
      const { result } = renderHook(() => 
        usePasswordAuth('admin789', 'admin')
      )

      let authResult: boolean
      await act(async () => {
        authResult = await result.current.authenticate('admin789')
      })

      expect(authResult!).toBe(true)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.role).toBe('admin')
      expect(sessionStorage.getItem('auth_admin')).toBe('true')
    })

    it('should handle empty password correctly', async () => {
      const { result } = renderHook(() => 
        usePasswordAuth('correct123', 'guest')
      )

      let authResult: boolean
      await act(async () => {
        authResult = await result.current.authenticate('')
      })

      expect(authResult!).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
    })

    it('should handle case-sensitive passwords', async () => {
      const { result } = renderHook(() => 
        usePasswordAuth('CaSeSeNsItIvE', 'guest')
      )

      // Wrong case should fail
      let authResult: boolean
      await act(async () => {
        authResult = await result.current.authenticate('casesensitive')
      })

      expect(authResult!).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)

      // Correct case should succeed
      await act(async () => {
        authResult = await result.current.authenticate('CaSeSeNsItIvE')
      })

      expect(authResult!).toBe(true)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('Logout Functionality', () => {
    it('should logout and clear sessionStorage', async () => {
      const { result } = renderHook(() => 
        usePasswordAuth('test123', 'guest')
      )

      // First authenticate
      await act(async () => {
        await result.current.authenticate('test123')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(sessionStorage.getItem('auth_guest')).toBe('true')

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
      expect(sessionStorage.getItem('auth_guest')).toBeNull()
    })

    it('should logout admin and clear admin sessionStorage', async () => {
      const { result } = renderHook(() => 
        usePasswordAuth('admin123', 'admin')
      )

      // First authenticate
      await act(async () => {
        await result.current.authenticate('admin123')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(sessionStorage.getItem('auth_admin')).toBe('true')

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
      expect(sessionStorage.getItem('auth_admin')).toBeNull()
    })

    it('should be safe to logout when not authenticated', () => {
      const { result } = renderHook(() => 
        usePasswordAuth('test123', 'guest')
      )

      // Should not throw when logging out while not authenticated
      expect(() => {
        act(() => {
          result.current.logout()
        })
      }).not.toThrow()

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
    })
  })

  describe('Role-based Authentication Isolation', () => {
    it('should maintain separate authentication states for different roles', async () => {
      const { result: guestHook } = renderHook(() => 
        usePasswordAuth('guest123', 'guest')
      )

      const { result: adminHook } = renderHook(() => 
        usePasswordAuth('admin456', 'admin')
      )

      // Authenticate guest
      await act(async () => {
        await guestHook.current.authenticate('guest123')
      })

      expect(guestHook.current.isAuthenticated).toBe(true)
      expect(guestHook.current.role).toBe('guest')
      expect(adminHook.current.isAuthenticated).toBe(false)
      expect(adminHook.current.role).toBeUndefined()

      // Authenticate admin
      await act(async () => {
        await adminHook.current.authenticate('admin456')
      })

      expect(guestHook.current.isAuthenticated).toBe(true)
      expect(guestHook.current.role).toBe('guest')
      expect(adminHook.current.isAuthenticated).toBe(true)
      expect(adminHook.current.role).toBe('admin')

      // Logout guest should not affect admin
      act(() => {
        guestHook.current.logout()
      })

      expect(guestHook.current.isAuthenticated).toBe(false)
      expect(adminHook.current.isAuthenticated).toBe(true)
      expect(adminHook.current.role).toBe('admin')
    })
  })

  describe('Hook Re-initialization', () => {
    it('should handle role changes by re-initializing the hook', () => {
      // First render with guest role
      const { result, rerender } = renderHook(
        ({ password, role }: { password: string; role: 'guest' | 'admin' }) => usePasswordAuth(password, role),
        { 
          initialProps: { password: 'test123', role: 'guest' as 'guest' | 'admin' }
        }
      )

      expect(result.current.role).toBeUndefined()

      // Re-render with admin role
      rerender({ password: 'admin456', role: 'admin' as 'guest' | 'admin' })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.role).toBeUndefined()
    })

    it('should re-check sessionStorage when role changes', () => {
      sessionStorage.setItem('auth_admin', 'true')

      const { result, rerender } = renderHook(
        ({ password, role }: { password: string; role: 'guest' | 'admin' }) => usePasswordAuth(password, role),
        { 
          initialProps: { password: 'test123', role: 'guest' as 'guest' | 'admin' }
        }
      )

      expect(result.current.isAuthenticated).toBe(false)

      // Change to admin role should pick up existing sessionStorage
      rerender({ password: 'admin456', role: 'admin' as 'guest' | 'admin' })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.role).toBe('admin')
    })
  })
})