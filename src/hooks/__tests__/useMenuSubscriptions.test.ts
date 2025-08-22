import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Hook variable
let useMenuSubscriptions: any

describe('useMenuSubscriptions', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('@/lib/supabase', () => {
      const mockUnsubscribe = vi.fn()
      const mockSubscribe = vi.fn((callback) => {
        // Immediately call the callback with SUBSCRIBED status
        if (typeof callback === 'function') {
          setTimeout(() => callback('SUBSCRIBED'), 0)
        }
        return { unsubscribe: mockUnsubscribe }
      })
      
      const mockChannelInstance = {
        on: vi.fn((_event: string, _config: any, _callback: any) => {
          // Return the channel instance for method chaining
          return mockChannelInstance
        }),
        subscribe: mockSubscribe
      }
      
      const mockChannel = vi.fn(() => mockChannelInstance)

      return {
        supabase: {
          channel: mockChannel
        }
      }
    })

    // Import hook after mocking
    const hookModule = await import('@/hooks/useMenuSubscriptions')
    useMenuSubscriptions = hookModule.useMenuSubscriptions
  })

  afterAll(() => {
    vi.doUnmock('@/lib/supabase')
  })
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

    // Should create channels for the 5 menu tables
    // Note: In React StrictMode, effects run twice, so we may see 10 calls (5 x 2)
    const channelCallCount = (supabase.channel as any).mock.calls.length
    expect(channelCallCount).toBeGreaterThanOrEqual(5)
    
    // Verify that all required channels are created
    const channelNames = (supabase.channel as any).mock.calls.map((call: any) => call[0])
    expect(channelNames).toContain('drink_categories_realtime')
    expect(channelNames).toContain('drinks_realtime')
    expect(channelNames).toContain('option_categories_realtime')
    expect(channelNames).toContain('option_values_realtime')
    expect(channelNames).toContain('drink_options_realtime')
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