import React from 'react'
import type { DrinkOptionPreview } from '@/types/menu.types'

interface DrinkOptionsPreviewProps {
  options: DrinkOptionPreview[]
  maxDisplayOptions?: number // Show "and X more" for cards with many options
  variant: 'grid' | 'list' // Different layouts for grid vs list view
  className?: string
}

export const DrinkOptionsPreview: React.FC<DrinkOptionsPreviewProps> = React.memo(({
  options,
  maxDisplayOptions = 3,
  variant,
  className = ''
}) => {
  // Handle empty options
  if (!options || options.length === 0) {
    return (
      <div className={`text-sm text-coffee-500 italic ${className}`}>
        No options configured
      </div>
    )
  }

  const displayedOptions = options.slice(0, maxDisplayOptions)
  const remainingCount = Math.max(0, options.length - maxDisplayOptions)

  const baseClasses = variant === 'grid' 
    ? 'text-xs space-y-1' 
    : 'text-xs flex flex-wrap gap-2'

  return (
    <div 
      className={`${baseClasses} ${className}`}
      role="list"
      aria-label={`Drink options (${options.length} total)`}
    >
      {displayedOptions.map((option) => (
        <div
          key={option.id}
          className={variant === 'grid' 
            ? 'flex justify-between items-center text-coffee-500'
            : 'inline-flex items-center px-3 py-1.5 bg-coffee-50 rounded-lg text-coffee-700 border border-coffee-100'
          }
          role="listitem"
        >
          {variant === 'grid' ? (
            <span>
              {option.option_category_name}: {option.default_value_name || 'Not set'}
            </span>
          ) : (
            <span className="font-medium">
              {option.option_category_name}: <span className="font-semibold">{option.default_value_name || 'Not set'}</span>
            </span>
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={variant === 'grid'
            ? 'text-coffee-500 font-medium italic'
            : 'inline-flex items-center px-3 py-1.5 bg-coffee-100 rounded-lg text-coffee-600 font-medium border border-coffee-200'
          }
          aria-label={`${remainingCount} more options available`}
        >
          +{remainingCount} more
        </div>
      )}
    </div>
  )
})

DrinkOptionsPreview.displayName = 'DrinkOptionsPreview'