import React, { useState, useEffect } from 'react'
import { 
  useDrinkWithOptions, 
  useOptionCategoriesWithValues, 
  useCreateDrinkOption, 
  useUpdateDrinkOption, 
  useDeleteDrinkOption 
} from '@/hooks/useMenuData'
import type { 
  OptionCategoryWithValues, 
  CreateDrinkOptionDto, 
  UpdateDrinkOptionDto 
} from '@/types/menu.types'

interface DrinkOptionsManagerProps {
  drinkId: string
  drinkName: string
  onClose: () => void
}

interface DrinkOptionState {
  optionCategory: OptionCategoryWithValues
  defaultValueId?: string | undefined
  isLinked: boolean
  drinkOptionId?: string | undefined
}

export const DrinkOptionsManager: React.FC<DrinkOptionsManagerProps> = ({
  drinkId,
  drinkName,
  onClose
}) => {
  const { data: drinkWithOptions, isLoading: loadingDrink, refetch: refetchDrink } = useDrinkWithOptions(drinkId)
  const { data: optionCategories, isLoading: loadingCategories } = useOptionCategoriesWithValues()
  const { createDrinkOption } = useCreateDrinkOption()
  const { updateDrinkOption } = useUpdateDrinkOption()
  const { deleteDrinkOption } = useDeleteDrinkOption()

  const [optionStates, setOptionStates] = useState<DrinkOptionState[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Initialize option states when data loads
  useEffect(() => {
    if (optionCategories && drinkWithOptions) {
      const currentOptions = drinkWithOptions.drink_options || []
      
      const states: DrinkOptionState[] = optionCategories.map(category => {
        const existingOption = currentOptions.find(opt => opt.option_category_id === category.id)
        
        return {
          optionCategory: category,
          defaultValueId: existingOption?.default_option_value_id || undefined,
          isLinked: !!existingOption,
          drinkOptionId: existingOption?.id
        }
      })
      
      setOptionStates(states)
    }
  }, [optionCategories, drinkWithOptions])

  const handleToggleOption = async (categoryId: string) => {
    const stateIndex = optionStates.findIndex(state => state.optionCategory.id === categoryId)
    if (stateIndex === -1) return

    const currentState = optionStates[stateIndex]
    const newState = { ...currentState, isLinked: !currentState.isLinked }

    // Update local state immediately for UI responsiveness
    const updatedStates = [...optionStates]
    updatedStates[stateIndex] = newState
    setOptionStates(updatedStates)

    try {
      if (newState.isLinked) {
        // Link the option category to the drink
        const createData: CreateDrinkOptionDto = {
          drink_id: drinkId,
          option_category_id: categoryId,
          default_option_value_id: null
        }
        const result = await createDrinkOption(createData)
        
        // Update with the new ID
        updatedStates[stateIndex] = { ...newState, drinkOptionId: result.id }
        setOptionStates(updatedStates)
      } else {
        // Unlink the option category from the drink
        if (currentState.drinkOptionId) {
          await deleteDrinkOption(currentState.drinkOptionId)
        }
        
        // Clear the drink option ID and reset values
        updatedStates[stateIndex] = {
          ...newState,
          drinkOptionId: undefined,
          defaultValueId: undefined
        }
        setOptionStates(updatedStates)
      }
      
      refetchDrink()
    } catch (error) {
      console.error('Error toggling option:', error)
      // Revert the state on error
      updatedStates[stateIndex] = currentState
      setOptionStates(updatedStates)
    }
  }

  const handleUpdateOption = async (categoryId: string, updates: Partial<DrinkOptionState>) => {
    const stateIndex = optionStates.findIndex(state => state.optionCategory.id === categoryId)
    if (stateIndex === -1) return

    const currentState = optionStates[stateIndex]
    if (!currentState.isLinked || !currentState.drinkOptionId) return

    const newState = { ...currentState, ...updates }

    // Update local state
    const updatedStates = [...optionStates]
    updatedStates[stateIndex] = newState
    setOptionStates(updatedStates)

    try {
      const updateData: UpdateDrinkOptionDto = {
        default_option_value_id: newState.defaultValueId || null
      }
      
      await updateDrinkOption(currentState.drinkOptionId, updateData)
      refetchDrink()
    } catch (error) {
      console.error('Error updating option:', error)
      // Revert the state on error
      updatedStates[stateIndex] = currentState
      setOptionStates(updatedStates)
    }
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      // All updates are already handled individually
      // This is more for UI feedback
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Close the modal after successful save
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (loadingDrink || loadingCategories) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600" />
            <span className="ml-2 text-coffee-600">Loading drink options...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-coffee-800">
              Configure Options for "{drinkName}"
            </h2>
            <p className="text-coffee-600 text-sm mt-1">
              Select which option categories apply to this drink and set default values.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {optionStates.map((state) => (
              <div 
                key={state.optionCategory.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  state.isLinked 
                    ? 'border-coffee-300 bg-coffee-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Option Category Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.isLinked}
                          onChange={() => handleToggleOption(state.optionCategory.id)}
                          className="h-4 w-4 text-coffee-600 focus:ring-coffee-500 border-coffee-300 rounded"
                        />
                        <span className="ml-2 font-semibold text-coffee-800 text-lg">
                          {state.optionCategory.name}
                        </span>
                      </label>
                      {state.optionCategory.is_required && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Category Required
                        </span>
                      )}
                    </div>
                    
                    {state.optionCategory.description && (
                      <p className="text-coffee-600 text-sm mb-3">
                        {state.optionCategory.description}
                      </p>
                    )}

                    {/* Available Values */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-coffee-700 mb-2">Available values:</p>
                      <div className="flex flex-wrap gap-2">
                        {state.optionCategory.option_values?.map((value) => (
                          <span 
                            key={value.id}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              value.is_active 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {value.name}
                            {!value.is_active && ' (inactive)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Configuration Options (when linked) */}
                  {state.isLinked && (
                    <div className="ml-6 min-w-0 w-80">
                      <div className="space-y-4">
                        {/* Default Value Selection */}
                        <div>
                          <label htmlFor={`default-value-${state.optionCategory.id}`} className="block text-sm font-medium text-coffee-700 mb-1">
                            Default Value
                          </label>
                          <select
                            id={`default-value-${state.optionCategory.id}`}
                            value={state.defaultValueId || ''}
                            onChange={(e) => handleUpdateOption(state.optionCategory.id, { 
                              defaultValueId: e.target.value || undefined 
                            })}
                            className="w-full px-3 py-2 border border-coffee-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
                          >
                            <option value="">No default</option>
                            {state.optionCategory.option_values
                              ?.filter(value => value.is_active)
                              .map((value) => (
                                <option key={value.id} value={value.id}>
                                  {value.name}
                                </option>
                              ))}
                          </select>
                          <p className="mt-1 text-xs text-coffee-500">
                            The option that will be pre-selected for customers
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-coffee-600 text-white rounded-md hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}