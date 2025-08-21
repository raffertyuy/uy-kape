import { cn } from '@/lib/utils'

interface OrderDashboardHeaderProps {
  selectedCount: number
  totalOrders: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (_mode: 'grid' | 'list') => void
  showCompleted: boolean
  onShowCompletedChange: (_show: boolean) => void
  onRefresh: () => void
  className?: string | undefined
}

/**
 * Dashboard header with bulk actions and settings
 * Provides view controls, filters, and refresh functionality
 */
export const OrderDashboardHeader = ({
  selectedCount,
  totalOrders,
  viewMode,
  onViewModeChange,
  showCompleted,
  onShowCompletedChange,
  onRefresh,
  className
}: OrderDashboardHeaderProps) => {
  return (
    <div className={cn('bg-white border-b border-gray-200 px-4 py-4 dark:bg-gray-800 dark:border-gray-700', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Title and Order Count */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Order Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalOrders} order{totalOrders !== 1 ? 's' : ''}
              {selectedCount > 0 && (
                <span className="ml-2 text-coffee-600 dark:text-coffee-400">
                  • {selectedCount} selected
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Show Completed Toggle */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="show-completed"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Show Completed
            </label>
            <button
              id="show-completed"
              onClick={() => onShowCompletedChange(!showCompleted)}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2',
                showCompleted
                  ? 'bg-coffee-600'
                  : 'bg-gray-200 dark:bg-gray-600'
              )}
              role="switch"
              aria-checked={showCompleted}
              aria-labelledby="show-completed"
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  showCompleted ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 dark:bg-gray-700">
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-coffee-600 shadow-sm dark:bg-gray-600 dark:text-coffee-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              aria-label="List view"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-coffee-600 shadow-sm dark:bg-gray-600 dark:text-coffee-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              aria-label="Grid view"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            aria-label="Refresh orders"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          {/* Settings/Options Menu */}
          <div className="relative">
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              aria-label="Dashboard options"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar - Only shown when orders are selected */}
      {selectedCount > 0 && (
        <div className="mt-4 p-3 bg-coffee-50 border border-coffee-200 rounded-lg dark:bg-coffee-900/20 dark:border-coffee-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-coffee-700 dark:text-coffee-300">
                {selectedCount} order{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="text-sm text-coffee-600 dark:text-coffee-400">
              Bulk actions available below
            </div>
          </div>
        </div>
      )}
    </div>
  )
}