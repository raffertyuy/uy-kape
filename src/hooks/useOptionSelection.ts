import { useState, useEffect, useCallback } from 'react'
import type { DrinkWithOptionsAndCategory, OptionCategoryWithValues } from '@/types/menu.types'
import { 
  getOptionCategoriesWithValues, 
  getDefaultOptionsForDrink,
  validateSelectedOptions,
  type OptionServiceError 
} from '@/services/optionService'

interface UseOptionSelectionReturn {
  // Options data
  optionCategories: OptionCategoryWithValues[]
  selectedOptions: Record<string, string>
  
  // Loading states
  isLoading: boolean
  isValidating: boolean
  
  // Error handling
  error: OptionServiceError | null
  validationErrors: string[]
  
  // Actions
  selectOption: (_categoryId: string, _valueId: string) => void
  clearSelection: (_categoryId: string) => void
  resetToDefaults: () => void
  validateSelection: () => Promise<boolean>
  
  // Computed states
  isValid: boolean
  hasRequiredSelections: boolean
  selectedCount: number
}

export function useOptionSelection(
  drink: DrinkWithOptionsAndCategory | null
): UseOptionSelectionReturn {
  // State
  const [optionCategories, setOptionCategories] = useState<OptionCategoryWithValues[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [defaultOptions, setDefaultOptions] = useState<Record<string, string>>({})
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  
  // Error handling
  const [error, setError] = useState<OptionServiceError | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Load option categories and default values when drink changes
  useEffect(() => {
    if (!drink) {
      setOptionCategories([])
      setSelectedOptions({})
      setDefaultOptions({})
      setError(null)
      return
    }

    const loadOptions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Extract unique category IDs from drink options
        const categoryIds = Array.from(
          new Set(drink.drink_options.map(option => option.option_category_id))
        )

        // Load option categories with their values
        const { data: categories, error: categoriesError } = await getOptionCategoriesWithValues(categoryIds)
        
        if (categoriesError) {
          setError(categoriesError)
          return
        }

        setOptionCategories(categories || [])

        // Load default options for this drink
        const { data: defaults, error: defaultsError } = await getDefaultOptionsForDrink(drink.id)
        
        if (defaultsError) {
          setError(defaultsError)
          return
        }

        const defaultValues = defaults || {}
        setDefaultOptions(defaultValues)
        setSelectedOptions(defaultValues) // Initialize with defaults

      } catch (err) {
        setError({
          type: 'unknown',
          message: err instanceof Error ? err.message : 'Failed to load options'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadOptions()
  }, [drink])

  // Actions
  const selectOption = useCallback((categoryId: string, valueId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [categoryId]: valueId
    }))
    
    // Clear validation errors when user makes a selection
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }, [validationErrors.length])

  const clearSelection = useCallback((categoryId: string) => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev }
      delete newOptions[categoryId]
      return newOptions
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    setSelectedOptions(defaultOptions)
    setValidationErrors([])
  }, [defaultOptions])

  const validateSelection = useCallback(async (): Promise<boolean> => {
    setIsValidating(true)
    setValidationErrors([])

    try {
      // Check if all required categories have selections
      const requiredCategories = optionCategories.filter(cat => cat.is_required)
      const missingRequired: string[] = []

      for (const category of requiredCategories) {
        if (!selectedOptions[category.id]) {
          missingRequired.push(`Please select a ${category.name.toLowerCase()}`)
        }
      }

      if (missingRequired.length > 0) {
        setValidationErrors(missingRequired)
        return false
      }

      // Validate that selected options exist and are active
      const { isValid, errors } = await validateSelectedOptions(selectedOptions)
      
      if (!isValid) {
        setValidationErrors(errors)
        return false
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed'
      setValidationErrors([errorMessage])
      return false
    } finally {
      setIsValidating(false)
    }
  }, [optionCategories, selectedOptions])

  // Computed states
  const isValid = validationErrors.length === 0
  
  const hasRequiredSelections = optionCategories
    .filter(cat => cat.is_required)
    .every(cat => selectedOptions[cat.id])
  
  const selectedCount = Object.keys(selectedOptions).length

  return {
    // Options data
    optionCategories,
    selectedOptions,
    
    // Loading states
    isLoading,
    isValidating,
    
    // Error handling
    error,
    validationErrors,
    
    // Actions
    selectOption,
    clearSelection,
    resetToDefaults,
    validateSelection,
    
    // Computed states
    isValid,
    hasRequiredSelections,
    selectedCount
  }
}

export default useOptionSelection