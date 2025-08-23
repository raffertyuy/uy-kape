import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { orderService } from '@/services/orderService'
import { appConfig } from '@/config/app.config'
import type { OrderServiceError } from '@/types/order.types'

interface QueueStatusData {
  position: number
  estimatedWaitTime: string
  isReady: boolean
  orderStatus: 'pending' | 'completed' | 'cancelled'
}

interface UseQueueStatusReturn {
  // Queue data
  queueStatus: QueueStatusData | null
  
  // Loading state
  isLoading: boolean
  
  // Error handling
  error: OrderServiceError | null
  
  // Actions
  refreshStatus: () => Promise<void>
  clearError: () => void
  
  // Real-time subscription status
  isConnected: boolean
}

export function useQueueStatus(orderId: string | null): UseQueueStatusReturn {
  // State
  const [queueStatus, setQueueStatus] = useState<QueueStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<OrderServiceError | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Fetch queue status
  const fetchQueueStatus = useCallback(async (orderIdToFetch: string): Promise<void> => {
    try {
      setError(null)
      
      // Get current queue position
      const position = await orderService.getQueuePosition(orderIdToFetch)
      
      // Get order details
      const orderDetails = await orderService.getOrderWithDetails(orderIdToFetch)
      
      if (!orderDetails) {
        throw new Error('Order not found')
      }
      
      const status = orderDetails.status as QueueStatusData['orderStatus']
      const isReady = status === 'completed'
      
      // Calculate estimated wait time based on position
      const estimatedWaitTime = position > 0 
        ? `${Math.max(1, position * appConfig.waitTimePerOrder)} minutes`
        : isReady 
        ? 'Order completed!'
        : 'Preparing your order...'

      setQueueStatus({
        position,
        estimatedWaitTime,
        isReady,
        orderStatus: status
      })
    } catch (err) {
      if (err && typeof err === 'object' && 'type' in err) {
        setError(err as OrderServiceError)
      } else {
        setError({
          type: 'network',
          message: err instanceof Error ? err.message : 'Failed to fetch queue status'
        })
      }
    }
  }, [])

  // Refresh status action
  const refreshStatus = useCallback(async (): Promise<void> => {
    if (!orderId) return
    
    setIsLoading(true)
    await fetchQueueStatus(orderId)
    setIsLoading(false)
  }, [orderId, fetchQueueStatus])

  // Clear error action
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial fetch when orderId changes
  useEffect(() => {
    if (!orderId) {
      setQueueStatus(null)
      setError(null)
      setIsConnected(false)
      return
    }

    refreshStatus()
  }, [orderId, refreshStatus])

  // Set up real-time subscription for order updates
  useEffect(() => {
    if (!orderId) {
      setIsConnected(false)
      return
    }

    setIsConnected(true)

    // Subscribe to order changes
    const orderSubscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (_payload) => {
          // Refresh status when order is updated
          refreshStatus()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    // Subscribe to queue position changes (when other orders are updated)
    const queueSubscription = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          // Only refresh if this affects our queue position
          const updatedOrder = payload.new || payload.old
          if (updatedOrder && 'id' in updatedOrder && updatedOrder.id !== orderId) {
            // Debounce to avoid too many updates
            setTimeout(() => refreshStatus(), 1000)
          }
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      orderSubscription.unsubscribe()
      queueSubscription.unsubscribe()
      setIsConnected(false)
    }
  }, [orderId, refreshStatus])

  // Auto-refresh every 30 seconds as backup
  useEffect(() => {
    if (!orderId || !queueStatus) return

    const interval = window.setInterval(() => {
      refreshStatus()
    }, 30000) // 30 seconds

    return () => window.clearInterval(interval)
  }, [orderId, queueStatus, refreshStatus])

  return {
    // Queue data
    queueStatus,
    
    // Loading state
    isLoading,
    
    // Error handling
    error,
    
    // Actions
    refreshStatus,
    clearError,
    
    // Real-time subscription status
    isConnected
  }
}

export default useQueueStatus