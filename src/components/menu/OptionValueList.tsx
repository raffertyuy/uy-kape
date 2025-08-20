import React, { useState } from 'react'
import { useOptionValues, useCreateOptionValue, useUpdateOptionValue, useDeleteOptionValue } from '@/hooks/useMenuData'
import { OptionValueForm } from './OptionValueForm'
import type { OptionCategory, OptionValue, CreateOptionValueDto, UpdateOptionValueDto } from '@/types/menu.types'

interface OptionValueListProps {
  category: OptionCategory
  onBack: () => void
}

export const OptionValueList: React.FC<OptionValueListProps> = ({
  category,
  onBack
}) => {
  const { data: values, isLoading, error, refetch } = useOptionValues(category.id)
  const { createValue } = useCreateOptionValue()
  const { updateValue } = useUpdateOptionValue()
  const { deleteValue } = useDeleteOptionValue()
  
  const [showForm, setShowForm] = useState(false)
  const [editingValue, setEditingValue] = useState<OptionValue | null>(null)
  const [deletingValue, setDeletingValue] = useState<OptionValue | null>(null)

  const handleAdd = () => {
    setEditingValue(null)
    setShowForm(true)
  }

  const handleEdit = (value: OptionValue) => {
    setEditingValue(value)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingValue(null)
  }

  const handleSubmitForm = async (data: CreateOptionValueDto | UpdateOptionValueDto) => {
    try {
      if (editingValue) {
        await updateValue(editingValue.id, data as UpdateOptionValueDto)
      } else {
        await createValue({
          ...data as CreateOptionValueDto,
          option_category_id: category.id
        })
      }
      handleCloseForm()
      refetch()
    } catch (error) {
      console.error('Error submitting option value:', error)
    }
  }

  const handleDeleteClick = (value: OptionValue) => {
    setDeletingValue(value)
  }

  const handleConfirmDelete = async () => {
    if (!deletingValue) return
    
    try {
      await deleteValue(deletingValue.id)
      setDeletingValue(null)
      refetch()
    } catch (error) {
      console.error('Error deleting option value:', error)
    }
  }

  const handleCancelDelete = () => {
    setDeletingValue(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-coffee-800">
            Values for "{category.name}"
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600" />
          <span className="ml-2 text-coffee-600">Loading option values...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-coffee-800">
            Values for "{category.name}"
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Option Values</h3>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-colors duration-200"
              aria-label="Go back to option categories"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-semibold text-coffee-800">
                Values for "{category.name}"
              </h2>
              <p className="text-coffee-600 text-sm mt-1">
                Manage the specific options customers can choose from this category.
              </p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Add Option Value
          </button>
        </div>

        {/* Values List */}
        {values.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Option Values</h3>
            <p className="text-gray-600 mb-4">
              Add some values for customers to choose from this "{category.name}" category.
            </p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2"
            >
              Add Option Value
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.id}
                className="bg-white border border-coffee-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-coffee-800 text-lg mb-1">
                      {value.name}
                    </h3>
                    {value.description && (
                      <p className="text-coffee-600 text-sm mb-2 line-clamp-2">
                        {value.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-coffee-500">
                      <span>Order: {value.display_order}</span>
                      <span className={value.is_active ? 'text-green-600' : 'text-gray-500'}>
                        {value.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(value)}
                      className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-colors duration-200"
                      aria-label={`Edit ${value.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(value)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                      aria-label={`Delete ${value.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <OptionValueForm
              category={category}
              {...(editingValue && { initialData: editingValue })}
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingValue && (
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Option Value</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the option value "{deletingValue.name}"? 
              This will remove it from all drink configurations.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md 
                         hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 
                         focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md 
                         hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
                         focus:ring-offset-2 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}