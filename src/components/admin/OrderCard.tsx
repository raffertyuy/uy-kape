import { cn } from '@/lib/utils'
import { OrderStatusBadge } from './OrderStatusBadge'
import { QueuePosition, QueuePriorityIndicator } from './QueuePosition'
import { calculateEstimatedTime } from '@/utils/queueUtils'
import type { AdminOrderListItem } from '@/types/admin.types'
import type { OrderStatus } from '@/types/order.types'

interface OrderCardProps {
  order: AdminOrderListItem
  className?: string
  compact?: boolean
  showActions?: boolean
  onStatusUpdate?: ((_orderId: string, _status: OrderStatus) => void) | undefined
  onSelect?: ((_orderId: string, _selected: boolean) => void) | undefined
  isSelected?: boolean
}

/**
 * Individual order display component with status actions
 * Displays order details in a card format with optional selection and actions
 */
export const OrderCard = ({
  order,
  className,
  compact = false,
  showActions = true,
  onStatusUpdate,
  onSelect,
  isSelected = false
}: OrderCardProps) => {
  const estimatedTime = calculateEstimatedTime(order.queue_number || 0)
  const orderAge = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60))

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    onStatusUpdate?.(order.id, newStatus)
  }

  const handleSelectionChange = () => {
    onSelect?.(order.id, !isSelected)
  }

  const handleClick = () => {
    onSelect?.(order.id, !isSelected)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        'hover:shadow-md transition-shadow duration-200',
        'dark:bg-gray-800 dark:border-gray-700',
        isSelected && 'ring-2 ring-coffee-500 border-coffee-300',
        order.priority_level === 'urgent' && 'border-red-300 shadow-red-100',
        order.priority_level === 'high' && 'border-orange-300 shadow-orange-100',
        compact ? 'p-3' : 'p-4',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select order for ${order.guest_name}`}
    >
      {/* Header with selection and status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectionChange}
              className="rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"
              aria-label={`Select order for ${order.guest_name}`}
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {order.guest_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Order #{order.id.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {order.priority_level && (
            <QueuePriorityIndicator priority={order.priority_level} />
          )}
          <OrderStatusBadge status={order.status} size={compact ? 'sm' : 'md'} />
        </div>
      </div>

      {/* Order details */}
      <div className="space-y-2">
        <div>
          <p className="font-medium text-coffee-800 dark:text-coffee-200">
            {order.drink_name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.category_name}
          </p>
        </div>

        {/* Selected options */}
        {order.selected_options && order.selected_options.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Options:
            </p>
            <div className="flex flex-wrap gap-1">
              {order.selected_options.map((option, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {option.option_category_name}: {option.option_value_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Special request */}
        {order.special_request && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Special Request:
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "{order.special_request}"
            </p>
          </div>
        )}
      </div>

      {/* Footer with queue info and timing */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {order.status === 'pending' && order.queue_number && (
              <QueuePosition 
                position={order.queue_number} 
                size={compact ? 'sm' : 'md'}
                showAnimation
              />
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>
                Ordered: {new Date(order.created_at).toLocaleTimeString()}
                {orderAge > 0 && ` (${orderAge}m ago)`}
              </p>
              {order.status === 'pending' && (
                <p>Est. time: {estimatedTime}</p>
              )}
            </div>
          </div>

          {/* Quick action buttons */}
          {showActions && order.status === 'pending' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusUpdate('completed')}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                aria-label="Mark order as completed"
              >
                Complete
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                aria-label="Cancel order"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Compact version for dense layouts
export const OrderCardCompact = ({ order, ...props }: Omit<OrderCardProps, 'compact'>) => {
  return <OrderCard {...props} order={order} compact />
}

// Loading skeleton for order cards
export const OrderCardSkeleton = ({ compact = false }: { compact?: boolean }) => {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse',
      'dark:bg-gray-800 dark:border-gray-700',
      compact ? 'p-3' : 'p-4'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-300 rounded dark:bg-gray-600" />
          <div>
            <div className="w-24 h-4 bg-gray-300 rounded dark:bg-gray-600 mb-1" />
            <div className="w-16 h-3 bg-gray-300 rounded dark:bg-gray-600" />
          </div>
        </div>
        <div className="w-16 h-6 bg-gray-300 rounded-full dark:bg-gray-600" />
      </div>
      
      <div className="space-y-2">
        <div className="w-32 h-4 bg-gray-300 rounded dark:bg-gray-600" />
        <div className="w-24 h-3 bg-gray-300 rounded dark:bg-gray-600" />
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="w-40 h-3 bg-gray-300 rounded dark:bg-gray-600" />
          <div className="w-20 h-6 bg-gray-300 rounded dark:bg-gray-600" />
        </div>
      </div>
    </div>
  )
}