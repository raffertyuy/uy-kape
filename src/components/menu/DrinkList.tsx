import React, { useState, useMemo } from 'react'
import type { Drink, DrinkCategory, DrinkWithOptionsPreview } from '@/types/menu.types'
import type { MenuFilters } from '@/components/menu/MenuSearch'
import { DrinkCard } from './DrinkCard'
import { DrinkForm } from './DrinkForm'

interface DrinkListProps {
  drinks: Drink[] | DrinkWithOptionsPreview[]
  categories: DrinkCategory[]
  onEdit: (_drink: Drink) => void
  onDelete: (_id: string) => void
  onManageOptions: (_drinkId: string) => void
  selectedCategoryId?: string // Keeping for backward compatibility, but filters.categoryId takes precedence
  onCategoryFilter: (_categoryId: string | undefined) => void
  showOptionsPreview?: boolean
  isLoading?: boolean
  onDataChange?: () => void
  searchQuery?: string
  filters?: MenuFilters
}

export const DrinkList: React.FC<DrinkListProps> = ({
  drinks,
  categories,
  onEdit: _onEdit,
  onDelete,
  onManageOptions,
  selectedCategoryId,
  onCategoryFilter,
  showOptionsPreview = false,
  isLoading = false,
  onDataChange,
  searchQuery = '',
  filters = {}
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null)
  // Remove local searchQuery state since it's now coming from parent
  // const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Apply comprehensive filtering and sorting
  const filteredDrinks = useMemo(() => {
    let result = [...drinks]

    // Apply search query filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(drink =>
        drink.name.toLowerCase().includes(query) ||
        (drink.description && drink.description.toLowerCase().includes(query))
      )
    }

    // Apply category filter (prioritize filters.categoryId over selectedCategoryId)
    const categoryFilter = filters.categoryId || selectedCategoryId
    if (categoryFilter) {
      result = result.filter(drink => drink.category_id === categoryFilter)
    }

    // Apply status filter
    if (filters.isActive !== undefined) {
      result = result.filter(drink => drink.is_active === filters.isActive)
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'display_order'
    const sortOrder = filters.sortOrder || 'asc'

    result.sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at || 0)
          bValue = new Date(b.created_at || 0)
          break
        case 'display_order':
        default:
          aValue = a.display_order || 0
          bValue = b.display_order || 0
          break
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [drinks, searchQuery, filters, selectedCategoryId])

  const handleAdd = () => {
    setEditingDrink(null)
    setShowForm(true)
  }

  const handleEdit = (drink: Drink | DrinkWithOptionsPreview) => {
    // Extract the base Drink properties for editing
    const drinkToEdit: Drink = {
      id: drink.id,
      name: drink.name,
      description: drink.description,
      is_active: drink.is_active,
      display_order: drink.display_order,
      category_id: drink.category_id,
      created_at: drink.created_at,
      updated_at: drink.updated_at
    }
    setEditingDrink(drinkToEdit)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingDrink(null)
  }

  const handleFormSubmit = () => {
    setShowForm(false)
    setEditingDrink(null)
  }

  const handleClearFilter = () => {
    onCategoryFilter(undefined)
  }

  // Get the effective category filter (prioritize filters.categoryId over selectedCategoryId)
  const effectiveCategoryId = filters.categoryId || selectedCategoryId

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-coffee-800">Drinks</h2>
          <button
            disabled
            className="px-4 py-2 bg-coffee-200 text-coffee-600 rounded-lg cursor-not-allowed"
          >
            Add Drink
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-48 bg-coffee-50 animate-pulse rounded-lg border border-coffee-200"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-coffee-800">Drinks</h2>
          <p className="text-coffee-600">Manage your menu drinks and their options</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 
                   focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2
                   transition-colors duration-200"
          aria-label="Add new drink"
        >
          Add Drink
        </button>
      </div>

      {/* Filters and Search - Show simplified version since main filters are in MenuSearch */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter - Keep this as a quick filter that syncs with main filters */}
        <div className="flex-1">
          <label htmlFor="category-filter" className="block text-sm font-medium text-coffee-700 mb-1">
            Quick Category Filter
          </label>
          <div className="flex gap-2">
            <select
              id="category-filter"
              value={effectiveCategoryId || ''}
              onChange={(e) => onCategoryFilter(e.target.value || undefined)}
              className="flex-1 px-3 py-2 border border-coffee-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {effectiveCategoryId && (
              <button
                onClick={handleClearFilter}
                className="px-3 py-2 text-coffee-600 hover:text-coffee-800 focus:outline-none 
                         focus:ring-2 focus:ring-coffee-500 rounded-md"
                aria-label="Clear category filter"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search Display - Show current search for context */}
        {searchQuery && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-coffee-700 mb-1">
              Current Search
            </label>
            <div className="px-3 py-2 bg-coffee-50 border border-coffee-200 rounded-md text-sm text-coffee-700">
              "{searchQuery}"
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-end">
          <div className="flex border border-coffee-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md focus:outline-none 
                         focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 ${
                viewMode === 'grid'
                  ? 'bg-coffee-100 text-coffee-700 border-coffee-300'
                  : 'bg-white text-coffee-500 hover:text-coffee-700'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md focus:outline-none 
                         focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 ${
                viewMode === 'list'
                  ? 'bg-coffee-100 text-coffee-700 border-coffee-300'
                  : 'bg-white text-coffee-500 hover:text-coffee-700'
              }`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Display */}
      {effectiveCategoryId && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-coffee-600">Filtered by:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-coffee-100 text-coffee-800">
            {categories.find(cat => cat.id === effectiveCategoryId)?.name}
            <button
              onClick={handleClearFilter}
              className="ml-2 text-coffee-600 hover:text-coffee-800 focus:outline-none"
              aria-label="Remove filter"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </span>
        </div>
      )}

      {/* Drinks Display */}
      {filteredDrinks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-coffee-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-coffee-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-coffee-800 mb-2">
            {searchQuery || effectiveCategoryId ? 'No drinks found' : 'No drinks yet'}
          </h3>
          <p className="text-coffee-600 mb-4">
            {searchQuery || effectiveCategoryId 
              ? 'Try adjusting your search criteria or filters'
              : 'Create your first drink to get started'
            }
          </p>
          {!searchQuery && !effectiveCategoryId && (
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 
                       focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2
                       transition-colors duration-200"
            >
              Create First Drink
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        }>
          {filteredDrinks.map((drink) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              viewMode={viewMode}
              showOptionsPreview={showOptionsPreview}
              onEdit={() => handleEdit(drink)}
              onDelete={() => onDelete(drink.id)}
              onManageOptions={() => onManageOptions(drink.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-coffee-800">
                {editingDrink ? 'Edit Drink' : 'Add New Drink'}
              </h3>
              <button
                onClick={handleFormClose}
                className="text-coffee-400 hover:text-coffee-600 focus:outline-none focus:ring-2 
                         focus:ring-coffee-500 rounded-lg p-1"
                aria-label="Close form"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DrinkForm
              drink={editingDrink}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              {...(onDataChange ? { onDataChange } : {})}
            />
          </div>
        </div>
      )}
    </div>
  )
}