import React, { useState, useMemo } from 'react'
import { useOptionCategories, useCreateOptionCategory, useUpdateOptionCategory, useDeleteOptionCategory } from '@/hooks/useMenuData'
import { OptionCategoryCard } from './OptionCategoryCard'
import { OptionCategoryForm } from './OptionCategoryForm'
import type { OptionCategory, CreateOptionCategoryDto, UpdateOptionCategoryDto, MenuFilters } from '@/types/menu.types'

interface OptionCategoryListProps {
  onManageValues: (_category: OptionCategory) => void
  onDataChange?: () => void
  searchQuery?: string
  filters?: MenuFilters
}

export const OptionCategoryList: React.FC<OptionCategoryListProps> = ({
  onManageValues,
  onDataChange,
  searchQuery = '',
  filters = {}
}) => {
  const { data: categories, isLoading, error, refetch } = useOptionCategories()
  
  // Create a data change handler that refreshes local data and calls parent callback
  const handleDataChange = React.useCallback(async () => {
    try {
      await refetch()
      onDataChange?.()
    } catch (error) {
      console.error('Error refreshing option category data:', error)
    }
  }, [refetch, onDataChange])
  
  const { createCategory } = useCreateOptionCategory(handleDataChange)
  const { updateCategory } = useUpdateOptionCategory(handleDataChange)
  const { deleteCategory } = useDeleteOptionCategory(handleDataChange)
  
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<OptionCategory | null>(null)

  const handleAdd = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEdit = (category: OptionCategory) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleSubmitForm = async (data: CreateOptionCategoryDto | UpdateOptionCategoryDto) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data as UpdateOptionCategoryDto)
      } else {
        await createCategory(data as CreateOptionCategoryDto)
      }
      handleCloseForm()
      // The data refresh is handled by the mutation hook callbacks
    } catch (error) {
      // Error is handled by the hooks
      console.error('Error submitting option category:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id)
      // The data refresh is handled by the mutation hook callback
    } catch (error) {
      // Error is handled by the hooks
      console.error('Error deleting option category:', error)
    }
  }

  const handleManageValues = (category: OptionCategory) => {
    onManageValues(category)
  }

  // Filter option categories based on search query and filters
  const filteredCategories = useMemo(() => {
    if (!categories) return []
    
    let filtered = categories

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          (category.description && category.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter (using is_required for option categories)
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((category) => {
        if (filters.status === "required") return category.is_required;
        if (filters.status === "optional") return !category.is_required;
        return true;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number | null | undefined;
        let bValue: string | number | null | undefined;
        
        if (filters.sortBy === 'name') {
          aValue = a.name;
          bValue = b.name;
        } else if (filters.sortBy === 'display_order') {
          aValue = a.display_order;
          bValue = b.display_order;
        } else if (filters.sortBy === 'created_at') {
          aValue = a.created_at;
          bValue = b.created_at;
        } else if (filters.sortBy === 'updated_at') {
          aValue = a.updated_at;
          bValue = b.updated_at;
        } else {
          return 0;
        }

        // Handle string comparisons
        if (typeof aValue === "string" && typeof bValue === "string") {
          const aStr = aValue.toLowerCase();
          const bStr = bValue.toLowerCase();
          if (aStr < bStr) return filters.sortOrder === "asc" ? -1 : 1;
          if (aStr > bStr) return filters.sortOrder === "asc" ? 1 : -1;
          return 0;
        }

        // Handle numeric comparisons
        if (typeof aValue === "number" && typeof bValue === "number") {
          if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
          return 0;
        }

        // Handle date comparisons
        if ((filters.sortBy === "created_at" || filters.sortBy === "updated_at") && aValue && bValue) {
          const aTime = new Date(aValue as string).getTime();
          const bTime = new Date(bValue as string).getTime();
          if (aTime < bTime) return filters.sortOrder === "asc" ? -1 : 1;
          if (aTime > bTime) return filters.sortOrder === "asc" ? 1 : -1;
          return 0;
        }

        return 0;
      });
    }

    return filtered
  }, [categories, searchQuery, filters])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-coffee-800">Option Categories</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600" />
          <span className="ml-2 text-coffee-600">Loading option categories...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-coffee-800">Option Categories</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Option Categories</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-coffee-800">Option Categories</h2>
            <p className="text-coffee-600 text-sm mt-1">
              Manage customization categories like size, milk type, number of shots, etc.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Add Option Category
          </button>
        </div>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Option Categories</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery.trim() || (filters.status && filters.status !== 'all') 
                ? 'No option categories match your current search and filter criteria.'
                : 'Get started by creating your first option category for drink customizations.'
              }
            </p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2"
            >
              Add Option Category
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <OptionCategoryCard
                key={category.id}
                category={category}
                onEdit={() => handleEdit(category)}
                onDelete={() => handleDelete(category.id)}
                onManageValues={() => handleManageValues(category)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <OptionCategoryForm
              {...(editingCategory && { initialData: editingCategory })}
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </>
  )
}