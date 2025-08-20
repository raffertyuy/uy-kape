import React, { useState, useEffect } from 'react'

export interface MenuFilters {
  isActive?: boolean
  categoryId?: string
  sortBy?: 'name' | 'created_at' | 'display_order'
  sortOrder?: 'asc' | 'desc'
}

interface MenuSearchProps {
  onSearch: (_query: string) => void
  onFilter: (_filters: MenuFilters) => void
  searchQuery: string
  activeFilters: MenuFilters
  showCategoryFilter?: boolean
  categories?: Array<{ id: string; name: string }>
  placeholder?: string
}

export const MenuSearch: React.FC<MenuSearchProps> = ({
  onSearch,
  onFilter,
  searchQuery,
  activeFilters,
  showCategoryFilter = false,
  categories = [],
  placeholder = "Search..."
}) => {
  const [query, setQuery] = useState(searchQuery)
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch])

  const handleFilterChange = (filterKey: keyof MenuFilters, value: string | boolean | undefined) => {
    const newFilters = { ...activeFilters, [filterKey]: value }
    onFilter(newFilters)
  }

  const clearFilters = () => {
    onFilter({})
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-coffee-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-coffee-300 rounded-md leading-5 bg-white placeholder-coffee-500 focus:outline-none focus:placeholder-coffee-400 focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500"
            placeholder={placeholder}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-coffee-400 hover:text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border border-coffee-300 rounded-md text-sm font-medium transition-colors duration-200 ${
            showFilters || hasActiveFilters
              ? 'bg-coffee-50 text-coffee-700 border-coffee-400'
              : 'bg-white text-coffee-600 hover:bg-coffee-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-coffee-200 text-coffee-800">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </div>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-coffee-600 hover:text-coffee-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-coffee-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={activeFilters.isActive === undefined ? '' : activeFilters.isActive ? 'active' : 'inactive'}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'active')}
                className="w-full px-3 py-2 border border-coffee-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Category Filter */}
            {showCategoryFilter && categories.length > 0 && (
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-coffee-700 mb-1">
                  Category
                </label>
                <select
                  id="category-filter"
                  value={activeFilters.categoryId || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-coffee-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By Filter */}
            <div>
              <label htmlFor="sort-by-filter" className="block text-sm font-medium text-coffee-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-by-filter"
                value={activeFilters.sortBy || 'display_order'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-coffee-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
              >
                <option value="display_order">Display Order</option>
                <option value="name">Name</option>
                <option value="created_at">Date Created</option>
              </select>
            </div>

            {/* Sort Order Filter */}
            <div>
              <label htmlFor="sort-order-filter" className="block text-sm font-medium text-coffee-700 mb-1">
                Order
              </label>
              <select
                id="sort-order-filter"
                value={activeFilters.sortOrder || 'asc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-coffee-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}