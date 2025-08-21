import { useState, useEffect, useCallback, useRef } from 'react'
import { adminOrderService } from '@/services/adminOrderService'
import type { AdminOrderListItem, AdminOrderError, OrderFilters } from '@/types/admin.types'
import type { OrderStatus } from '@/types/order.types'

interface UseRealtimeOrdersState {
  orders: AdminOrderListItem[]
  loading: boolean
  error: AdminOrderError | null
  total: number
  connected: boolean
  lastUpdated: Date | null
}

interface UseRealtimeOrdersOptions {
  filters?: OrderFilters
  page?: number
  pageSize?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseRealtimeOrdersReturn extends UseRealtimeOrdersState {
  refetch: () => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  reconnect: () => void
  clearError: () => void
}

/**
 * Custom hook for real-time order management with automatic reconnection
 * Provides comprehensive order data fetching, real-time subscriptions, and state management
 */
export const useRealtimeOrders = (options: UseRealtimeOrdersOptions = {}): UseRealtimeOrdersReturn => {
  const {
    filters = {},
    page = 1,
    pageSize = 50,
    autoRefresh = true,
    refreshInterval = 30000
  } = options

  const [state, setState] = useState<UseRealtimeOrdersState>({
    orders: [],
    loading: true,
    error: null,
    total: 0,
    connected: false,
    lastUpdated: null
  })

  const subscriptionRef = useRef<any>(null)
  const refreshIntervalRef = useRef<any>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await adminOrderService.getAllOrders(filters, page, pageSize)
      
      setState(prev => ({
        ...prev,
        orders: result.orders,
        total: result.total,
        loading: false,
        lastUpdated: new Date(),
        error: null
      }))
      
      reconnectAttemptsRef.current = 0
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as AdminOrderError
      }))
    }
  }, [filters, page, pageSize])

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: any) => {    
    setState(prev => ({
      ...prev,
      lastUpdated: new Date()
    }))

    // Optimistically update the local state based on the change
    if (payload.eventType === 'INSERT' && payload.new) {
      // Refresh to get proper order formatting
      fetchOrders()
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      setState(prev => ({
        ...prev,
        orders: prev.orders.map(order => 
          order.id === payload.new.id 
            ? { ...order, ...payload.new, updated_at: new Date().toISOString() }
            : order
        )
      }))
    } else if (payload.eventType === 'DELETE' && payload.old) {
      setState(prev => ({
        ...prev,
        orders: prev.orders.filter(order => order.id !== payload.old.id),
        total: Math.max(0, prev.total - 1)
      }))
    }
  }, [fetchOrders])

  // Setup real-time subscription
  const setupSubscription = useCallback(() => {
    try {
      if (subscriptionRef.current) {
        adminOrderService.unsubscribeFromOrderUpdates(subscriptionRef.current)
      }

      subscriptionRef.current = adminOrderService.subscribeToOrderUpdates(handleRealtimeUpdate)
      
      setState(prev => ({ ...prev, connected: true }))
    } catch (error) {
      console.error('Failed to setup real-time subscription:', error)
      setState(prev => ({ ...prev, connected: false }))
      
      // Attempt to reconnect with exponential backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
        reconnectAttemptsRef.current++
        
        setTimeout(() => {
          setupSubscription()
        }, delay)
      }
    }
  }, [handleRealtimeUpdate])

  // Manual reconnection function
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    setupSubscription()
  }, [setupSubscription])

  // Update order status with optimistic updates
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    // Optimistic update
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(order =>
        order.id === orderId
          ? { ...order, status, updated_at: new Date().toISOString() }
          : order
      )
    }))

    try {
      await adminOrderService.updateOrderStatus(orderId, status)
    } catch (error) {
      console.error('Failed to update order status:', error)
      // Revert optimistic update and refresh
      await fetchOrders()
      throw error
    }
  }, [fetchOrders])

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Setup auto-refresh interval
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = window.setInterval(fetchOrders, refreshInterval)
      
      return () => {
        if (refreshIntervalRef.current) {
          window.clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [autoRefresh, refreshInterval, fetchOrders])

  // Initial data fetch and subscription setup
  useEffect(() => {
    fetchOrders()
    setupSubscription()

    return () => {
      if (subscriptionRef.current) {
        adminOrderService.unsubscribeFromOrderUpdates(subscriptionRef.current)
      }
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current)
      }
    }
  }, [fetchOrders, setupSubscription])

  // Refetch when filters, page, or pageSize change
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders: state.orders,
    loading: state.loading,
    error: state.error,
    total: state.total,
    connected: state.connected,
    lastUpdated: state.lastUpdated,
    refetch: fetchOrders,
    updateOrderStatus,
    reconnect,
    clearError
  }
}