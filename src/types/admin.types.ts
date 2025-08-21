import type { OrderStatus, OrderWithDetails } from './order.types'

// Admin-specific order filters
export interface OrderFilters {
  status?: OrderStatus | 'all'
  guest_name?: string
  date_from?: string
  date_to?: string
  queue_position_min?: number
  queue_position_max?: number
}

// Order statistics for dashboard
export interface OrderStatistics {
  total_pending: number
  total_ready: number
  total_completed: number
  total_cancelled: number
  average_wait_time: number
  orders_today: number
  peak_hours: Array<{
    hour: number
    count: number
  }>
}

// Bulk operation types
export interface BulkOrderOperation {
  order_ids: string[]
  operation: 'mark_ready' | 'mark_completed' | 'cancel' | 'delete'
}

// Bulk operation result
export interface BulkOperationResult {
  success_count: number
  failed_count: number
  errors: Array<{
    order_id: string
    error: string
  }>
}

// Admin order list item with essential display information
export interface AdminOrderListItem extends OrderWithDetails {
  estimated_completion_time?: string
  priority_level?: 'normal' | 'high' | 'urgent'
}

// Real-time subscription payload
export interface OrderRealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: OrderWithDetails | null
  old: OrderWithDetails | null
}

// Admin order service configuration
export interface AdminOrderServiceConfig {
  max_orders_per_page: number
  auto_refresh_interval: number
  enable_audio_alerts: boolean
  enable_browser_notifications: boolean
}

// Order queue management
export interface QueueManagement {
  total_orders: number
  current_position: number
  estimated_completion_time: string
  average_processing_time: number
}

// Admin operation audit log
export interface AdminOperationLog {
  id: string
  operation_type: 'status_update' | 'bulk_operation' | 'order_cancellation'
  order_ids: string[]
  performed_at: string
  details: Record<string, unknown>
}

// Notification preferences
export interface NotificationSettings {
  new_order_sound: boolean
  new_order_browser: boolean
  order_ready_sound: boolean
  volume_level: number
  notification_duration: number
}

// Error types specific to admin operations
export interface AdminOrderError {
  type: 'permission' | 'validation' | 'network' | 'database' | 'bulk_operation' | 'unknown'
  message: string
  order_ids?: string[]
  details?: unknown
}