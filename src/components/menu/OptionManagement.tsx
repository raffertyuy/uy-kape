import React, { useState } from 'react'
import { OptionCategoryList } from './OptionCategoryList'
import { OptionValueList } from './OptionValueList'
import type { OptionCategory } from '@/types/menu.types'

export const OptionManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<OptionCategory | null>(null)

  const handleManageValues = (category: OptionCategory) => {
    setSelectedCategory(category)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
  }

  if (selectedCategory) {
    return (
      <OptionValueList
        category={selectedCategory}
        onBack={handleBackToCategories}
      />
    )
  }

  return (
    <OptionCategoryList
      onManageValues={handleManageValues}
    />
  )
}