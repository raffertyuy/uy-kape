import { memo } from 'react'
import type { DrinkWithOptionsAndCategory, OptionCategoryWithValues } from '@/types/menu.types'
import { OptionCategory } from './OptionCategory'

interface DrinkOptionsFormProps {
  drink: DrinkWithOptionsAndCategory
  selectedOptions: Record<string, string>
  onOptionChange: (_categoryId: string, _valueId: string) => void
  optionCategories: OptionCategoryWithValues[]
  isLoading?: boolean
  error?: string | null
  className?: string
}

export const DrinkOptionsForm = memo<DrinkOptionsFormProps>(
  function DrinkOptionsForm({ 
    drink, 
    selectedOptions, 
    onOptionChange,
    optionCategories,
    isLoading = false,
    error = null,
    className = '' 
  }) {
    // Show loading state
    if (isLoading) {
      return (
        <div className={`text-center py-8 ${className}`}>
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600" />
            <p className="text-coffee-600">
              Loading customization options...
            </p>
          </div>
        </div>
      )
    }

    // Show error state with elegant message
    if (error) {
      return (
        <div className={`text-center py-8 ${className}`}>
          <div className="flex flex-col items-center space-y-4">
            <svg 
              className="w-12 h-12 text-coffee-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
              />
            </svg>
            <div className="text-center">
              <h4 className="text-lg font-medium text-coffee-800 mb-2">
                Customization Options Unavailable
              </h4>
              <p className="text-coffee-600 mb-4">
                We're having trouble loading the customization options for your drink.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium">
                  ☕ Please speak with the barista for your customized options
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  They'll be happy to prepare your {drink.name} exactly how you like it!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Show message if no options are available for this drink
    if (optionCategories.length === 0) {
      return (
        <div className={`text-center py-8 ${className}`}>
          <div className="flex flex-col items-center space-y-4">
            <svg 
              className="w-12 h-12 text-coffee-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="text-center">
              <h4 className="text-lg font-medium text-coffee-800 mb-2">
                Perfect as is!
              </h4>
              <p className="text-coffee-600">
                Your {drink.name} doesn't need any customization options.
              </p>
              <p className="text-coffee-500 text-sm mt-1">
                It's already crafted to perfection!
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={`space-y-6 ${className}`}>
        <div className="border-b border-coffee-200 pb-4">
          <h3 className="text-xl font-semibold text-coffee-800">
            Customize Your {drink.name}
          </h3>
          <p className="text-sm text-coffee-600 mt-1">
            Select your preferences for this drink
          </p>
        </div>

        <div className="space-y-6">
          {optionCategories.map((category) => (
            <OptionCategory
              key={category.id}
              category={category}
              selectedValue={selectedOptions[category.id]}
              onValueChange={onOptionChange}
              isRequired={category.is_required}
              className="border-b border-coffee-100 pb-6 last:border-b-0 last:pb-0"
            />
          ))}
        </div>
      </div>
    )
  }
)

export default DrinkOptionsForm