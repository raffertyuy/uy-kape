import React, { useState, useMemo } from 'react'
import type { DrinkCategory, MenuFilters } from '@/types/menu.types'
import { DrinkCategoryCard } from './DrinkCategoryCard'
import { DrinkCategoryForm } from './DrinkCategoryForm'

interface DrinkCategoryListProps {
  categories: DrinkCategory[]
  onEdit: (_category: DrinkCategory) => void
  onDelete: (_id: string) => void
  onReorder: (_reorderedCategories: DrinkCategory[]) => void
  onDataChange?: () => void
  isLoading?: boolean
  searchQuery?: string
  filters?: MenuFilters
}

export const DrinkCategoryList: React.FC<DrinkCategoryListProps> = ({
  categories,
  onEdit: _onEdit,
  onDelete,
  onReorder: _onReorder,
  onDataChange,
  isLoading = false,
  searchQuery = '',
  filters = {}
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<DrinkCategory | null>(null)

  // Filter categories based on search query and filters
  const filteredCategories = useMemo(() => {
    let filtered = categories

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by active status
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(category => category.is_active === filters.isActive)
    }

    // Sort categories
    const sortBy = filters.sortBy || 'display_order'
    const sortOrder = filters.sortOrder || 'asc'

    filtered.sort((a, b) => {
      let compareValue = 0
      
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'created_at':
          compareValue = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
          break
        case 'display_order':
        default:
          compareValue = (a.display_order || 0) - (b.display_order || 0)
          break
      }

      return sortOrder === 'desc' ? -compareValue : compareValue
    })

    return filtered
  }, [categories, searchQuery, filters])

  const handleAdd = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEdit = (category: DrinkCategory) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleFormSubmit = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-coffee-800">Drink Categories</h2>
          <button
            disabled
            className="px-4 py-2 bg-coffee-200 text-coffee-600 rounded-lg cursor-not-allowed"
          >
            Add Category
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-32 bg-coffee-50 animate-pulse rounded-lg border border-coffee-200"
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
          <h2 className="text-2xl font-bold text-coffee-800">Drink Categories</h2>
          <p className="text-coffee-600">Manage your menu categories and their display order</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 
                   focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2
                   transition-colors duration-200"
          aria-label="Add new drink category"
        >
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-coffee-800 mb-2">
            {categories.length === 0 ? 'No categories yet' : 'No categories match your search'}
          </h3>
          <p className="text-coffee-600 mb-4">
            {categories.length === 0 
              ? 'Create your first drink category to get started' 
              : 'Try adjusting your search criteria or filters'
            }
          </p>
          {categories.length === 0 && (
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 
                       focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2
                       transition-colors duration-200"
            >
              Create First Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <DrinkCategoryCard
              key={category.id}
              category={category}
              onEdit={() => handleEdit(category)}
              onDelete={() => onDelete(category.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-coffee-800">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
            <DrinkCategoryForm
              category={editingCategory}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              {...(onDataChange && { onDataChange })}
            />
          </div>
        </div>
      )}
    </div>
  )
}