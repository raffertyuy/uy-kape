import { memo } from 'react'
import type { DrinkWithOptionsPreview } from '@/types/menu.types'
import { useDrinksWithOptionsPreview } from '@/hooks/useMenuData'
import { DrinkCard } from './DrinkCard'

interface DrinkGridProps {
  selectedCategoryId?: string
  selectedDrinkId?: string
  onDrinkSelect: (_drinkId: string) => void
  className?: string
}

const DrinkCardSkeleton = memo(function DrinkCardSkeleton() {
  return (
    <div className="border border-coffee-200 rounded-lg p-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-coffee-200 rounded w-3/4" />
        <div className="h-3 bg-coffee-100 rounded w-full" />
        <div className="h-3 bg-coffee-100 rounded w-2/3" />
        <div className="flex gap-1 mt-2">
          <div className="h-5 bg-orange-100 rounded w-16" />
          <div className="h-5 bg-orange-100 rounded w-12" />
        </div>
      </div>
    </div>
  )
})

const EmptyState = memo(function EmptyState({ categoryName }: { categoryName?: string | undefined }) {
  return (
    <div className="col-span-full text-center py-12">
      <div className="text-6xl mb-4">☕</div>
      <h3 className="text-lg font-semibold text-coffee-700 mb-2">
        {categoryName ? `No drinks in ${categoryName}` : 'No drinks available'}
      </h3>
      <p className="text-coffee-600">
        {categoryName 
          ? 'Try selecting a different category' 
          : 'Please check back later or contact your host'
        }
      </p>
    </div>
  )
})

const ErrorState = memo(function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-full text-center py-12">
      <div className="text-4xl mb-4">😕</div>
      <h3 className="text-lg font-semibold text-coffee-700 mb-2">
        Unable to load drinks
      </h3>
      <p className="text-coffee-600 mb-4">
        Something went wrong while loading the menu
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 
                   focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
                   transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  )
})

export const DrinkGrid = memo<DrinkGridProps>(
  function DrinkGrid({ selectedCategoryId, selectedDrinkId, onDrinkSelect, className = '' }) {
    const { data: drinks, isLoading, error, refetch } = useDrinksWithOptionsPreview(selectedCategoryId)

    const activeDrinks = drinks.filter(drink => drink.is_active)

    if (isLoading) {
      return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
          {Array.from({ length: 6 }, (_, i) => (
            <DrinkCardSkeleton key={i} />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className={`grid grid-cols-1 ${className}`}>
          <ErrorState onRetry={refetch} />
        </div>
      )
    }

    if (activeDrinks.length === 0) {
      const categoryName = selectedCategoryId 
        ? drinks.find(d => d.category?.id === selectedCategoryId)?.category?.name
        : undefined
      
      return (
        <div className={`grid grid-cols-1 ${className}`}>
          <EmptyState categoryName={categoryName} />
        </div>
      )
    }

    return (
      <div 
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
        role="tabpanel"
        id="drinks-panel"
        aria-label={selectedCategoryId ? 'Drinks in selected category' : 'All available drinks'}
        data-testid="drink-selection"
      >
        {activeDrinks.map((drink: DrinkWithOptionsPreview) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            isSelected={selectedDrinkId === drink.id}
            onSelect={onDrinkSelect}
          />
        ))}
      </div>
    )
  }
)

export default DrinkGrid