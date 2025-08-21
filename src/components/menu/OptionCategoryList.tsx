import React, { useState } from 'react'
import { useOptionCategories, useCreateOptionCategory, useUpdateOptionCategory, useDeleteOptionCategory } from '@/hooks/useMenuData'
import { OptionCategoryCard } from './OptionCategoryCard'
import { OptionCategoryForm } from './OptionCategoryForm'
import type { OptionCategory, CreateOptionCategoryDto, UpdateOptionCategoryDto } from '@/types/menu.types'

interface OptionCategoryListProps {
  onManageValues: (_category: OptionCategory) => void
  onDataChange?: () => void
}

export const OptionCategoryList: React.FC<OptionCategoryListProps> = ({
  onManageValues,
  onDataChange
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
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Option Categories</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first option category for drink customizations.
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
            {categories.map((category) => (
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