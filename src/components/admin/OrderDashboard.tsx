import { useState, useCallback } from 'react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { adminOrderService } from '@/services/adminOrderService';
import { OrderCard } from './OrderCard';
import { BulkOrderActions } from './BulkOrderActions';
import type { AdminOrderListItem, BulkOperationResult } from '@/types/admin.types';
import type { OrderStatus } from '@/types/order.types';

interface OrderDashboardProps {
  className?: string | undefined;
}

/**
 * Main order dashboard component with comprehensive order management
 * Provides real-time order monitoring, filtering, and status management
 */
export const OrderDashboard = ({ className }: OrderDashboardProps) => {
  // Core order data
  const { orders, loading, error, refetch } = useRealtimeOrders();
  
  // UI state
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handle order selection
  const handleOrderSelect = useCallback((orderId: string, selected: boolean) => {
    setSelectedOrders(prev => 
      selected 
        ? [...prev, orderId]
        : prev.filter(id => id !== orderId)
    );
  }, []);

  // Handle order status updates
  const handleStatusUpdate = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      // Update order status in database
      await adminOrderService.updateOrderStatus(orderId, status);
      
      // Refetch orders after status update
      await refetch();
      
      // Remove from selection if completed
      if (status === 'completed') {
        setSelectedOrders(prev => prev.filter(id => id !== orderId));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  }, [refetch]);

  // Handle clearing selection
  const handleClearSelection = useCallback(() => {
    setSelectedOrders([]);
  }, []);

  // Handle bulk status updates
  const handleBulkStatusUpdate = useCallback(async (orderIds: string[], status: OrderStatus): Promise<BulkOperationResult> => {
    try {
      const result = await adminOrderService.performBulkOperation({
        order_ids: orderIds,
        operation: status === 'completed' ? 'mark_completed' : 'cancel'
      });
      
      // Refetch orders after bulk operation
      await refetch();
      
      return result;
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
      throw error;
    }
  }, [refetch]);

  // Handle clearing all pending orders
  const handleClearAllPending = useCallback(async () => {
    setShowClearConfirm(true);
  }, []);

  const handleConfirmClearAll = useCallback(async () => {
    try {
      await adminOrderService.clearAllPendingOrders();
      
      // Clear selection and refetch orders
      setSelectedOrders([]);
      await refetch();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear pending orders:', error);
      setShowClearConfirm(false);
    }
  }, [refetch]);

  const handleCancelClearAll = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  // Filter orders based on current filters
  const getFilteredOrders = () => {
    return orders.filter((order: AdminOrderListItem) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          order.guest_name?.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Show completed filter
      if (!showCompleted && order.status === 'completed') {
        return false;
      }

      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Get selected order objects for bulk actions
  const selectedOrderObjects = filteredOrders.filter(order => selectedOrders.includes(order.id));

  // Calculate statistics
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    total: orders.length
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} data-testid="order-dashboard">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0" data-testid="dashboard-controls">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
              {selectedOrders.length > 0 && (
                <span className="ml-2 text-coffee-600">
                  • {selectedOrders.length} selected
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2" data-testid="connection-status">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Connected</span>
            </div>

            {/* Show Completed Toggle */}
            <div className="flex items-center space-x-2">
              <label 
                htmlFor="show-completed-toggle" 
                className="text-sm font-medium text-gray-700"
              >
                Show Completed
              </label>
              <button
                id="show-completed-toggle"
                onClick={() => setShowCompleted(!showCompleted)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 ${
                  showCompleted ? 'bg-coffee-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={showCompleted}
                aria-label="Toggle show completed orders"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showCompleted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Clear All Pending Orders Button */}
            {stats.pending > 0 && (
              <button
                onClick={handleClearAllPending}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Pending
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={refetch}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="order-statistics">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🎉</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.completed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4" data-testid="order-filters">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders by guest name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <BulkOrderActions
            selectedOrders={selectedOrderObjects}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onClearSelection={handleClearSelection}
            className="mb-6"
          />
        )}

        {/* Order List */}
        <div className="bg-white shadow rounded-lg" data-testid="order-list">
          <div className="px-4 py-5 sm:p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-orders">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Orders will appear here when they are placed'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrders.includes(order.id)}
                    onSelect={handleOrderSelect}
                    onStatusUpdate={handleStatusUpdate}
                    showActions
                    className="mb-4"
                    data-testid={`order-card-${order.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">
                {error}
              </p>
              <button
                onClick={refetch}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Clear All Pending Orders Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Clear All Pending Orders</h3>
                  <p className="text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to cancel all {stats.pending} pending order{stats.pending !== 1 ? 's' : ''}? 
                This will set all pending orders to "cancelled" status and cannot be reversed.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelClearAll}
                  className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md 
                           hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 
                           focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearAll}
                  className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md 
                           hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
                           focus:ring-offset-2 transition-colors duration-200"
                >
                  Clear All Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
