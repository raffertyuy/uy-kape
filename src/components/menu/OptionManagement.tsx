import React, { useState } from 'react'
import { OptionCategoryList } from './OptionCategoryList'
import { OptionValueList } from './OptionValueList'
import type { OptionCategory, MenuFilters } from '@/types/menu.types'

interface OptionManagementProps {
  onDataChange?: () => void
  searchQuery?: string
  filters?: MenuFilters
}

export const OptionManagement: React.FC<OptionManagementProps> = ({ 
  onDataChange,
  searchQuery = '',
  filters = {}
}) => {
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
      searchQuery={searchQuery}
      filters={filters}
      {...(onDataChange ? { onDataChange } : {})}
    />
  )
}