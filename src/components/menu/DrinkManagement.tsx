import React, { useState } from 'react'
import type { Drink } from '@/types/menu.types'
import type { MenuFilters } from '@/components/menu/MenuSearch'
import { DrinkList } from './DrinkList'
import { DrinkOptionsManager } from './DrinkOptionsManager'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { 
  useDrinks, 
  useDrinksWithOptionsPreview, 
  useDrinkCategories, 
  useDeleteDrink 
} from '@/hooks/useMenuData'

interface DrinkManagementProps {
  onDataChange?: () => void
  filters?: MenuFilters
  onFilter?: (_filters: MenuFilters) => void
}

export const DrinkManagement: React.FC<DrinkManagementProps> = ({ 
  onDataChange, 
  filters,
  onFilter 
}) => {
  const [showOptionsPreview, setShowOptionsPreview] = useState(false)
  
  // Use different hooks based on preview preference
  // Regular drinks data (always loaded)
  const { 
    data: regularDrinks, 
    isLoading: loadingRegularDrinks, 
    error: regularDrinksError,
    refetch: refetchRegularDrinks
  } = useDrinks()
  
  // Options preview data (lazy loaded only when showOptionsPreview is true)
  const { 
    data: drinksWithOptions, 
    isLoading: loadingDrinksWithOptions, 
    error: drinksWithOptionsError,
    refetch: refetchDrinksWithOptions
  } = useDrinksWithOptionsPreview(showOptionsPreview ? undefined : null) // Pass null to skip loading when not needed
  
  const { data: categories } = useDrinkCategories()
  const { deleteDrink } = useDeleteDrink()
  
  // Select data and loading state based on preview mode
  const drinks = showOptionsPreview ? drinksWithOptions : regularDrinks
  const isLoading = showOptionsPreview ? loadingDrinksWithOptions : loadingRegularDrinks
  const error = showOptionsPreview ? drinksWithOptionsError : regularDrinksError
  
  const [selectedDrink, setSelectedDrink] = useState<{ id: string; name: string } | null>(null)

  // Use URL-based filters or fall back to empty state
  const selectedCategoryName = filters?.categoryName

  // Create a data change handler that refreshes local data and calls parent callback
  const handleDataChange = React.useCallback(async () => {
    try {
      // Refresh local data
      await refetchRegularDrinks()
      if (showOptionsPreview) {
        await refetchDrinksWithOptions()
      }
      
      // Call parent callback if provided
      onDataChange?.()
    } catch (error) {
      console.error('Error refreshing drink data:', error)
    }
  }, [refetchRegularDrinks, refetchDrinksWithOptions, showOptionsPreview, onDataChange])

  const handleEditDrink = async (_drink: Drink) => {
    // Handle edit - this would typically open a form modal
    // console.log('Edit drink:', drink)
    // TODO: Implement edit functionality
  }

  const handleDeleteDrink = async (id: string) => {
    try {
      await deleteDrink(id)
      // Refresh data after successful deletion
      await handleDataChange()
    } catch (error) {
      console.error('Error deleting drink:', error)
    }
  }

  const handleManageOptions = (drinkId: string) => {
    const drink = drinks?.find(d => d.id === drinkId)
    if (drink) {
      setSelectedDrink({ id: drink.id, name: drink.name })
    }
  }

  const handleCloseOptionsManager = () => {
    setSelectedDrink(null)
  }

  const handleCategoryFilter = (categoryName: string | undefined) => {
    // Use URL-based filter handler if available
    if (onFilter) {
      const newFilters: MenuFilters = {
        ...filters
      }
      if (categoryName) {
        newFilters.categoryName = categoryName
      } else {
        delete newFilters.categoryName
      }
      onFilter(newFilters)
    }
  }

  return (
    <>
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading drinks
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error || 'An unexpected error occurred while loading drinks.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Options Preview Toggle */}
      <div className="mb-6 p-4 bg-coffee-50 rounded-lg border border-coffee-200">
        <ToggleSwitch
          id="options-preview-toggle"
          checked={showOptionsPreview}
          onChange={setShowOptionsPreview}
          label="Show Options Preview"
          description={
            showOptionsPreview 
              ? 'Drinks display with enabled options and default values' 
              : 'Switch to see options and default values on drink cards'
          }
          disabled={isLoading}
          className="w-full"
        />
        {isLoading && showOptionsPreview && (
          <div className="mt-2 text-xs text-coffee-600 flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-coffee-600 mr-2" />
            Loading options preview data...
          </div>
        )}
      </div>

      <DrinkList
        drinks={drinks || []}
        categories={categories || []}
        onEdit={handleEditDrink}
        onDelete={handleDeleteDrink}
        onManageOptions={handleManageOptions}
        showOptionsPreview={showOptionsPreview}
        {...(selectedCategoryName ? { selectedCategoryName } : {})}
        onCategoryFilter={handleCategoryFilter}
        isLoading={isLoading}
        onDataChange={handleDataChange}
      />
      
      {selectedDrink && (
        <DrinkOptionsManager
          drinkId={selectedDrink.id}
          drinkName={selectedDrink.name}
          onClose={handleCloseOptionsManager}
        />
      )}
    </>
  )
}