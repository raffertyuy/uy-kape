import { useState, useCallback, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { OrderFilters } from '@/types/admin.types'
import type { OrderStatus } from '@/types/order.types'

interface UseOrderFiltersState {
  filters: OrderFilters
  searchTerm: string
  debouncedSearchTerm: string
  activeFiltersCount: number
}

interface UseOrderFiltersReturn extends UseOrderFiltersState {
  updateFilter: <K extends keyof OrderFilters>(_key: K, _value: OrderFilters[K]) => void
  updateSearchTerm: (_term: string) => void
  clearFilters: () => void
  clearSearch: () => void
  resetAllFilters: () => void
  isFilterActive: (_key: keyof OrderFilters) => boolean
  getFilteredFilters: () => OrderFilters
}

const DEFAULT_FILTERS: OrderFilters = {
  status: 'all'
}

/**
 * Custom hook for managing order filters and search functionality with debounced input
 * Provides comprehensive filtering capabilities with automatic debouncing for search terms
 */
export const useOrderFilters = (
  initialFilters: Partial<OrderFilters> = {},
  debounceDelay: number = 300
): UseOrderFiltersReturn => {
  const [filters, setFilters] = useState<OrderFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay)

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof OrderFilters>(
    _key: K,
    _value: OrderFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [_key]: _value
    }))
  }, [])

  // Update search term
  const updateSearchTerm = useCallback((_term: string) => {
    setSearchTerm(_term)
  }, [])

  // Clear specific filter
  const clearFilters = useCallback(() => {
    setFilters(prev => {
      const newFilters: OrderFilters = { status: prev.status || 'all' }
      return newFilters
    })
  }, [])

  // Clear search term
  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  // Reset all filters to default
  const resetAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSearchTerm('')
  }, [])

  // Check if a specific filter is active
  const isFilterActive = useCallback((_key: keyof OrderFilters): boolean => {
    const value = filters[_key]
    const defaultValue = DEFAULT_FILTERS[_key]
    
    if (_key === 'status') {
      return value !== 'all'
    }
    
    return value !== undefined && value !== defaultValue
  }, [filters])

  // Get filters with search term applied
  const getFilteredFilters = useCallback((): OrderFilters => {
    const result = { ...filters }
    
    // Apply debounced search term to guest_name if search is active
    if (debouncedSearchTerm.trim()) {
      result.guest_name = debouncedSearchTerm.trim()
    }
    
    // Remove undefined values and 'all' status
    const cleanedFilters: OrderFilters = {}
    
    Object.entries(result).forEach(([_key, _value]) => {
      if (_value !== undefined && _value !== '' && _value !== 'all') {
        (cleanedFilters as any)[_key] = _value
      }
    })
    
    return cleanedFilters
  }, [filters, debouncedSearchTerm])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    
    // Count non-default filters
    Object.keys(filters).forEach(_key => {
      if (isFilterActive(_key as keyof OrderFilters)) {
        count++
      }
    })
    
    // Add search term if active
    if (debouncedSearchTerm.trim()) {
      count++
    }
    
    return count
  }, [filters, debouncedSearchTerm, isFilterActive])

  return {
    filters,
    searchTerm,
    debouncedSearchTerm,
    activeFiltersCount,
    updateFilter,
    updateSearchTerm,
    clearFilters,
    clearSearch,
    resetAllFilters,
    isFilterActive,
    getFilteredFilters
  }
}

// Status filter options for UI components
export const STATUS_FILTER_OPTIONS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

// Date range presets for quick filtering
export const DATE_RANGE_PRESETS = {
  today: () => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    return {
      date_from: start.toISOString(),
      date_to: end.toISOString()
    }
  },
  yesterday: () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
    return {
      date_from: start.toISOString(),
      date_to: end.toISOString()
    }
  },
  thisWeek: () => {
    const today = new Date()
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()))
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    return {
      date_from: new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate()).toISOString(),
      date_to: new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59).toISOString()
    }
  },
  lastWeek: () => {
    const today = new Date()
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay() - 7))
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() - 1))
    return {
      date_from: new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate()).toISOString(),
      date_to: new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59).toISOString()
    }
  },
  thisMonth: () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
    return {
      date_from: firstDay.toISOString(),
      date_to: lastDay.toISOString()
    }
  }
}