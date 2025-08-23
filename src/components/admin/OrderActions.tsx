import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getNextStatuses, isStatusActionable } from '@/utils/orderStatus'
import type { OrderStatus } from '@/types/order.types'
import type { AdminOrderListItem } from '@/types/admin.types'

interface OrderActionsProps {
  order: AdminOrderListItem
  onStatusUpdate: (_orderId: string, _status: OrderStatus) => Promise<void>
  className?: string | undefined
  compact?: boolean
  showConfirmation?: boolean
}

/**
 * Action buttons for individual orders with confirmation dialogs
 * Provides quick access to common order status transitions
 */
export const OrderActions = ({
  order,
  onStatusUpdate,
  className,
  compact = false,
  showConfirmation = true
}: OrderActionsProps) => {
  const [loading, setLoading] = useState<OrderStatus | null>(null)
  const [showConfirm, setShowConfirm] = useState<OrderStatus | null>(null)

  // Get available status transitions
  const nextStatuses = getNextStatuses(order.status)
  
  // Don't render if no actions are available
  if (!isStatusActionable(order.status) || nextStatuses.length === 0) {
    return null
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (showConfirmation && (newStatus === 'cancelled' || newStatus === 'completed')) {
      setShowConfirm(newStatus)
      return
    }

    await executeStatusUpdate(newStatus)
  }

  const executeStatusUpdate = async (newStatus: OrderStatus) => {
    setLoading(newStatus)
    setShowConfirm(null)
    
    try {
      await onStatusUpdate(order.id, newStatus)
    } catch (error) {
      console.error('Failed to update order status:', error)
      // TODO: Show error toast
    } finally {
      setLoading(null)
    }
  }

  const getButtonConfig = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Complete',
          icon: '🎉',
          className: 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500',
          loadingText: 'Completing...'
        }
      case 'cancelled':
        return {
          label: 'Cancel',
          icon: '❌',
          className: 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500',
          loadingText: 'Cancelling...'
        }
      default:
        return {
          label: status,
          icon: '⚪',
          className: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
          loadingText: 'Updating...'
        }
    }
  }

  const buttonSize = compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {nextStatuses.map((status) => {
        const config = getButtonConfig(status)
        const isLoading = loading === status
        
        return (
          <button
            key={status}
            onClick={() => handleStatusUpdate(status)}
            disabled={loading !== null}
            className={cn(
              'inline-flex items-center font-medium rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              buttonSize,
              config.className,
              isLoading && 'cursor-wait'
            )}
            aria-label={`${config.label} order for ${order.guest_name}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-1" />
                {config.loadingText}
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
      })}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {showConfirm === 'cancelled' ? 'cancel' : 'complete'} this order for {order.guest_name}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => executeStatusUpdate(showConfirm)}
                disabled={loading !== null}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1',
                  getButtonConfig(showConfirm).className
                )}
              >
                {getButtonConfig(showConfirm).label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Quick action buttons without confirmation
export const OrderQuickActions = ({ 
  order, 
  onStatusUpdate, 
  className = undefined 
}: Omit<OrderActionsProps, 'showConfirmation'>) => {
  return (
    <OrderActions
      order={order}
      onStatusUpdate={onStatusUpdate}
      className={className}
      compact
      showConfirmation={false}
    />
  )
}

// Status update dropdown for more options
export const OrderStatusDropdown = ({
  order,
  onStatusUpdate,
  className
}: Omit<OrderActionsProps, 'compact' | 'showConfirmation'>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

    const allStatuses: OrderStatus[] = ['pending', 'completed', 'cancelled']
  const availableStatuses = allStatuses.filter(status => status !== order.status)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true)
    setIsOpen(false)

    try {
      await onStatusUpdate(order.id, newStatus)
    } catch (error) {
      console.error('Failed to update order status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={cn(
          'inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
        )}
        aria-label={`Change status for order ${order.id}`}
        aria-expanded={isOpen}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-2" />
            Updating...
          </>
        ) : (
          <>
            Change Status
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
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
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20 dark:bg-gray-800 dark:border-gray-700">
            <div className="py-1">
              {availableStatuses.map((status) => {
                const config = {
                  pending: { label: 'Mark as Pending', icon: '⏳' },
                  completed: { label: 'Mark as Completed', icon: '🎉' },
                  cancelled: { label: 'Mark as Cancelled', icon: '❌' }
                }[status]

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <span className="mr-2" aria-hidden="true">
                      {config.icon}
                    </span>
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}