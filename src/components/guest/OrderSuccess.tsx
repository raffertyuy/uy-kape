import { memo } from 'react'
import type { OrderSubmissionResult } from '@/types/order.types'

interface OrderSuccessProps {
  result: OrderSubmissionResult
  guestName: string
  specialRequest?: string
  onCreateNewOrder: () => void
  className?: string
}

export const OrderSuccess = memo<OrderSuccessProps>(
  function OrderSuccess({ 
    result, 
    guestName, 
    specialRequest,
    onCreateNewOrder, 
    className = '' 
  }) {
    return (
      <div className={`text-center space-y-6 ${className}`}>
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-coffee-800">
            Order Confirmed!
          </h2>
          <p className="text-lg text-coffee-600">
            Thanks {guestName}! Your order has been received.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-coffee-50 rounded-lg p-6 border border-coffee-200">
          <h3 className="text-lg font-semibold text-coffee-800 mb-4">
            Order Details
          </h3>
          
          <div className="space-y-3">
            {/* Order ID */}
            <div className="flex justify-between items-center">
              <span className="text-coffee-600">Order ID:</span>
              <span className="font-mono text-coffee-800 bg-white px-2 py-1 rounded">
                #{result.order_id.slice(-8).toUpperCase()}
              </span>
            </div>

            {/* Queue Number */}
            <div className="flex justify-between items-center">
              <span className="text-coffee-600">Queue Number:</span>
              <span className="text-2xl font-bold text-coffee-800">
                {result.queue_number}
              </span>
            </div>

            {/* Estimated Wait Time */}
            {result.estimated_wait_time && (
              <div className="flex justify-between items-center">
                <span className="text-coffee-600">Estimated Wait:</span>
                <span className="font-semibold text-coffee-800">
                  {result.estimated_wait_time}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Special Request */}
        {specialRequest && specialRequest.trim() && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <svg 
                className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" 
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
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Special Request:
                </p>
                <p className="text-sm text-blue-700 whitespace-pre-wrap">
                  {specialRequest.trim()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start space-x-3">
            <svg 
              className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium text-amber-800">
                What happens next:
              </p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• We&apos;ll start preparing your order</li>
                <li>• Listen for your name to be called</li>
                <li>• Your order will be ready at the pickup counter</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onCreateNewOrder}
            className="
              inline-flex items-center px-6 py-3 
              bg-coffee-600 hover:bg-coffee-700 
              text-white font-semibold rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2
            "
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            Place Another Order
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-coffee-500">
          Need help? Please ask a staff member at the counter.
        </p>
      </div>
    )
  }
)

export default OrderSuccess