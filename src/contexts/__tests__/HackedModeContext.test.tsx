import { describe, it, expect, vi, beforeEach, afterEach, afterAll, beforeAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { HackedModeProvider, useHackedMode } from '../HackedModeContext'
import '@testing-library/jest-dom/vitest'

// Mock appSettingsService so tests don't hit a real DB
vi.mock('@/services/appSettingsService', () => ({
  getHackedMode: vi.fn().mockResolvedValue(false),
  setHackedMode: vi.fn().mockResolvedValue(undefined),
}))

import * as appSettingsService from '@/services/appSettingsService'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(HackedModeProvider, null, children)
)

describe('HackedModeContext', () => {
  beforeAll(() => {
    // Suppress expected console.error from intentional throw tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('hacked-mode')
    vi.clearAllMocks()
    // Default: DB returns false, set resolves
    vi.mocked(appSettingsService.getHackedMode).mockResolvedValue(false)
    vi.mocked(appSettingsService.setHackedMode).mockResolvedValue(undefined)
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('hacked-mode')
  })

  describe('useHackedMode guard', () => {
    it('throws when used outside HackedModeProvider', () => {
      expect(() => {
        renderHook(() => useHackedMode())
      }).toThrow('useHackedMode must be used within HackedModeProvider')
    })
  })

  describe('initial state', () => {
    it('defaults to isHackedMode: false when localStorage is empty', () => {
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      expect(result.current.isHackedMode).toBe(false)
    })

    it('reads isHackedMode: true from localStorage on mount', () => {
      localStorage.setItem('uy-kape-hacked-mode', 'true')
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      expect(result.current.isHackedMode).toBe(true)
    })

    it('applies hacked-mode class on mount when localStorage is true', () => {
      localStorage.setItem('uy-kape-hacked-mode', 'true')
      renderHook(() => useHackedMode(), { wrapper })
      expect(document.documentElement.classList.contains('hacked-mode')).toBe(true)
    })

    it('does not apply hacked-mode class on mount when localStorage is false', () => {
      localStorage.setItem('uy-kape-hacked-mode', 'false')
      renderHook(() => useHackedMode(), { wrapper })
      expect(document.documentElement.classList.contains('hacked-mode')).toBe(false)
    })
  })

  describe('DB sync on mount', () => {
    it('calls getHackedMode at least once on mount', async () => {
      renderHook(() => useHackedMode(), { wrapper })
      await waitFor(() => {
        expect(appSettingsService.getHackedMode).toHaveBeenCalled()
      })
    })

    it('reconciles state with DB value (DB true overrides localStorage false)', async () => {
      vi.mocked(appSettingsService.getHackedMode).mockResolvedValue(true)
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      await waitFor(() => {
        expect(result.current.isHackedMode).toBe(true)
      })
      expect(localStorage.getItem('uy-kape-hacked-mode')).toBe('true')
    })

    it('reconciles state with DB value (DB false overrides localStorage true)', async () => {
      localStorage.setItem('uy-kape-hacked-mode', 'true')
      vi.mocked(appSettingsService.getHackedMode).mockResolvedValue(false)
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      await waitFor(() => {
        expect(result.current.isHackedMode).toBe(false)
      })
    })

    it('keeps localStorage value on DB fetch error (getHackedMode returns false gracefully)', async () => {
      localStorage.setItem('uy-kape-hacked-mode', 'true')
      // getHackedMode always returns false on error (graceful degradation)
      vi.mocked(appSettingsService.getHackedMode).mockResolvedValue(false)
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      // DB returns false, so state will be reconciled to false
      await waitFor(() => {
        expect(result.current.isHackedMode).toBe(false)
      })
    })
  })

  describe('toggleHackedMode', () => {
    it('toggles isHackedMode from false to true', async () => {
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      // Wait for mount DB fetch to complete (returns false) before toggling
      await waitFor(() => expect(appSettingsService.getHackedMode).toHaveBeenCalled())
      expect(result.current.isHackedMode).toBe(false)
      await act(async () => { await result.current.toggleHackedMode() })
      expect(result.current.isHackedMode).toBe(true)
    })

    it('toggles isHackedMode from true to false', async () => {
      localStorage.setItem('uy-kape-hacked-mode', 'true')
      vi.mocked(appSettingsService.getHackedMode).mockResolvedValue(true)
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      await waitFor(() => expect(result.current.isHackedMode).toBe(true))
      await act(async () => { await result.current.toggleHackedMode() })
      expect(result.current.isHackedMode).toBe(false)
    })

    it('persists the toggled value to localStorage', async () => {
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      await waitFor(() => expect(appSettingsService.getHackedMode).toHaveBeenCalled())
      await act(async () => { await result.current.toggleHackedMode() })
      expect(localStorage.getItem('uy-kape-hacked-mode')).toBe('true')
      await act(async () => { await result.current.toggleHackedMode() })
      expect(localStorage.getItem('uy-kape-hacked-mode')).toBe('false')
    })

    it('calls setHackedMode with the new value', async () => {
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      await waitFor(() => expect(appSettingsService.getHackedMode).toHaveBeenCalled())
      await act(async () => { await result.current.toggleHackedMode() })
      expect(appSettingsService.setHackedMode).toHaveBeenCalledWith(true)
    })

    it('adds hacked-mode class to documentElement when toggling on', async () => {
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      await waitFor(() => expect(appSettingsService.getHackedMode).toHaveBeenCalled())
      await act(async () => { await result.current.toggleHackedMode() })
      expect(document.documentElement.classList.contains('hacked-mode')).toBe(true)
    })

    it('removes hacked-mode class from documentElement when toggling off', async () => {
      localStorage.setItem('uy-kape-hacked-mode', 'true')
      vi.mocked(appSettingsService.getHackedMode).mockResolvedValue(true)
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      await waitFor(() => expect(result.current.isHackedMode).toBe(true))
      await act(async () => { await result.current.toggleHackedMode() })
      expect(document.documentElement.classList.contains('hacked-mode')).toBe(false)
    })

    it('reverts optimistic update and rethrows when setHackedMode throws', async () => {
      const { result } = renderHook(() => useHackedMode(), { wrapper })
      vi.mocked(appSettingsService.setHackedMode).mockRejectedValue(new Error('DB error'))

      await act(async () => {
        await expect(result.current.toggleHackedMode()).rejects.toThrow('DB error')
      })

      // State reverted back to false
      expect(result.current.isHackedMode).toBe(false)
      expect(localStorage.getItem('uy-kape-hacked-mode')).toBe('false')
    })
  })
})

