import React, { useState } from 'react'
import type { 
  OptionCategory,
  OptionValue, 
  CreateOptionValueDto, 
  UpdateOptionValueDto 
} from '@/types/menu.types'

interface OptionValueFormProps {
  category: OptionCategory
  initialData?: OptionValue
  onSubmit: (data: CreateOptionValueDto | UpdateOptionValueDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const OptionValueForm: React.FC<OptionValueFormProps> = ({
  category,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    display_order: initialData?.display_order || 0,
    is_active: initialData?.is_active ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      setErrors({})

      // Validate form data
      const validation = validateForm(formData)
      if (!validation.isValid) {
        setErrors(validation.errors)
        return
      }

      // Submit the data
      if (initialData) {
        // Update existing value
        const updateData: UpdateOptionValueDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          display_order: formData.display_order,
          is_active: formData.is_active
        }
        await onSubmit(updateData)
      } else {
        // Create new value
        const createData: CreateOptionValueDto = {
          option_category_id: category.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          display_order: formData.display_order,
          is_active: formData.is_active
        }
        await onSubmit(createData)
      }
    } catch (error) {
      console.error('Error submitting option value form:', error)
      setErrors({
        form: error instanceof Error ? error.message : 'An unexpected error occurred.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Form validation
  const validateForm = (data: typeof formData) => {
    const errors: Record<string, string> = {}

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Option value name is required.'
    } else if (data.name.trim().length < 1) {
      errors.name = 'Option value name must be at least 1 character long.'
    } else if (data.name.trim().length > 100) {
      errors.name = 'Option value name must be no more than 100 characters long.'
    }

    // Description validation
    if (data.description && data.description.length > 255) {
      errors.description = 'Description must be no more than 255 characters long.'
    }

    // Display order validation
    if (data.display_order < 0) {
      errors.display_order = 'Display order must be a non-negative number.'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const isSubmitDisabled = isLoading || isSubmitting

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-coffee-800">
          {initialData ? 'Edit Option Value' : 'Add New Option Value'}
        </h2>
        <p className="text-coffee-600 mt-1">
          {initialData 
            ? 'Update the option value details below.'
            : `Add a new option value for the "${category.name}" category.`
          }
        </p>
      </div>

      {/* Display form-level errors */}
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-coffee-700 mb-1">
            Option Value Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 ${
              errors.name ? 'border-red-500' : 'border-coffee-300'
            }`}
            placeholder="e.g., Small, Large, Oat Milk, Extra Shot"
            disabled={isSubmitDisabled}
            required
            maxLength={100}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
          <p className="mt-1 text-xs text-coffee-500">
            {formData.name.length}/100 characters
          </p>
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
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 resize-vertical ${
              errors.description ? 'border-red-500' : 'border-coffee-300'
            }`}
            placeholder="Optional description of this option value..."
            disabled={isSubmitDisabled}
            maxLength={255}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-coffee-500">
            {formData.description.length}/255 characters
          </p>
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
            onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 ${
              errors.display_order ? 'border-red-500' : 'border-coffee-300'
            }`}
            min="0"
            disabled={isSubmitDisabled}
          />
          {errors.display_order && (
            <p className="mt-1 text-sm text-red-600">{errors.display_order}</p>
          )}
          <p className="mt-1 text-xs text-coffee-500">
            Lower numbers appear first. Use 0 for default ordering.
          </p>
        </div>

        {/* Active Status Field */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-coffee-600 focus:ring-coffee-500 border-coffee-300 rounded"
              disabled={isSubmitDisabled}
            />
            <span className="ml-2 text-sm text-coffee-700">
              Active (available for selection)
            </span>
          </label>
          <p className="mt-1 text-xs text-coffee-500">
            When disabled, this option value will not be available to customers.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-coffee-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            disabled={isSubmitDisabled}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-coffee-600 text-white rounded-md hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitDisabled}
          >
            {isSubmitDisabled 
              ? (isSubmitting ? 'Saving...' : 'Processing...') 
              : (initialData ? 'Update Value' : 'Create Value')
            }
          </button>
        </div>
      </form>
    </div>
  )
}