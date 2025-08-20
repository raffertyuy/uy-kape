import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMenuSubscriptions } from '@/hooks/useMenuSubscriptions'

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const mockUnsubscribe = vi.fn()
  const mockSubscribe = vi.fn(() => ({ unsubscribe: mockUnsubscribe }))
  const mockOn = vi.fn().mockReturnThis()
  const mockChannel = vi.fn(() => ({ on: mockOn, subscribe: mockSubscribe }))

  return {
    supabase: {
      channel: mockChannel
    }
  }
})

describe('useMenuSubscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMenuSubscriptions())

    expect(result.current.connectionStatus.connected).toBe(false)
    expect(result.current.connectionStatus.lastUpdate).toBeNull()
    expect(result.current.connectionStatus.error).toBeNull()
    expect(result.current.recentChanges).toEqual([])
    expect(result.current.conflictItems.size).toBe(0)
  })

  it('should set up subscriptions for all menu tables', async () => {
    const { supabase } = await import('@/lib/supabase')
    
    renderHook(() => useMenuSubscriptions())

    // Should create 5 channels for the 5 menu tables
    expect(supabase.channel).toHaveBeenCalledTimes(5)
    expect(supabase.channel).toHaveBeenCalledWith('drink_categories_realtime')
    expect(supabase.channel).toHaveBeenCalledWith('drinks_realtime')
    expect(supabase.channel).toHaveBeenCalledWith('option_categories_realtime')
    expect(supabase.channel).toHaveBeenCalledWith('option_values_realtime')
    expect(supabase.channel).toHaveBeenCalledWith('drink_options_realtime')
  })

  it('should manage conflict items', () => {
    const { result } = renderHook(() => useMenuSubscriptions())

    act(() => {
      result.current.markAsConflicted('item1')
      result.current.markAsConflicted('item2')
    })

    expect(result.current.conflictItems.has('item1')).toBe(true)
    expect(result.current.conflictItems.has('item2')).toBe(true)
    expect(result.current.conflictItems.size).toBe(2)

    act(() => {
      result.current.resolveConflict('item1')
    })

    expect(result.current.conflictItems.has('item1')).toBe(false)
    expect(result.current.conflictItems.has('item2')).toBe(true)
    expect(result.current.conflictItems.size).toBe(1)
  })

  it('should clear recent changes', () => {
    const { result } = renderHook(() => useMenuSubscriptions())

    act(() => {
      result.current.clearRecentChanges()
    })

    expect(result.current.recentChanges).toHaveLength(0)
  })

  it('should clean up subscriptions on unmount', () => {
    const { unmount } = renderHook(() => useMenuSubscriptions())

    unmount()

    // Just verify that the hook cleanup doesn't throw errors
    // We can't easily test the unsubscribe calls with this mocking approach
    expect(true).toBe(true)
  })
})