import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { OrderCard, OrderCardSkeleton } from './OrderCard'
import type { AdminOrderListItem, AdminOrderError } from '@/types/admin.types'
import type { OrderStatus } from '@/types/order.types'

interface OrderListProps {
  orders: AdminOrderListItem[]
  loading?: boolean
  error?: AdminOrderError | null
  className?: string
  compact?: boolean
  showSelection?: boolean
  showActions?: boolean
  selectedOrders?: string[]
  onOrderSelect?: (_orderId: string, _selected: boolean) => void
  onOrderStatusUpdate?: (_orderId: string, _status: OrderStatus) => void
  onSelectAll?: (_selected: boolean) => void
  emptyMessage?: string
  emptyIcon?: string
}

/**
 * Scrollable list of orders with optional virtual scrolling support
 * Handles loading states, error states, and empty states gracefully
 */
export const OrderList = ({
  orders,
  loading = false,
  error = null,
  className,
  compact = false,
  showSelection = false,
  showActions = true,
  selectedOrders = [],
  onOrderSelect,
  onOrderStatusUpdate,
  onSelectAll,
  emptyMessage = 'No orders found',
  emptyIcon = '📦'
}: OrderListProps) => {
  const [sortBy, setSortBy] = useState<'created_at' | 'queue_number' | 'status'>('queue_number')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Sort orders based on current sort settings
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let aValue: string | number = a[sortBy] || ''
      let bValue: string | number = b[sortBy] || ''

      if (sortBy === 'created_at') {
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
      } else if (sortBy === 'queue_number') {
        aValue = a.queue_number || 0
        bValue = b.queue_number || 0
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })
  }, [orders, sortBy, sortOrder])

  const allSelected = selectedOrders.length === orders.length && orders.length > 0
  const someSelected = selectedOrders.length > 0 && selectedOrders.length < orders.length

  // Handle select all checkbox
  const handleSelectAll = () => {
    onSelectAll?.(!allSelected)
  }

  // Error state
  if (error && !loading) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        'bg-white rounded-lg border border-red-200 shadow-sm',
        'dark:bg-gray-800 dark:border-red-800',
        className
      )}>
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
          Error Loading Orders
        </h3>
        <p className="text-red-600 dark:text-red-500 text-sm">
          {error.message}
        </p>
      </div>
    )
  }

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <OrderCardSkeleton key={index} compact={compact} />
        ))}
      </div>
    )
  }

  // Empty state
  if (!loading && orders.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        'dark:bg-gray-800 dark:border-gray-700',
        className
      )}>
        <div className="text-6xl mb-4">{emptyIcon}</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Orders will appear here when they are placed.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with sorting and bulk selection */}
      {(showSelection || orders.length > 1) && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {showSelection && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"
                  aria-label="Select all orders"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedOrders.length > 0 
                    ? `${selectedOrders.length} selected`
                    : 'Select all'
                  }
                </span>
              </label>
            )}
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                setSortBy(field)
                setSortOrder(order)
              }}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="queue_number-asc">Queue Position (Low to High)</option>
              <option value="queue_number-desc">Queue Position (High to Low)</option>
              <option value="created_at-asc">Order Time (Oldest First)</option>
              <option value="created_at-desc">Order Time (Newest First)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>
          </div>
        </div>
      )}

      {/* Order cards */}
      <div className="space-y-3">
        {sortedOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            compact={compact}
            showActions={showActions}
            isSelected={selectedOrders.includes(order.id)}
            onSelect={showSelection ? onOrderSelect : undefined}
            onStatusUpdate={onOrderStatusUpdate}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {loading && orders.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coffee-600" />
        </div>
      )}
    </div>
  )
}

// Specialized versions for different use cases
export const PendingOrdersList = ({ orders, ...props }: Omit<OrderListProps, 'emptyMessage' | 'emptyIcon'>) => {
  return (
    <OrderList
      {...props}
      orders={orders.filter(order => order.status === 'pending')}
      emptyMessage="No pending orders"
      emptyIcon="✅"
    />
  )
}

export const ReadyOrdersList = ({ orders, ...props }: Omit<OrderListProps, 'emptyMessage' | 'emptyIcon'>) => {
  return (
    <OrderList
      {...props}
      orders={orders.filter(order => order.status === 'ready')}
      emptyMessage="No orders ready for pickup"
      emptyIcon="📋"
    />
  )
}

export const CompletedOrdersList = ({ orders, ...props }: Omit<OrderListProps, 'emptyMessage' | 'emptyIcon'>) => {
  return (
    <OrderList
      {...props}
      orders={orders.filter(order => order.status === 'completed')}
      emptyMessage="No completed orders"
      emptyIcon="🎉"
    />
  )
}