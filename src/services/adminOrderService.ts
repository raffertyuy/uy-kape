import { supabase } from '@/lib/supabase'
import { appConfig } from '@/config/app.config'
import type { 
  OrderStatus 
} from '@/types/order.types'
import type {
  OrderFilters,
  OrderStatistics,
  BulkOrderOperation,
  BulkOperationResult,
  AdminOrderListItem,
  AdminOrderError,
  QueueManagement
} from '@/types/admin.types'

// Utility function for handling Supabase errors in admin context
const handleAdminSupabaseError = (error: any, context?: string): never => {
  console.error(`Admin order operation failed${context ? ` (${context})` : ''}:`, error)
  const adminError: AdminOrderError = {
    type: 'database',
    message: error.message || 'Database operation failed',
    details: error
  }
  throw adminError
}

// Validate admin order filters
const validateOrderFilters = (filters: OrderFilters): void => {
  if (filters.date_from && filters.date_to) {
    const fromDate = new Date(filters.date_from)
    const toDate = new Date(filters.date_to)
    
    if (fromDate > toDate) {
      const error: AdminOrderError = {
        type: 'validation',
        message: 'Start date cannot be after end date'
      }
      throw error
    }
  }

  if (filters.queue_position_min && filters.queue_position_max) {
    if (filters.queue_position_min > filters.queue_position_max) {
      const error: AdminOrderError = {
        type: 'validation',
        message: 'Minimum queue position cannot be greater than maximum'
      }
      throw error
    }
  }
}

// Build query filters for Supabase
const buildQueryFilters = (query: any, filters: OrderFilters) => {
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.guest_name) {
    query = query.ilike('guest_name', `%${filters.guest_name}%`)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    const endDate = new Date(filters.date_to)
    endDate.setHours(23, 59, 59, 999)
    query = query.lte('created_at', endDate.toISOString())
  }

  if (filters.queue_position_min) {
    query = query.gte('queue_number', filters.queue_position_min)
  }

  if (filters.queue_position_max) {
    query = query.lte('queue_number', filters.queue_position_max)
  }

  return query
}

// Format order with details for admin display
const formatOrderForAdmin = async (order: any): Promise<AdminOrderListItem> => {
  // Get order options for this order
  const { data: options, error: optionsError } = await supabase
    .from('order_options')
    .select(`
      option_category_id,
      option_value_id,
      option_categories:option_category_id (
        name
      ),
      option_values:option_value_id (
        name
      )
    `)
    .eq('order_id', order.id)

  if (optionsError) {
    console.warn('Failed to get order options for order:', order.id, optionsError)
  }

  // Format option details
  const selectedOptions = (options || []).map(option => ({
    option_category_id: option.option_category_id,
    option_category_name: (option as any).option_categories?.name || 'Unknown',
    option_value_id: option.option_value_id,
    option_value_name: (option as any).option_values?.name || 'Unknown'
  }))

  // Calculate estimated completion time based on queue position
  const estimatedMinutes = Math.max(1, (order.queue_number || 0) * appConfig.waitTimePerOrder)
  const estimatedCompletionTime = new Date(Date.now() + estimatedMinutes * 60000).toISOString()

  // Determine priority level based on order age and special requests
  const orderAge = Date.now() - new Date(order.created_at).getTime()
  const ageInMinutes = orderAge / (1000 * 60)
  let priorityLevel: 'normal' | 'high' | 'urgent' = 'normal'
  
  if (ageInMinutes > 30) {
    priorityLevel = 'urgent'
  } else if (ageInMinutes > 15 || order.special_request) {
    priorityLevel = 'high'
  }

  return {
    id: order.id,
    guest_name: order.guest_name,
    drink_id: order.drink_id,
    drink_name: (order as any).drinks?.name || 'Unknown',
    category_name: (order as any).drinks?.drink_categories?.name || 'Unknown',
    special_request: order.special_request,
    status: order.status || 'pending',
    queue_number: order.queue_number || 0,
    selected_options: selectedOptions,
    created_at: order.created_at || '',
    updated_at: order.updated_at || '',
    estimated_completion_time: estimatedCompletionTime,
    priority_level: priorityLevel
  }
}

export const adminOrderService = {
  /**
   * Get all orders with optional filtering and pagination
   */
  getAllOrders: async (
    filters: OrderFilters = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ orders: AdminOrderListItem[], total: number }> => {
    try {
      validateOrderFilters(filters)

      // Build base query
      let query = supabase
        .from('orders')
        .select(`
          *,
          drinks:drink_id (
            name,
            drink_categories:category_id (
              name
            )
          )
        `, { count: 'exact' })

      // Apply filters
      query = buildQueryFilters(query, filters)

      // Add ordering - pending orders first by queue number, then by created date
      query = query.order('status', { ascending: true })
      query = query.order('queue_number', { ascending: true, nullsFirst: false })
      query = query.order('created_at', { ascending: true })

      // Add pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data: orders, error, count } = await query

      if (error) handleAdminSupabaseError(error, 'getAllOrders')
      if (!orders) return { orders: [], total: 0 }

      // Format orders for admin display
      const formattedOrders = await Promise.all(
        orders.map(order => formatOrderForAdmin(order))
      )

      return {
        orders: formattedOrders,
        total: count || 0
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const adminError: AdminOrderError = {
        type: 'unknown',
        message: 'Failed to fetch orders',
        details: error
      }
      throw adminError
    }
  },

  /**
   * Get pending orders in queue order
   */
  getPendingOrders: async (): Promise<AdminOrderListItem[]> => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          drinks:drink_id (
            name,
            drink_categories:category_id (
              name
            )
          )
        `)
        .eq('status', 'pending')
        .order('queue_number', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })

      if (error) handleAdminSupabaseError(error, 'getPendingOrders')
      if (!orders) return []

      // Format orders for admin display
      const formattedOrders = await Promise.all(
        orders.map(order => formatOrderForAdmin(order))
      )

      return formattedOrders
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const adminError: AdminOrderError = {
        type: 'unknown',
        message: 'Failed to fetch pending orders',
        details: error
      }
      throw adminError
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) handleAdminSupabaseError(error, 'updateOrderStatus')
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const adminError: AdminOrderError = {
        type: 'unknown',
        message: 'Failed to update order status',
        order_ids: [orderId],
        details: error
      }
      throw adminError
    }
  },

  /**
   * Perform bulk operations on multiple orders
   */
  performBulkOperation: async (operation: BulkOrderOperation): Promise<BulkOperationResult> => {
    const result: BulkOperationResult = {
      success_count: 0,
      failed_count: 0,
      errors: []
    }

    for (const orderId of operation.order_ids) {
      try {
        switch (operation.operation) {
          case 'mark_ready':
            await adminOrderService.updateOrderStatus(orderId, 'ready')
            break
          case 'mark_completed':
            await adminOrderService.updateOrderStatus(orderId, 'completed')
            break
          case 'cancel':
            await adminOrderService.updateOrderStatus(orderId, 'cancelled')
            break
          case 'delete':
            await supabase.from('orders').delete().eq('id', orderId)
            break
          default:
            throw new Error(`Unknown operation: ${operation.operation}`)
        }
        result.success_count++
      } catch (error) {
        result.failed_count++
        result.errors.push({
          order_id: orderId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return result
  },

  /**
   * Clear all pending orders (mark as cancelled)
   */
  clearAllPendingOrders: async (): Promise<BulkOperationResult> => {
    try {
      // Get all pending order IDs
      const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending')

      if (fetchError) handleAdminSupabaseError(fetchError, 'clearAllPendingOrders')
      if (!orders || orders.length === 0) {
        return { success_count: 0, failed_count: 0, errors: [] }
      }

      const orderIds = orders.map(order => order.id)
      
      return await adminOrderService.performBulkOperation({
        order_ids: orderIds,
        operation: 'cancel'
      })
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const adminError: AdminOrderError = {
        type: 'unknown',
        message: 'Failed to clear pending orders',
        details: error
      }
      throw adminError
    }
  },

  /**
   * Get order statistics for dashboard
   */
  getOrderStatistics: async (dateRange?: { from: string; to: string }): Promise<OrderStatistics> => {
    try {
      let query = supabase.from('orders').select('status, created_at, updated_at')

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from)
          .lte('created_at', dateRange.to)
      }

      const { data: orders, error } = await query

      if (error) handleAdminSupabaseError(error, 'getOrderStatistics')
      if (!orders) {
        return {
          total_pending: 0,
          total_ready: 0,
          total_completed: 0,
          total_cancelled: 0,
          average_wait_time: 0,
          orders_today: 0,
          peak_hours: []
        }
      }

      // Calculate statistics
      const stats = {
        total_pending: orders.filter(o => o.status === 'pending').length,
        total_ready: orders.filter(o => o.status === 'ready').length,
        total_completed: orders.filter(o => o.status === 'completed').length,
        total_cancelled: orders.filter(o => o.status === 'cancelled').length,
        average_wait_time: (() => {
          // Calculate average wait time for completed orders
          const completedOrders = orders.filter(o => o.status === 'completed' && o.created_at && o.updated_at)
          if (completedOrders.length === 0) return 0
          const totalWaitTimeMinutes = completedOrders.reduce((sum, o) => {
            if (!o.created_at || !o.updated_at) return sum
            const created = new Date(o.created_at)
            const completed = new Date(o.updated_at)
            const diffMs = completed.getTime() - created.getTime()
            const diffMinutes = diffMs / (1000 * 60)
            return sum + diffMinutes
          }, 0)
          return Math.round(totalWaitTimeMinutes / completedOrders.length)
        })(),
        orders_today: orders.filter(o => {
          if (!o.created_at) return false
          const orderDate = new Date(o.created_at)
          const today = new Date()
          return orderDate.toDateString() === today.toDateString()
        }).length,
        peak_hours: [] as Array<{ hour: number; count: number }>
      }

      // Calculate peak hours
      const hourCounts: Record<number, number> = {}
      orders.forEach(order => {
        if (order.created_at) {
          const hour = new Date(order.created_at).getHours()
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        }
      })

      stats.peak_hours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return stats
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const adminError: AdminOrderError = {
        type: 'unknown',
        message: 'Failed to fetch order statistics',
        details: error
      }
      throw adminError
    }
  },

  /**
   * Get queue management information
   */
  getQueueManagement: async (): Promise<QueueManagement> => {
    try {
      const { data: pendingOrders, error } = await supabase
        .from('orders')
        .select('queue_number, created_at')
        .eq('status', 'pending')
        .order('queue_number', { ascending: true })

      if (error) handleAdminSupabaseError(error, 'getQueueManagement')

      const totalOrders = pendingOrders?.length || 0
      const currentPosition = totalOrders > 0 ? (pendingOrders?.[0]?.queue_number || 1) : 0
      const averageProcessingTime = 3 // minutes per order
      const estimatedCompletionTime = new Date(
        Date.now() + totalOrders * averageProcessingTime * 60000
      ).toISOString()

      return {
        total_orders: totalOrders,
        current_position: currentPosition,
        estimated_completion_time: estimatedCompletionTime,
        average_processing_time: averageProcessingTime
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const adminError: AdminOrderError = {
        type: 'unknown',
        message: 'Failed to fetch queue management data',
        details: error
      }
      throw adminError
    }
  },

  /**
   * Subscribe to real-time order updates
   */
  subscribeToOrderUpdates: (callback: (_payload: any) => void) => {
    const subscription = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        callback
      )
      .subscribe()

    return subscription
  },

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromOrderUpdates: (subscription: any) => {
    return supabase.removeChannel(subscription)
  }
}