import { memo } from 'react'
import type { DrinkCategory } from '@/types/menu.types'
import { useDrinkCategories } from '@/hooks/useMenuData'

interface DrinkCategoryTabsProps {
  selectedCategoryId?: string
  onCategorySelect: (_categoryId: string | undefined) => void
  className?: string
}

export const DrinkCategoryTabs = memo<DrinkCategoryTabsProps>(
  function DrinkCategoryTabs({ selectedCategoryId, onCategorySelect, className = '' }) {
    const { data: categories, isLoading, error } = useDrinkCategories()

    if (isLoading) {
      return (
        <div className={`space-y-2 ${className}`}>
          <div className="animate-pulse">
            <div className="h-4 bg-coffee-200 rounded w-32 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 bg-coffee-100 rounded w-20" />
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className={`text-center py-4 ${className}`} role="alert">
          <p className="text-red-600 text-sm">Failed to load categories</p>
        </div>
      )
    }

    const handleCategoryClick = (categoryId?: string) => {
      onCategorySelect(categoryId)
    }

    const handleKeyDown = (event: React.KeyboardEvent, categoryId?: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleCategoryClick(categoryId)
      }
    }

    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-lg font-semibold text-coffee-800">
          Choose a Category
        </h3>
        
        <div className="w-full overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex space-x-2 min-w-max pb-2" role="tablist" aria-label="Drink categories">
            {/* All drinks option */}
            <button
              type="button"
              role="tab"
              aria-selected={!selectedCategoryId}
              aria-controls="drinks-panel"
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
                ${!selectedCategoryId
                  ? 'bg-coffee-600 text-white shadow-md'
                  : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
                }
              `}
              onClick={() => handleCategoryClick(undefined)}
              onKeyDown={(e) => handleKeyDown(e, undefined)}
            >
              All Drinks
            </button>

            {categories
              .filter(category => category.is_active)
              .map((category: DrinkCategory) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategoryId === category.id}
                  aria-controls="drinks-panel"
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
                    ${selectedCategoryId === category.id
                      ? 'bg-coffee-600 text-white shadow-md'
                      : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
                    }
                  `}
                  onClick={() => handleCategoryClick(category.id)}
                  onKeyDown={(e) => handleKeyDown(e, category.id)}
                >
                  {category.name}
                </button>
              ))}
          </div>
        </div>
      </div>
    )
  }
)

export default DrinkCategoryTabs