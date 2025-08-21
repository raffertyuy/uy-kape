import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/order.types'
import type { AdminOrderListItem, BulkOperationResult } from '@/types/admin.types'

interface BulkOrderActionsProps {
  selectedOrders: AdminOrderListItem[]
  onBulkStatusUpdate: (_orderIds: string[], _status: OrderStatus) => Promise<BulkOperationResult>
  onClearSelection: () => void
  className?: string
}

/**
 * Bulk operations component for managing multiple orders at once
 * Provides status updates, batch processing, and operation confirmation
 */
export const BulkOrderActions = ({
  selectedOrders,
  onBulkStatusUpdate,
  onClearSelection,
  className
}: BulkOrderActionsProps) => {
  const [loading, setLoading] = useState<OrderStatus | null>(null)
  const [showConfirm, setShowConfirm] = useState<OrderStatus | null>(null)
  const [lastResult, setLastResult] = useState<BulkOperationResult | null>(null)

  // Don't render if no orders are selected
  if (selectedOrders.length === 0) {
    return null
  }

  const handleBulkAction = (status: OrderStatus) => {
    setShowConfirm(status)
  }

  const executeBulkAction = async (status: OrderStatus) => {
    setLoading(status)
    setShowConfirm(null)

    try {
      const orderIds = selectedOrders.map(order => order.id)
      const result = await onBulkStatusUpdate(orderIds, status)
      setLastResult(result)
      
      // Clear selection if all operations succeeded
      if (result.errors.length === 0) {
        onClearSelection()
      }
    } catch (error) {
      console.error('Bulk operation failed:', error)
      setLastResult({
        success_count: 0,
        failed_count: selectedOrders.length,
        errors: selectedOrders.map(order => ({
          order_id: order.id,
          error: 'Operation failed'
        }))
      })
    } finally {
      setLoading(null)
    }
  }

  // Determine which bulk actions are available
  const getAvailableActions = () => {
    const actions: { status: OrderStatus; label: string; icon: string; className: string }[] = []
    
    // Only show actions that apply to at least some selected orders
    const hasActionableOrders = selectedOrders.some(order => 
      order.status === 'pending' || order.status === 'ready'
    )

    if (hasActionableOrders) {
      actions.push({
        status: 'ready',
        label: 'Mark Ready',
        icon: '✅',
        className: 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
      })
      
      actions.push({
        status: 'completed',
        label: 'Complete',
        icon: '🎉',
        className: 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
      })
    }

    // Always allow cancellation of non-completed orders
    const hasCancellableOrders = selectedOrders.some(order =>
      order.status !== 'completed' && order.status !== 'cancelled'
    )
    
    if (hasCancellableOrders) {
      actions.push({
        status: 'cancelled',
        label: 'Cancel',
        icon: '❌',
        className: 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
      })
    }

    return actions
  }

  const availableActions = getAvailableActions()

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Bulk Actions
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coffee-100 text-coffee-800 dark:bg-coffee-900 dark:text-coffee-200">
            {selectedOrders.length} selected
          </span>
        </div>
        
        <button
          onClick={onClearSelection}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label="Clear selection"
        >
          Clear selection
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableActions.map((action) => {
          const isLoading = loading === action.status
          
          return (
            <button
              key={action.status}
              onClick={() => handleBulkAction(action.status)}
              disabled={loading !== null}
              className={cn(
                'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                action.className,
                isLoading && 'cursor-wait'
              )}
              aria-label={`${action.label} ${selectedOrders.length} selected orders`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2" aria-hidden="true">
                    {action.icon}
                  </span>
                  {action.label} ({selectedOrders.length})
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Orders Preview */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2">Selected orders:</p>
        <div className="max-h-32 overflow-y-auto">
          {selectedOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-1">
              <span>
                {order.guest_name} - {order.selected_options.length} option{order.selected_options.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs capitalize bg-gray-100 text-gray-700 px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {lastResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Operation Results
          </h4>
          
          {lastResult.success_count > 0 && (
            <div className="mb-2">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ {lastResult.success_count} orders updated successfully
              </p>
            </div>
          )}
          
          {lastResult.errors.length > 0 && (
            <div>
              <p className="text-sm text-red-700 dark:text-red-400 mb-1">
                ❌ {lastResult.errors.length} errors:
              </p>
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {lastResult.errors.map((error) => (
                  <li key={error.order_id}>
                    Order {error.order_id}: {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={() => setLastResult(null)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Bulk Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {showConfirm} {selectedOrders.length} selected order{selectedOrders.length !== 1 ? 's' : ''}?
            </p>
            
            <div className="bg-gray-50 rounded-md p-3 mb-6 dark:bg-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                This will affect:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {selectedOrders.slice(0, 5).map((order) => (
                  <li key={order.id}>
                    • {order.guest_name} ({order.status})
                  </li>
                ))}
                {selectedOrders.length > 5 && (
                  <li className="text-gray-500">
                    ... and {selectedOrders.length - 5} more orders
                  </li>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => executeBulkAction(showConfirm)}
                disabled={loading !== null}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1',
                  showConfirm === 'cancelled' 
                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                    : showConfirm === 'ready'
                    ? 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                    : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
                )}
              >
                Confirm {showConfirm === 'cancelled' ? 'Cancellation' : 
                        showConfirm === 'ready' ? 'Mark Ready' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}