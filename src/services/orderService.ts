import { supabase } from '@/lib/supabase'
import type {
  GuestOrderForm,
  OrderSubmissionResult,
  OrderWithDetails,
  QueueStatus,
  OrderServiceError,
  OrderOptionsDetail,
  OrderStatus
} from '@/types/order.types'

// Utility function for handling Supabase errors
const handleSupabaseError = (error: any): never => {
  console.error('Order service operation failed:', error)
  const serviceError: OrderServiceError = {
    type: 'database',
    message: error.message || 'Database operation failed',
    details: error
  }
  throw serviceError
}

// Validate guest order form
const validateOrderForm = (orderData: GuestOrderForm): void => {
  if (!orderData.guest_name?.trim()) {
    const error: OrderServiceError = {
      type: 'validation',
      message: 'Guest name is required'
    }
    throw error
  }

  if (!orderData.drink_id?.trim()) {
    const error: OrderServiceError = {
      type: 'validation',
      message: 'Please select a drink'
    }
    throw error
  }

  if (orderData.guest_name.length > 100) {
    const error: OrderServiceError = {
      type: 'validation',
      message: 'Guest name must be less than 100 characters'
    }
    throw error
  }

  if (orderData.special_request && orderData.special_request.length > 500) {
    const error: OrderServiceError = {
      type: 'validation',
      message: 'Special request must be less than 500 characters'
    }
    throw error
  }
}

// Calculate queue position for new order
const calculateQueuePosition = async (orderCreatedAt: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('calculate_queue_number', { order_created_at: orderCreatedAt })

    if (error) handleSupabaseError(error)
    return data || 1
  } catch (err) {
    console.warn('Failed to calculate queue position, defaulting to 1:', err)
    return 1
  }
}



export const orderService = {
  /**
   * Submit a new guest order
   */
  submitOrder: async (orderData: GuestOrderForm): Promise<OrderSubmissionResult> => {
    try {
      // Validate the order data
      validateOrderForm(orderData)

      // Start a transaction by creating the order first
      const orderCreatedAt = new Date().toISOString()
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          guest_name: orderData.guest_name.trim(),
          drink_id: orderData.drink_id,
          status: 'pending' as OrderStatus,
          created_at: orderCreatedAt,
          special_request: orderData.special_request?.trim() || null
        })
        .select()
        .single()

      if (orderError) handleSupabaseError(orderError)
      if (!order) throw new Error('Failed to create order')

      // Calculate queue position
      const queueNumber = await calculateQueuePosition(orderCreatedAt)
      
      // Update order with queue number
      const { error: updateError } = await supabase
        .from('orders')
        .update({ queue_number: queueNumber })
        .eq('id', order.id)

      if (updateError) {
        console.warn('Failed to update queue number:', updateError)
      }

      // Insert order options if any
      if (Object.keys(orderData.selected_options).length > 0) {
        const orderOptions = Object.entries(orderData.selected_options).map(
          ([categoryId, valueId]) => ({
            order_id: order.id,
            option_category_id: categoryId,
            option_value_id: valueId
          })
        )

        const { error: optionsError } = await supabase
          .from('order_options')
          .insert(orderOptions)

        if (optionsError) {
          console.error('Failed to insert order options:', optionsError)
          // Don't fail the order for option errors, just log them
        }
      }

      return {
        order_id: order.id,
        queue_number: queueNumber,
        estimated_wait_time: `${Math.max(1, queueNumber * 3)} minutes`
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error // Re-throw OrderServiceError
      }
      
      const serviceError: OrderServiceError = {
        type: 'unknown',
        message: error instanceof Error ? error.message : 'Failed to submit order',
        details: error
      }
      throw serviceError
    }
  },

  /**
   * Get current queue position for an order
   */
  getQueuePosition: async (orderId: string): Promise<number> => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('queue_number, status')
        .eq('id', orderId)
        .single()

      if (error) handleSupabaseError(error)
      if (!order) throw new Error('Order not found')

      // If order is no longer pending, queue position is 0
      if (order.status !== 'pending') {
        return 0
      }

      return order.queue_number || 1
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const serviceError: OrderServiceError = {
        type: 'unknown',
        message: 'Failed to get queue position',
        details: error
      }
      throw serviceError
    }
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled' as OrderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) handleSupabaseError(error)
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const serviceError: OrderServiceError = {
        type: 'unknown',
        message: 'Failed to cancel order',
        details: error
      }
      throw serviceError
    }
  },

  /**
   * Get order details with drink and option information
   */
  getOrderWithDetails: async (orderId: string): Promise<OrderWithDetails | null> => {
    try {
      // Get order with drink details
      const { data: order, error: orderError } = await supabase
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
        .eq('id', orderId)
        .single()

      if (orderError) {
        if (orderError.code === 'PGRST116') return null // Not found
        handleSupabaseError(orderError)
      }

      if (!order) return null

      // Get order options
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
        .eq('order_id', orderId)

      if (optionsError) {
        console.warn('Failed to get order options:', optionsError)
      }

      // Format option details
      const selectedOptions: OrderOptionsDetail[] = (options || []).map(option => ({
        option_category_id: option.option_category_id,
        option_category_name: (option as any).option_categories?.name || 'Unknown',
        option_value_id: option.option_value_id,
        option_value_name: (option as any).option_values?.name || 'Unknown'
      }))

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
        updated_at: order.updated_at || ''
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const serviceError: OrderServiceError = {
        type: 'unknown',
        message: 'Failed to get order details',
        details: error
      }
      throw serviceError
    }
  },

  /**
   * Get queue status for an order
   */
  getQueueStatus: async (orderId: string): Promise<QueueStatus> => {
    try {
      const position = await orderService.getQueuePosition(orderId)
      const { data: order, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()

      if (error) handleSupabaseError(error)

      return {
        position,
        estimated_wait_minutes: position > 0 ? Math.max(1, position * 3) : 0,
        status: order?.status || 'pending'
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      const serviceError: OrderServiceError = {
        type: 'unknown',
        message: 'Failed to get queue status',
        details: error
      }
      throw serviceError
    }
  }
}