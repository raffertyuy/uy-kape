import { memo } from 'react'
import type { DrinkWithOptionsAndCategory, OptionCategoryWithValues } from '@/types/menu.types'

interface OrderSummaryProps {
  drink: DrinkWithOptionsAndCategory
  selectedOptions: Record<string, string>
  optionCategories: OptionCategoryWithValues[]
  guestName: string
  specialRequest?: string
  className?: string
}

export const OrderSummary = memo<OrderSummaryProps>(
  function OrderSummary({ 
    drink, 
    selectedOptions, 
    optionCategories, 
    guestName, 
    specialRequest,
    className = '' 
  }) {
    // Create a map for quick option value lookups
    const optionValueMap = new Map<string, { name: string; categoryName: string }>()
    
    optionCategories.forEach(category => {
      category.option_values.forEach(value => {
        optionValueMap.set(value.id, {
          name: value.name,
          categoryName: category.name
        })
      })
    })

    const selectedOptionsList = Object.entries(selectedOptions).map(([categoryId, valueId]) => {
      const category = optionCategories.find(cat => cat.id === categoryId)
      const valueInfo = optionValueMap.get(valueId)
      
      return {
        categoryId,
        categoryName: category?.name || 'Unknown Category',
        valueId,
        valueName: valueInfo?.name || 'Unknown Option'
      }
    })

    return (
      <div className={`bg-coffee-50 rounded-lg p-6 border border-coffee-200 ${className}`} data-testid="order-summary">
        <h3 className="text-xl font-semibold text-coffee-800 mb-4">
          Order Summary
        </h3>

        {/* Guest Information */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <svg 
              className="w-5 h-5 text-coffee-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
            <span className="text-sm font-medium text-coffee-700">Order for:</span>
          </div>
          <p className="text-lg font-semibold text-coffee-800 ml-7">
            {guestName || 'Guest'}
          </p>
        </div>

        {/* Drink Information */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <svg 
              className="w-5 h-5 text-coffee-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
              />
            </svg>
            <span className="text-sm font-medium text-coffee-700">Drink:</span>
          </div>
          <div className="ml-7">
            <p className="text-lg font-semibold text-coffee-800">
              {drink.name}
            </p>
            {drink.description && (
              <p className="text-sm text-coffee-600 mt-1">
                {drink.description}
              </p>
            )}
          </div>
        </div>

        {/* Selected Options */}
        {selectedOptionsList.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <svg 
                className="w-5 h-5 text-coffee-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" 
                />
              </svg>
              <span className="text-sm font-medium text-coffee-700">Customizations:</span>
            </div>
            <div className="ml-7 space-y-2">
              {selectedOptionsList.map(({ categoryId, categoryName, valueName }) => (
                <div key={categoryId} className="flex justify-between items-center">
                  <span className="text-sm text-coffee-700">{categoryName}:</span>
                  <span className="text-sm font-medium text-coffee-800">{valueName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Request */}
        {specialRequest && specialRequest.trim() && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <svg 
                className="w-5 h-5 text-coffee-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
                />
              </svg>
              <span className="text-sm font-medium text-coffee-700">Special Request:</span>
            </div>
            <div className="ml-7 bg-white rounded-lg p-3 border border-coffee-200">
              <p className="text-sm text-coffee-800 whitespace-pre-wrap">
                {specialRequest.trim()}
              </p>
            </div>
          </div>
        )}

        {/* Order Status */}
        <div className="border-t border-coffee-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-coffee-700">Status:</span>
            <span className="text-sm font-semibold text-coffee-800 bg-amber-100 px-2 py-1 rounded">
              Ready to Submit
            </span>
          </div>
        </div>
      </div>
    )
  }
)

export default OrderSummary