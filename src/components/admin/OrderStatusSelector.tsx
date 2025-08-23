import { useState } from 'react'
import { cn } from '@/lib/utils'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { OrderStatus } from '@/types/order.types'
import type { AdminOrderListItem } from '@/types/admin.types'

interface OrderStatusSelectorProps {
  order: AdminOrderListItem
  onStatusUpdate: (_orderId: string, _status: OrderStatus) => Promise<void>
  className?: string | undefined
  disabled?: boolean
  showCurrentStatus?: boolean
}

/**
 * Dropdown selector for changing order status
 * Provides visual feedback and prevents invalid status transitions
 */
export const OrderStatusSelector = ({
  order,
  onStatusUpdate,
  className,
  disabled = false,
  showCurrentStatus = true
}: OrderStatusSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Define all possible statuses and their display configuration
  const statusConfig: Record<OrderStatus, { label: string; icon: string; description: string }> = {
    pending: {
      label: 'Pending',
      icon: '⏳',
      description: 'Order is being prepared'
    },
    completed: {
      label: 'Completed',
      icon: '🎉',
      description: 'Order has been picked up'
    },
    cancelled: {
      label: 'Cancelled',
      icon: '❌',
      description: 'Order has been cancelled'
    }
  }

  // Get available status options (excluding current status)
  const getAvailableStatuses = (): OrderStatus[] => {
    const currentStatus = order.status
    const allStatuses: OrderStatus[] = ['pending', 'completed', 'cancelled']
    
    // Filter out current status
    return allStatuses.filter(status => status !== currentStatus)
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true)
    setIsOpen(false)

    try {
      await onStatusUpdate(order.id, newStatus)
    } catch (error) {
      console.error('Failed to update order status:', error)
      // TODO: Show error notification
    } finally {
      setLoading(false)
    }
  }

  const availableStatuses = getAvailableStatuses()

  return (
    <div className={cn('relative', className)}>
      {/* Current Status Display */}
      {showCurrentStatus && (
        <div className="mb-2">
          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Status
          </div>
          <OrderStatusBadge status={order.status} size="lg" />
        </div>
      )}

      {/* Status Selector */}
      <div className="relative">
        <label htmlFor={`status-selector-${order.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Change Status
        </label>
        
        <button
          id={`status-selector-${order.id}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || loading || availableStatuses.length === 0}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            disabled || loading
              ? 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
          )}
          aria-label={`Change status for order ${order.id}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-2 inline-block" />
                Updating...
              </>
            ) : availableStatuses.length === 0 ? (
              'No status changes available'
            ) : (
              'Select new status...'
            )}
          </span>
          
          {!disabled && !loading && availableStatuses.length > 0 && (
            <svg 
              className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && availableStatuses.length > 0 && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false)
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Close dropdown"
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-20 dark:bg-gray-800 dark:border-gray-700">
              <div className="py-1" role="listbox">
                {availableStatuses.map((status) => {
                  const config = statusConfig[status]
                  
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full flex items-start px-4 py-3 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                      role="option"
                      aria-selected="false"
                    >
                      <span className="mr-3 text-lg" aria-hidden="true">
                        {config.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {config.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {config.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status Transition Info */}
      {showCurrentStatus && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Order Information
          </h4>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>Guest: {order.guest_name}</div>
            <div>Drink: {order.drink_name || 'Unknown'}</div>
            <div>Queue: #{order.queue_number}</div>
            {order.special_request && (
              <div>Special Request: {order.special_request}</div>
            )}
            <div>Created: {new Date(order.created_at).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact inline version for list views
export const InlineStatusSelector = ({ 
  order, 
  onStatusUpdate, 
  className 
}: Omit<OrderStatusSelectorProps, 'showCurrentStatus' | 'disabled'>) => {
  return (
    <OrderStatusSelector
      order={order}
      onStatusUpdate={onStatusUpdate}
      className={className}
      showCurrentStatus={false}
    />
  )
}

// Quick toggle for binary status changes (e.g., pending <-> ready)
export const StatusToggle = ({
  order,
  onStatusUpdate,
  className
}: Omit<OrderStatusSelectorProps, 'showCurrentStatus' | 'disabled'>) => {
  const [loading, setLoading] = useState(false)

  const getToggleStatus = (): OrderStatus | null => {
    switch (order.status) {
      case 'pending':
        return 'completed'
      default:
        return null
    }
  }

  const handleToggle = async () => {
    const newStatus = getToggleStatus()
    if (!newStatus) return

    setLoading(true)
    try {
      await onStatusUpdate(order.id, newStatus)
    } catch (error) {
      console.error('Failed to toggle order status:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = getToggleStatus()
  if (!toggleStatus) return null

  const getToggleConfig = () => {
    switch (toggleStatus) {
      case 'completed':
        return {
          label: 'Complete',
          icon: '🎉',
          className: 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
        }
      default:
        return {
          label: 'Update',
          icon: '⚪',
          className: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
        }
    }
  }

  const config = getToggleConfig()

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        config.className,
        className
      )}
      aria-label={`${config.label} order for ${order.guest_name}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-1" />
          Updating...
        </>
      ) : (
        <>
          <span className="mr-1" aria-hidden="true">
            {config.icon}
          </span>
          {config.label}
        </>
      )}
    </button>
  )
}