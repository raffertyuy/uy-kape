import React, { useState, useEffect } from 'react'
import { useCreateDrinkCategory, useUpdateDrinkCategory, useDrinkCategories } from '@/hooks/useMenuData'
import type { DrinkCategory, CreateDrinkCategoryDto, UpdateDrinkCategoryDto } from '@/types/menu.types'

interface DrinkCategoryFormProps {
  category?: DrinkCategory | null // undefined for create, defined for edit
  onSubmit: () => void
  onCancel: () => void
  onDataChange?: () => void // Callback to refresh parent data
  isLoading?: boolean
}

export const DrinkCategoryForm: React.FC<DrinkCategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  onDataChange,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 1,
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: categories, refetch: refetchCategories } = useDrinkCategories()
  
  const handleDataChange = () => {
    refetchCategories()
    onDataChange?.()
  }
  
  const createMutation = useCreateDrinkCategory(handleDataChange)
  const updateMutation = useUpdateDrinkCategory(handleDataChange)

  const isEditing = Boolean(category)
  const isSubmitting = createMutation.state === 'loading' || updateMutation.state === 'loading'

  // Initialize form data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        display_order: category.display_order,
        is_active: category.is_active
      })
    } else {
      // Set default display order for new categories
      const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.display_order), 0)
      setFormData(prev => ({
        ...prev,
        display_order: maxOrder + 1
      }))
    }
  }, [category, categories])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name must be less than 50 characters'
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    if (formData.display_order < 1) {
      newErrors.display_order = 'Display order must be at least 1'
    }

    // Check for duplicate name (excluding current category if editing)
    const duplicateName = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase().trim() &&
      (!category || cat.id !== category.id)
    )
    if (duplicateName) {
      newErrors.name = 'A category with this name already exists'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (isEditing && category) {
        const updateData: UpdateDrinkCategoryDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          display_order: formData.display_order,
          is_active: formData.is_active
        }
        await updateMutation.updateCategory(category.id, updateData)
      } else {
        const createData: CreateDrinkCategoryDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          display_order: formData.display_order,
          is_active: formData.is_active
        }
        await createMutation.createCategory(createData)
      }
      onSubmit()
    } catch (error) {
      // Error is handled by the mutation hooks
      console.error('Form submission error:', error)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setFormData(prev => ({ ...prev, display_order: value }))
    
    if (errors.display_order) {
      setErrors(prev => ({ ...prev, display_order: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Network/Service Error Display */}
      {(createMutation.state === 'error' || updateMutation.state === 'error') && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">
                {isEditing ? 'Update Failed' : 'Creation Failed'}
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {createMutation.error?.message || updateMutation.error?.message || 'An error occurred while saving the category.'}
              </p>
              {(createMutation.error?.retryable !== false && updateMutation.error?.retryable !== false) && (
                <p className="text-xs text-red-600 mt-1">
                  Please check your connection and try again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-coffee-700 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 
                     focus:ring-coffee-500 focus:border-coffee-500 ${
            errors.name 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-coffee-300'
          }`}
          placeholder="e.g., Coffee, Tea, Specialty Drinks"
          disabled={isSubmitting || isLoading}
          required
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-coffee-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 
                     focus:ring-coffee-500 focus:border-coffee-500 ${
            errors.description 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-coffee-300'
          }`}
          placeholder="Brief description of this category (optional)"
          disabled={isSubmitting || isLoading}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      {/* Display Order Field */}
      <div>
        <label htmlFor="display_order" className="block text-sm font-medium text-coffee-700 mb-1">
          Display Order
        </label>
        <input
          type="number"
          id="display_order"
          name="display_order"
          value={formData.display_order}
          onChange={handleNumberChange}
          min="1"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 
                     focus:ring-coffee-500 focus:border-coffee-500 ${
            errors.display_order 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-coffee-300'
          }`}
          disabled={isSubmitting || isLoading}
          aria-describedby={errors.display_order ? 'display-order-error' : undefined}
        />
        {errors.display_order && (
          <p id="display-order-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.display_order}
          </p>
        )}
        <p className="mt-1 text-xs text-coffee-500">
          Controls the order this category appears in menus
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleInputChange}
          className="h-4 w-4 text-coffee-600 border-coffee-300 rounded focus:ring-coffee-500"
          disabled={isSubmitting || isLoading}
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-coffee-700">
          Active (visible to customers)
        </label>
      </div>

      {/* Error Display */}
      {(createMutation.error || updateMutation.error) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            {createMutation.error?.message || updateMutation.error?.message}
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md 
                   hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 
                   focus:ring-offset-2 transition-colors duration-200"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 text-sm bg-coffee-600 text-white rounded-md 
                   hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 
                   focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 
                   disabled:cursor-not-allowed"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {isEditing ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            isEditing ? 'Update Category' : 'Create Category'
          )}
        </button>
      </div>
    </form>
  )
}