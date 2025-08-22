import React, { useState } from 'react'
import { useNetworkErrorHandler } from '../../hooks/useNetworkErrorHandler'
import { useEnhancedErrorHandling } from '../../hooks/useEnhancedErrorHandling'

/**
 * Demo component to showcase the enhanced error handling capabilities
 * This component is only visible in development mode for testing purposes
 */
export const ErrorHandlingDemo: React.FC = () => {
  const { handleNetworkOperation, handleFormSubmission, handleDataFetch } = useNetworkErrorHandler()
  const { setErrorWithToast } = useEnhancedErrorHandling()
  const [isLoading, setIsLoading] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const simulateNetworkError = async () => {
    setIsLoading(true)
    try {
      await handleNetworkOperation(
        async () => {
          throw new Error('NetworkError: Failed to fetch')
        },
        {
          operationName: 'Network Test',
          maxRetries: 2,
          showSuccessToast: true,
          successMessage: 'Network operation completed!'
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  const simulateServerError = async () => {
    setIsLoading(true)
    try {
      await handleNetworkOperation(
        async () => {
          // Simulate a delay then error
          await new Promise(resolve => setTimeout(resolve, 1000))
          throw new Error('Server Error: Internal server error occurred')
        },
        {
          operationName: 'Server Test',
          maxRetries: 1,
          customErrorHandler: () => 'Our coffee servers are brewing up some trouble. Please try again!'
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  const simulateFormSubmission = async () => {
    setIsLoading(true)
    try {
      await handleFormSubmission(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1500))
          throw new Error('ValidationError: Invalid coffee order data')
        },
        'Coffee Order'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const simulateDataFetch = async () => {
    setIsLoading(true)
    try {
      await handleDataFetch(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 800))
          throw new Error('NotFoundError: Coffee menu not found')
        },
        'Coffee Menu'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const simulateContextError = () => {
    setErrorWithToast(
      new Error('Global Error: This error will appear in both toast and global notification'),
      'demo_context_error'
    )
  }

  const simulateCriticalError = () => {
    setErrorWithToast(
      new Error('Server Error: Critical database connection failure'),
      'critical_system_error'
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800">🧪 Error Handling Demo</h3>
        <p className="text-xs text-gray-600">Development mode only</p>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={simulateNetworkError}
          disabled={isLoading}
          className="w-full px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Network Error
        </button>
        
        <button
          onClick={simulateServerError}
          disabled={isLoading}
          className="w-full px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Server Error
        </button>
        
        <button
          onClick={simulateFormSubmission}
          disabled={isLoading}
          className="w-full px-3 py-1.5 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Form Error
        </button>
        
        <button
          onClick={simulateDataFetch}
          disabled={isLoading}
          className="w-full px-3 py-1.5 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Data Fetch Error
        </button>
        
        <button
          onClick={simulateContextError}
          disabled={isLoading}
          className="w-full px-3 py-1.5 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Global Error
        </button>
        
        <button
          onClick={simulateCriticalError}
          disabled={isLoading}
          className="w-full px-3 py-1.5 text-xs bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
        >
          Critical Error
        </button>
      </div>
      
      {isLoading && (
        <div className="mt-3 text-xs text-gray-600 flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2" />
          Testing...
        </div>
      )}
    </div>
  )
}

export default ErrorHandlingDemo