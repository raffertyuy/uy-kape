import React, { useState, useEffect, useCallback } from 'react'
import { useCreateDrink, useUpdateDrink, useDrinks } from '@/hooks/useMenuData'
import type { Drink, DrinkCategory, CreateDrinkDto, UpdateDrinkDto } from '@/types/menu.types'

interface DrinkFormProps {
  drink?: Drink | null // undefined for create, defined for edit
  categories: DrinkCategory[]
  onSubmit: () => void
  onCancel: () => void
  onDataChange?: () => void
  isLoading?: boolean
}

export const DrinkForm: React.FC<DrinkFormProps> = ({
  drink,
  categories,
  onSubmit,
  onCancel,
  onDataChange,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    display_order: 1,
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: drinks } = useDrinks()
  
  // Create a callback handler that calls onDataChange if provided
  const handleDataChange = useCallback(() => {
    onDataChange?.()
  }, [onDataChange])
  
  const createMutation = useCreateDrink(handleDataChange)
  const updateMutation = useUpdateDrink(handleDataChange)

  const isEditing = Boolean(drink)
  const isSubmitting = createMutation.state === 'loading' || updateMutation.state === 'loading'

  // Initialize form data
  useEffect(() => {
    if (drink) {
      setFormData({
        name: drink.name,
        description: drink.description || '',
        category_id: drink.category_id,
        display_order: drink.display_order,
        is_active: drink.is_active
      })
    } else {
      // Set default display order for new drinks
      const maxOrder = drinks.reduce((max, d) => Math.max(max, d.display_order), 0)
      setFormData(prev => ({
        ...prev,
        display_order: maxOrder + 1,
        category_id: categories.length > 0 ? categories[0].id : ''
      }))
    }
  }, [drink, drinks, categories])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Drink name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Drink name must be at least 2 characters'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Drink name must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }

    if (formData.display_order < 1) {
      newErrors.display_order = 'Display order must be at least 1'
    }

    // Check for duplicate name within the same category (excluding current drink if editing)
    const duplicateName = drinks.find(d => 
      d.name.toLowerCase() === formData.name.toLowerCase().trim() &&
      d.category_id === formData.category_id &&
      (!drink || d.id !== drink.id)
    )
    if (duplicateName) {
      newErrors.name = 'A drink with this name already exists in this category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (isEditing && drink) {
        const updateData: UpdateDrinkDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category_id: formData.category_id,
          display_order: formData.display_order,
          is_active: formData.is_active
        }
        await updateMutation.updateDrink(drink.id, updateData)
      } else {
        const createData: CreateDrinkDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category_id: formData.category_id,
          display_order: formData.display_order,
          is_active: formData.is_active
        }
        await createMutation.createDrink(createData)
      }
      onSubmit()
    } catch (error) {
      // Error is handled by the mutation hooks
      console.error('Form submission error:', error)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  // Filter active categories for the dropdown
  const activeCategories = categories.filter(cat => cat.is_active)

  if (activeCategories.length === 0) {
    return (
      <div className="text-center py-8">
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
        <h3 className="text-lg font-semibold text-coffee-800 mb-2">No Active Categories</h3>
        <p className="text-coffee-600 mb-4">
          You need to create at least one active drink category before adding drinks.
        </p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 
                   focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2
                   transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-coffee-700 mb-1">
          Drink Name *
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
          placeholder="e.g., Cappuccino, Earl Grey Tea, Matcha Latte"
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
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 
                     focus:ring-coffee-500 focus:border-coffee-500 ${
            errors.description 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-coffee-300'
          }`}
          placeholder="Brief description of the drink, ingredients, or preparation method (optional)"
          disabled={isSubmitting || isLoading}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-coffee-500">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Category Field */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-coffee-700 mb-1">
          Category *
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 
                     focus:ring-coffee-500 focus:border-coffee-500 ${
            errors.category_id 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-coffee-300'
          }`}
          disabled={isSubmitting || isLoading}
          required
          aria-describedby={errors.category_id ? 'category-error' : undefined}
        >
          <option value="">Select a category</option>
          {activeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p id="category-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.category_id}
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
          Controls the order this drink appears in the menu
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
            isEditing ? 'Update Drink' : 'Create Drink'
          )}
        </button>
      </div>
    </form>
  )
}