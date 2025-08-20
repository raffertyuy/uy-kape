import React, { useState } from 'react'
import { DrinkList } from './DrinkList'
import { DrinkOptionsManager } from './DrinkOptionsManager'
import { useDrinks, useDrinkCategories, useDeleteDrink } from '@/hooks/useMenuData'

export const DrinkManagement: React.FC = () => {
  const { data: drinks, isLoading: loadingDrinks } = useDrinks()
  const { data: categories } = useDrinkCategories()
  const { deleteDrink } = useDeleteDrink()
  
  const [selectedDrink, setSelectedDrink] = useState<{ id: string; name: string } | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)

  const handleEditDrink = async (drink: any) => {
    // Handle edit - this would typically open a form modal
    console.log('Edit drink:', drink)
  }

  const handleDeleteDrink = async (id: string) => {
    try {
      await deleteDrink(id)
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

  const handleCategoryFilter = (categoryId: string | undefined) => {
    setSelectedCategoryId(categoryId)
  }

  return (
    <>
      <DrinkList
        drinks={drinks || []}
        categories={categories || []}
        onEdit={handleEditDrink}
        onDelete={handleDeleteDrink}
        onManageOptions={handleManageOptions}
        {...(selectedCategoryId ? { selectedCategoryId } : {})}
        onCategoryFilter={handleCategoryFilter}
        isLoading={loadingDrinks}
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