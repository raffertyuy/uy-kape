import React, { useState } from 'react'
import { DrinkCategoryList } from './DrinkCategoryList'
import { useDrinkCategories, useUpdateDrinkCategory, useDeleteDrinkCategory } from '@/hooks/useMenuData'
import type { DrinkCategory, MenuFilters } from '@/types/menu.types'

interface DrinkCategoryManagementProps {
  onDataChange?: () => void
  searchQuery?: string
  filters?: MenuFilters
}

export const DrinkCategoryManagement: React.FC<DrinkCategoryManagementProps> = ({ 
  onDataChange,
  searchQuery = '',
  filters = {}
}) => {
  const { data: categories = [], isLoading, refetch: refetchCategories } = useDrinkCategories()
  
  const handleDataChange = () => {
    refetchCategories()
    onDataChange?.()
  }
  
  const { updateCategory } = useUpdateDrinkCategory(handleDataChange)
  const { deleteCategory } = useDeleteDrinkCategory(handleDataChange)

  const [editingCategory, setEditingCategory] = useState<DrinkCategory | null>(null)

  const handleEdit = (category: DrinkCategory) => {
    setEditingCategory(category)
  }

  const handleDelete = async (id: string) => {
    await deleteCategory(id)
  }

  const handleReorder = async (reorderedCategories: DrinkCategory[]) => {
    // Update display order for all categories
    const updates = reorderedCategories.map((category, index) => ({
      ...category,
      display_order: index
    }))

    // Update each category
    for (const category of updates) {
      await updateCategory(category.id, {
        display_order: category.display_order
      })
    }
  }

  if (editingCategory) {
    // Show edit mode or handle edit state
    // For now, just reset the editing state
    setTimeout(() => setEditingCategory(null), 0)
  }

  return (
    <DrinkCategoryList
      categories={categories}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onReorder={handleReorder}
      onDataChange={handleDataChange}
      isLoading={isLoading}
      searchQuery={searchQuery}
      filters={filters}
    />
  )
}