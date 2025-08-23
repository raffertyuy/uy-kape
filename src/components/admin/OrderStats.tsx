import { cn } from '@/lib/utils'
import type { OrderStatistics, AdminOrderError } from '@/types/admin.types'

interface OrderStatsProps {
  stats: OrderStatistics | null
  loading?: boolean
  error?: AdminOrderError | null
  onRefresh?: () => void
  className?: string | undefined
}

/**
 * Statistics display component with refresh capabilities
 * Shows order metrics, queue information, and peak hours analysis
 */
export const OrderStats = ({
  stats,
  loading = false,
  error = null,
  onRefresh,
  className
}: OrderStatsProps) => {
  if (error) {
    return (
      <div className={cn('bg-red-50 border border-red-200 rounded-lg p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-700">
              Failed to load statistics
            </span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4 " />
                <div className="h-6 bg-gray-300 rounded w-1/2 " />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={cn('bg-gray-50 border border-gray-200 rounded-lg p-4 ', className)}>
        <div className="text-center text-gray-500 ">
          <p className="text-sm">No statistics available</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-2 text-sm text-coffee-600 hover:text-coffee-700 "
            >
              Load Statistics
            </button>
          )}
        </div>
      </div>
    )
  }

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600 ', bg: 'bg-yellow-100 ' }
      case 'completed':
        return { color: 'text-blue-600 ', bg: 'bg-blue-100 ' }
      case 'cancelled':
        return { color: 'text-red-600 ', bg: 'bg-red-100 ' }
      default:
        return { color: 'text-gray-600 ', bg: 'bg-gray-100 ' }
    }
  }

  const totalOrders = stats.total_pending + stats.total_completed + stats.total_cancelled

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4 ', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 ">
          Order Statistics
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 text-gray-400 hover:text-gray-600 "
            aria-label="Refresh statistics"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Pending Orders */}
        <div className={cn('p-3 rounded-lg', getStatusConfig('pending').bg)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 ">Pending</p>
              <p className={cn('text-2xl font-bold', getStatusConfig('pending').color)}>
                {stats.total_pending}
              </p>
            </div>
            <span className="text-2xl" role="img" aria-label="Pending">⏳</span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className={cn('p-3 rounded-lg', getStatusConfig('completed').bg)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 ">Completed</p>
              <p className={cn('text-2xl font-bold', getStatusConfig('completed').color)}>
                {stats.total_completed}
              </p>
            </div>
            <span className="text-2xl" role="img" aria-label="Completed">🎉</span>
          </div>
        </div>

        {/* Total Today */}
        <div className="p-3 rounded-lg bg-coffee-100 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 ">Today</p>
              <p className="text-2xl font-bold text-coffee-600 ">
                {stats.orders_today}
              </p>
            </div>
            <span className="text-2xl" role="img" aria-label="Today">📅</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Average Wait Time */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">Avg Wait Time</p>
          <p className="text-xl font-bold text-gray-900 ">
            {formatWaitTime(stats.average_wait_time)}
          </p>
        </div>

        {/* Total Orders */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
          <p className="text-xl font-bold text-gray-900 ">
            {totalOrders}
          </p>
        </div>

        {/* Cancelled Orders */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">Cancelled</p>
          <p className={cn('text-xl font-bold', getStatusConfig('cancelled').color)}>
            {stats.total_cancelled}
          </p>
        </div>
      </div>

      {/* Peak Hours Chart */}
      {stats.peak_hours && stats.peak_hours.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Peak Hours Today
          </h4>
          <div className="space-y-2">
            {stats.peak_hours
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((peak) => {
                const maxCount = Math.max(...stats.peak_hours.map(p => p.count))
                const percentage = maxCount > 0 ? (peak.count / maxCount) * 100 : 0
                const hour12 = peak.hour === 0 ? 12 : peak.hour > 12 ? peak.hour - 12 : peak.hour
                const ampm = peak.hour >= 12 ? 'PM' : 'AM'
                
                return (
                  <div key={peak.hour} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-gray-600 ">
                      {hour12}:00 {ampm}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 ">
                      <div
                        className="bg-coffee-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-sm font-medium text-gray-900 ">
                      {peak.count}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
