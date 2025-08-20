import React, { useState } from 'react'
import { DrinkCategoryList } from './DrinkCategoryList'
import { useDrinkCategories, useUpdateDrinkCategory, useDeleteDrinkCategory } from '@/hooks/useMenuData'
import type { DrinkCategory } from '@/types/menu.types'

export const DrinkCategoryManagement: React.FC = () => {
  const { data: categories = [], isLoading } = useDrinkCategories()
  const { updateCategory } = useUpdateDrinkCategory()
  const { deleteCategory } = useDeleteDrinkCategory()

  const [editingCategory, setEditingCategory] = useState<DrinkCategory | null>(null)

  const handleEdit = (category: DrinkCategory) => {
    setEditingCategory(category)
  }

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id)
    }
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
      isLoading={isLoading}
    />
  )
}