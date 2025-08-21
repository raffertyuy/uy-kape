import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { useOrderFilters } from '@/hooks/useOrderFilters'
import { useOrderStats } from '@/hooks/useOrderStats'
import { useOrderOperations } from '@/hooks/useOrderOperations'
import { adminOrderService } from '@/services/adminOrderService'
import { OrderList } from './OrderList'
import { OrderFilters } from './OrderFilters'
import { OrderStats } from './OrderStats'
import { OrderDashboardHeader } from './OrderDashboardHeader'
import { BulkOrderActions } from './BulkOrderActions'
import OrderDashboardError, { OrderDashboardErrorBoundary } from './OrderDashboardError'
import OrderListSkeleton, { OrderDashboardSkeleton } from './OrderListSkeleton'
import type { AdminOrderListItem, OrderFilters as FilterType, BulkOperationResult } from '@/types/admin.types'
import type { OrderStatus } from '@/types/order.types'

interface OrderDashboardProps {
  className?: string | undefined
}

/**
 * Main order dashboard component with responsive layout
 * Provides comprehensive order management interface for baristas
 */
export const OrderDashboard = ({ className }: OrderDashboardProps) => {
  const [selectedOrders, setSelectedOrders] = useState<AdminOrderListItem[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showCompleted, setShowCompleted] = useState(false)

  // Initialize hooks
  const {
    orders,
    loading,
    error,
    updateOrderStatus,
    reconnect
  } = useRealtimeOrders()

  const {
    filters,
    searchTerm,
    updateFilter,
    updateSearchTerm,
    clearFilters,
    activeFiltersCount
  } = useOrderFilters()

  const {
    statistics,
    loading: statsLoading,
    error: statsError,
    refetch: refreshStats
  } = useOrderStats()

  // Error handling and retry operations
  const { executeOperation } = useOrderOperations()

  // Filter orders based on current filters
  const filteredOrders = orders.filter((order: AdminOrderListItem) => {
    // Search term filter
    if (searchTerm && !order.guest_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Status filter
    if (filters.status && filters.status !== 'all' && order.status !== filters.status) {
      return false
    }

    // Hide completed orders if not explicitly shown
    if (!showCompleted && order.status === 'completed') {
      return false
    }

    // Date range filter
    if (filters.date_from) {
      const orderDate = new Date(order.created_at).toDateString()
      const fromDate = new Date(filters.date_from).toDateString()
      if (orderDate < fromDate) return false
    }

    if (filters.date_to) {
      const orderDate = new Date(order.created_at).toDateString()
      const toDate = new Date(filters.date_to).toDateString()
      if (orderDate > toDate) return false
    }

    // Queue position filter
    if (filters.queue_position_min && order.queue_number < filters.queue_position_min) {
      return false
    }

    if (filters.queue_position_max && order.queue_number > filters.queue_position_max) {
      return false
    }

    return true
  })

  // Group orders by status for better organization
  const groupedOrders = {
    pending: filteredOrders.filter((order: AdminOrderListItem) => order.status === 'pending'),
    ready: filteredOrders.filter((order: AdminOrderListItem) => order.status === 'ready'),
    completed: showCompleted ? filteredOrders.filter((order: AdminOrderListItem) => order.status === 'completed') : [],
    cancelled: filteredOrders.filter((order: AdminOrderListItem) => order.status === 'cancelled')
  }

  // Handle order selection
  const handleOrderSelection = useCallback((orderId: string, selected: boolean) => {
    const order = orders.find((o: AdminOrderListItem) => o.id === orderId)
    if (!order) return

    setSelectedOrders(prev => {
      if (selected) {
        return [...prev, order]
      } else {
        return prev.filter(o => o.id !== orderId)
      }
    })
  }, [orders])

  const handleSelectAll = useCallback((orders: AdminOrderListItem[]) => {
    setSelectedOrders(prev => {
      const currentIds = new Set(prev.map(o => o.id))
      const newOrders = orders.filter(o => !currentIds.has(o.id))
      return [...prev, ...newOrders]
    })
  }, [])

  const handleDeselectAll = useCallback(() => {
    setSelectedOrders([])
  }, [])

  // Handle status updates with error handling
  const handleStatusUpdate = useCallback(async (orderId: string, status: OrderStatus) => {
    await executeOperation(
      () => updateOrderStatus(orderId, status),
      {
        maxRetries: 2,
        retryDelay: 1000,
        exponentialBackoff: true
      }
    )
    // Remove from selection if status changed
    setSelectedOrders(prev => prev.filter(o => o.id !== orderId))
  }, [updateOrderStatus, executeOperation])

  // Handle bulk operations with error handling
  const handleBulkStatusUpdate = useCallback(async (orderIds: string[], status: OrderStatus): Promise<BulkOperationResult> => {
    return executeOperation(
      async () => {
        // Create a bulk operation request
        const operation = {
          order_ids: orderIds,
          operation: status === 'ready' ? 'mark_ready' as const :
                    status === 'completed' ? 'mark_completed' as const :
                    status === 'cancelled' ? 'cancel' as const :
                    'mark_ready' as const
        }
        
        const result = await adminOrderService.performBulkOperation(operation)
        
        // Clear selection after successful bulk operation
        if (result.errors.length === 0) {
          setSelectedOrders([])
        }
        return result
      },
      {
        maxRetries: 1,
        retryDelay: 2000,
        exponentialBackoff: false
      }
    )
  }, [executeOperation])

  // Handle filter updates
  const handleFilterUpdate = useCallback((newFilters: Partial<FilterType>) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      updateFilter(key as keyof FilterType, value)
    })
  }, [updateFilter])

  // Enhanced error handling with better user experience
  if (error) {
    // Convert AdminOrderError to standard Error for compatibility
    const standardError = new Error(error.message)
    standardError.name = `AdminOrderError:${error.type}`
    
    return (
      <OrderDashboardError
        error={standardError}
        onRetry={reconnect}
        isRetrying={loading}
        errorType={error.type === 'network' ? 'network' : 
                  error.type === 'database' ? 'database' :
                  error.type === 'permission' ? 'permission' : 'unknown'}
        className="p-8"
      />
    )
  }

  // Show skeleton loader during initial load
  if (loading && orders.length === 0) {
    return <OrderDashboardSkeleton className="p-4" />
  }

  return (
    <div className={cn('flex flex-col h-full bg-gray-50 dark:bg-gray-900', className)} data-testid="order-dashboard">
      {/* Header */}
      <OrderDashboardHeader
        selectedCount={selectedOrders.length}
        totalOrders={filteredOrders.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        onRefresh={refreshStats}
        className="flex-shrink-0"
        data-testid="dashboard-controls"
      />

      {/* Statistics */}
      <div className="flex-shrink-0 px-4 py-2" data-testid="order-statistics">
        <OrderStats
          stats={statistics}
          loading={statsLoading}
          error={statsError}
          onRefresh={refreshStats}
        />
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 dark:border-gray-700" data-testid="order-filters">
        <OrderFilters
          filters={filters}
          searchTerm={searchTerm}
          onFilterUpdate={handleFilterUpdate}
          onSearchUpdate={updateSearchTerm}
          onClearFilters={clearFilters}
          activeFilterCount={activeFiltersCount}
        />
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2">
          <BulkOrderActions
            selectedOrders={selectedOrders}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onClearSelection={handleDeselectAll}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {loading && orders.length === 0 ? (
          <OrderListSkeleton 
            count={6} 
            viewMode={viewMode} 
            className="p-4" 
          />
        ) : filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full" data-testid="empty-orders">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No orders found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {activeFiltersCount > 0 
                  ? 'Try adjusting your filters to see more orders.'
                  : 'No orders have been placed yet.'
                }
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm text-coffee-600 hover:text-coffee-700 dark:text-coffee-400 dark:hover:text-coffee-300"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto p-4" data-testid="order-list">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOrders.map((order: AdminOrderListItem) => (
                  <div key={order.id} className="relative">
                    <OrderList
                      orders={[order]}
                      onOrderStatusUpdate={handleStatusUpdate}
                      onOrderSelect={handleOrderSelection}
                      selectedOrders={selectedOrders.map(o => o.id)}
                      showSelection
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Orders */}
                {groupedOrders.pending.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Pending Orders ({groupedOrders.pending.length})
                      </h3>
                      <button
                        onClick={() => handleSelectAll(groupedOrders.pending)}
                        className="text-sm text-coffee-600 hover:text-coffee-700 dark:text-coffee-400 dark:hover:text-coffee-300"
                      >
                        Select All
                      </button>
                    </div>
                    <OrderList
                      orders={groupedOrders.pending}
                      onOrderStatusUpdate={handleStatusUpdate}
                      onOrderSelect={handleOrderSelection}
                      selectedOrders={selectedOrders.map(o => o.id)}
                      showSelection
                    />
                  </div>
                )}

                {/* Ready Orders */}
                {groupedOrders.ready.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Ready for Pickup ({groupedOrders.ready.length})
                      </h3>
                      <button
                        onClick={() => handleSelectAll(groupedOrders.ready)}
                        className="text-sm text-coffee-600 hover:text-coffee-700 dark:text-coffee-400 dark:hover:text-coffee-300"
                      >
                        Select All
                      </button>
                    </div>
                    <OrderList
                      orders={groupedOrders.ready}
                      onOrderStatusUpdate={handleStatusUpdate}
                      onOrderSelect={handleOrderSelection}
                      selectedOrders={selectedOrders.map(o => o.id)}
                      showSelection
                    />
                  </div>
                )}

                {/* Completed Orders */}
                {showCompleted && groupedOrders.completed.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Completed Orders ({groupedOrders.completed.length})
                      </h3>
                      <button
                        onClick={() => handleSelectAll(groupedOrders.completed)}
                        className="text-sm text-coffee-600 hover:text-coffee-700 dark:text-coffee-400 dark:hover:text-coffee-300"
                      >
                        Select All
                      </button>
                    </div>
                    <OrderList
                      orders={groupedOrders.completed}
                      onOrderStatusUpdate={handleStatusUpdate}
                      onOrderSelect={handleOrderSelection}
                      selectedOrders={selectedOrders.map(o => o.id)}
                      showSelection
                    />
                  </div>
                )}

                {/* Cancelled Orders */}
                {groupedOrders.cancelled.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Cancelled Orders ({groupedOrders.cancelled.length})
                      </h3>
                      <button
                        onClick={() => handleSelectAll(groupedOrders.cancelled)}
                        className="text-sm text-coffee-600 hover:text-coffee-700 dark:text-coffee-400 dark:hover:text-coffee-300"
                      >
                        Select All
                      </button>
                    </div>
                    <OrderList
                      orders={groupedOrders.cancelled}
                      onOrderStatusUpdate={handleStatusUpdate}
                      onOrderSelect={handleOrderSelection}
                      selectedOrders={selectedOrders.map(o => o.id)}
                      showSelection
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * OrderDashboard component wrapped with error boundary for comprehensive error handling
 */
const OrderDashboardWithErrorBoundary = (props: OrderDashboardProps) => {
  return (
    <OrderDashboardErrorBoundary
      onError={(error, errorInfo) => {
        // Log error for monitoring in production
        console.error('OrderDashboard Error Boundary:', error, errorInfo)
      }}
    >
      <OrderDashboard {...props} />
    </OrderDashboardErrorBoundary>
  )
}

export default OrderDashboardWithErrorBoundary