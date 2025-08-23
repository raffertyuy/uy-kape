import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { OrderFilters as FilterType } from '@/types/admin.types'
import type { OrderStatus } from '@/types/order.types'

interface OrderFiltersProps {
  filters: FilterType
  searchTerm: string
  onFilterUpdate: (_filters: Partial<FilterType>) => void
  onSearchUpdate: (_term: string) => void
  onClearFilters: () => void
  activeFilterCount: number
  className?: string | undefined
}

/**
 * Filtering and search controls with real-time updates
 * Provides comprehensive filtering capabilities for the order dashboard
 */
export const OrderFilters = ({
  filters,
  searchTerm,
  onFilterUpdate,
  onSearchUpdate,
  onClearFilters,
  activeFilterCount,
  className
}: OrderFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const getPresetDateRanges = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)

    return [
      {
        label: 'Today',
        from: today.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      },
      {
        label: 'Yesterday',
        from: yesterday.toISOString().split('T')[0],
        to: yesterday.toISOString().split('T')[0]
      },
      {
        label: 'This Week',
        from: thisWeek.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      }
    ]
  }

  const presetRanges = getPresetDateRanges()

  return (
    <div className={cn('bg-white p-4 rounded-lg border border-gray-200 ', className)}>
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search Input */}
        <div className="flex-1">
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="order-search"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchUpdate(e.target.value)}
              placeholder="Search by guest name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 "
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="sm:w-48">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={filters.status || 'all'}
            onChange={(e) => onFilterUpdate({ status: e.target.value as OrderStatus | 'all' })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 "
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-1',
            showAdvanced
              ? 'bg-coffee-100 text-coffee-700 border-coffee-300 '
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 '
          )}
        >
          Advanced {showAdvanced ? '▼' : '▶'}
        </button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 "
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label htmlFor="date-range-inputs" className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div id="date-range-inputs" className="space-y-2">
                {/* Preset Ranges */}
                <div className="flex flex-wrap gap-2">
                  {presetRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => onFilterUpdate({
                        date_from: range.from,
                        date_to: range.to
                      })}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 "
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Date Inputs */}
                <div className="flex space-x-2">
                  <div>
                    <label htmlFor="date-from" className="sr-only">From date</label>
                    <input
                      id="date-from"
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => onFilterUpdate({ date_from: e.target.value })}
                      className="block w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 "
                    />
                  </div>
                  <div>
                    <label htmlFor="date-to" className="sr-only">To date</label>
                    <input
                      id="date-to"
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => onFilterUpdate({ date_to: e.target.value })}
                      className="block w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 "
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Queue Position Range */}
            <div>
              <label htmlFor="queue-position-inputs" className="block text-sm font-medium text-gray-700 mb-2">
                Queue Position
              </label>
              <div id="queue-position-inputs" className="flex space-x-2">
                <div>
                  <label htmlFor="queue-min" className="sr-only">Minimum queue position</label>
                  <input
                    id="queue-min"
                    type="number"
                    placeholder="Min"
                    value={filters.queue_position_min || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value) {
                        onFilterUpdate({ queue_position_min: parseInt(value) })
                      } else {
                        const { queue_position_min, ...rest } = filters
                        onFilterUpdate(rest)
                      }
                    }}
                    className="block w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 "
                  />
                </div>
                <div>
                  <label htmlFor="queue-max" className="sr-only">Maximum queue position</label>
                  <input
                    id="queue-max"
                    type="number"
                    placeholder="Max"
                    value={filters.queue_position_max || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value) {
                        onFilterUpdate({ queue_position_max: parseInt(value) })
                      } else {
                        const { queue_position_max, ...rest } = filters
                        onFilterUpdate(rest)
                      }
                    }}
                    className="block w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 "
                  />
                </div>
              </div>
            </div>

            {/* Guest Name Filter */}
            <div>
              <label htmlFor="guest-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Guest Name
              </label>
              <input
                id="guest-filter"
                type="text"
                placeholder="Filter by guest name..."
                value={filters.guest_name || ''}
                onChange={(e) => onFilterUpdate({ guest_name: e.target.value })}
                className="block w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 "
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 ">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 ">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
            </span>
            <div className="flex flex-wrap gap-2">
              {filters.status && filters.status !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md ">
                  Status: {filters.status}
                  <button
                    onClick={() => onFilterUpdate({ status: 'all' })}
                    className="ml-1 text-blue-600 hover:text-blue-800 "
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.date_from && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md ">
                  From: {filters.date_from}
                  <button
                    onClick={() => {
                      const { date_from, ...rest } = filters
                      onFilterUpdate(rest)
                    }}
                    className="ml-1 text-green-600 hover:text-green-800 "
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.date_to && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md ">
                  To: {filters.date_to}
                  <button
                    onClick={() => {
                      const { date_to, ...rest } = filters
                      onFilterUpdate(rest)
                    }}
                    className="ml-1 text-green-600 hover:text-green-800 "
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
