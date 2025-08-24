import { memo } from 'react'

interface OrderActionsProps {
  onSubmit: () => void | Promise<void> | Promise<boolean>
  onReset: () => void
  onCancel?: () => void
  isSubmitting: boolean
  isValid: boolean
  hasChanges: boolean
  className?: string
}

export const OrderActions = memo<OrderActionsProps>(
  function OrderActions({ 
    onSubmit, 
    onReset, 
    onCancel, 
    isSubmitting, 
    isValid, 
    hasChanges, 
    className = '' 
  }) {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        {/* Primary Submit Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className={`
            flex-1 px-6 py-3 rounded-lg font-semibold text-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isValid && !isSubmitting
              ? 'bg-coffee-600 hover:bg-coffee-700 text-white focus:ring-coffee-500'
              : 'bg-coffee-300 text-coffee-600 cursor-not-allowed'
            }
          `}
          aria-describedby="submit-button-status"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting Order...
            </span>
          ) : (
            'Submit Order'
          )}
        </button>

        {/* Secondary Actions */}
        <div className="flex gap-3 sm:flex-shrink-0">
          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            disabled={!hasChanges || isSubmitting}
            className={`
              px-4 py-3 rounded-lg font-medium border
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-400
              ${hasChanges && !isSubmitting
                ? 'border-coffee-300 text-coffee-700 bg-white hover:bg-coffee-50'
                : 'border-coffee-200 text-coffee-400 bg-coffee-50 cursor-not-allowed'
              }
            `}
            aria-label="Reset order to start over"
          >
            <span className="flex items-center">
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Reset
            </span>
          </button>

          {/* Cancel Button (optional) */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={`
                px-4 py-3 rounded-lg font-medium border
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400
                ${!isSubmitting
                  ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                  : 'border-red-200 text-red-400 bg-red-50 cursor-not-allowed'
                }
              `}
              aria-label="Cancel and go back"
            >
              <span className="flex items-center">
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
                Cancel
              </span>
            </button>
          )}
        </div>

        {/* Status message for screen readers */}
        <div id="submit-button-status" className="sr-only">
          {isSubmitting 
            ? 'Order is being submitted, please wait'
            : isValid 
            ? 'Order is ready to submit'
            : 'Please complete all required fields before submitting'
          }
        </div>
      </div>
    )
  }
)

export default OrderActions