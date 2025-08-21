import { memo } from 'react'
import type { DrinkWithOptionsPreview } from '@/types/menu.types'

interface DrinkCardProps {
  drink: DrinkWithOptionsPreview
  isSelected: boolean
  onSelect: (drinkId: string) => void
  className?: string
}

export const DrinkCard = memo<DrinkCardProps>(
  function DrinkCard({ drink, isSelected, onSelect, className = '' }) {
    const handleClick = () => {
      onSelect(drink.id)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect(drink.id)
      }
    }

    const borderColorClass = isSelected 
      ? 'border-coffee-500 bg-coffee-50 shadow-md' 
      : 'border-coffee-200 hover:border-coffee-300 hover:shadow-sm'
    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-describedby={`drink-${drink.id}-description`}
        className={`
          relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
          ${borderColorClass}
          ${className}
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-5 h-5 bg-coffee-500 rounded-full flex items-center justify-center">
              <svg 
                className="w-3 h-3 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
        )}

        {/* Drink information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-coffee-800 text-lg leading-tight">
            {drink.name}
          </h4>
          
          {drink.description && (
            <p 
              id={`drink-${drink.id}-description`}
              className="text-coffee-600 text-sm leading-relaxed"
            >
              {drink.description}
            </p>
          )}

          {/* Category badge */}
          {drink.category && (
            <div className="inline-block">
              <span className="px-2 py-1 bg-coffee-100 text-coffee-700 text-xs font-medium rounded-full">
                {drink.category.name}
              </span>
            </div>
          )}

          {/* Options preview */}
          {drink.options_preview && drink.options_preview.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-coffee-700">
                Customizable:
              </p>
              <div className="flex flex-wrap gap-1">
                {drink.options_preview.slice(0, 3).map((option) => (
                  <span
                    key={option.id}
                    className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                  >
                    {option.option_category_name}
                  </span>
                ))}
                {drink.options_preview.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{drink.options_preview.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action hint */}
        <div className="mt-3 pt-2 border-t border-coffee-100">
          <p className="text-xs text-coffee-500 text-center">
            {isSelected ? 'Selected' : 'Tap to select'}
          </p>
        </div>
      </div>
    )
  }
)

export default DrinkCard