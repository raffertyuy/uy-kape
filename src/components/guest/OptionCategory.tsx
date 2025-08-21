import { memo } from 'react'
import type { OptionCategoryWithValues } from '@/types/menu.types'

interface OptionCategoryProps {
  category: OptionCategoryWithValues
  selectedValue?: string
  onValueChange: (_categoryId: string, _valueId: string) => void
  isRequired?: boolean
  className?: string
}

export const OptionCategory = memo<OptionCategoryProps>(
  function OptionCategory({ 
    category, 
    selectedValue, 
    onValueChange, 
    isRequired = false, 
    className = '' 
  }) {
    const activeValues = category.option_values.filter(value => value.is_active)

    if (activeValues.length === 0) {
      return null
    }

    const handleOptionChange = (valueId: string) => {
      onValueChange(category.id, valueId)
    }

    const handleKeyDown = (event: React.KeyboardEvent, valueId: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleOptionChange(valueId)
      }
    }

    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <h4 className="text-lg font-medium text-coffee-700">
            {category.name}
          </h4>
          {isRequired && (
            <span className="text-red-500 text-sm font-medium" aria-label="Required">
              *
            </span>
          )}
        </div>

        {category.description && (
          <p className="text-sm text-coffee-600">
            {category.description}
          </p>
        )}

        <div 
          className="space-y-2"
          role="radiogroup"
          aria-labelledby={`option-category-${category.id}-label`}
          aria-required={isRequired}
        >
          <span id={`option-category-${category.id}-label`} className="sr-only">
            {category.name} {isRequired ? '(required)' : '(optional)'}
          </span>
          
          {activeValues.map((value) => {
            const isSelected = selectedValue === value.id
            
            return (
              <div
                key={value.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`
                  relative flex items-center p-3 rounded-lg border cursor-pointer
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
                  ${isSelected
                    ? 'border-coffee-500 bg-coffee-50 shadow-sm'
                    : 'border-coffee-200 hover:border-coffee-300 hover:bg-coffee-25'
                  }
                `}
                onClick={() => handleOptionChange(value.id)}
                onKeyDown={(e) => handleKeyDown(e, value.id)}
              >
                {/* Radio button visual */}
                <div className="flex-shrink-0 mr-3">
                  <div className={`
                    w-4 h-4 rounded-full border-2 transition-colors duration-200
                    ${isSelected
                      ? 'border-coffee-500 bg-coffee-500'
                      : 'border-coffee-300'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </div>

                {/* Option content */}
                <div className="flex-1">
                  <div className="font-medium text-coffee-800">
                    {value.name}
                  </div>
                  {value.description && (
                    <div className="text-sm text-coffee-600 mt-1">
                      {value.description}
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="flex-shrink-0 ml-3">
                    <svg 
                      className="w-5 h-5 text-coffee-500" 
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
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

export default OptionCategory