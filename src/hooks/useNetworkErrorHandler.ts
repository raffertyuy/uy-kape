import { useCallback, useContext } from 'react'
import { ErrorContext } from '../contexts/ErrorContext'
import { useToast } from './useToastHook'

/**
 * Hook for handling network operations with automatic error handling and user feedback
 * Provides retry functionality and user-friendly error messages
 */
export const useNetworkErrorHandler = () => {
  const errorContext = useContext(ErrorContext)
  const toast = useToast()

  /**
   * Wraps a network operation with error handling and retry functionality
   */
  const handleNetworkOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      operationName?: string
      maxRetries?: number
      showSuccessToast?: boolean
      successMessage?: string
      customErrorHandler?: (_error: Error) => string | null
    } = {}
  ): Promise<T | null> => {
    const {
      operationName = 'Operation',
      maxRetries = 2,
      showSuccessToast = false,
      successMessage,
      customErrorHandler
    } = options

    let attempt = 0
    let lastError: Error | null = null

    while (attempt <= maxRetries) {
      try {
        const result = await operation()
        
        // Show success message if requested
        if (showSuccessToast && successMessage) {
          toast.showSuccess('Success', successMessage)
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        attempt++

        // If we have more retries left, wait and try again
        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000 // Exponential backoff: 1s, 2s, 4s
          
          toast.showInfo(
            'Retrying...',
            `${operationName} failed. Retrying in ${delay / 1000} second${delay > 1000 ? 's' : ''}... (Attempt ${attempt}/${maxRetries + 1})`
          )
          
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        // All retries exhausted, handle the error
        break
      }
    }

    // Handle the final error
    if (lastError) {
      let errorMessage = customErrorHandler?.(lastError)
      
      if (!errorMessage) {
        // Provide user-friendly error messages based on error type
        if (lastError.message.toLowerCase().includes('fetch')) {
          errorMessage = 'Network connection failed. Please check your internet connection.'
        } else if (lastError.message.toLowerCase().includes('timeout')) {
          errorMessage = 'The request timed out. Please try again.'
        } else if (lastError.message.toLowerCase().includes('server') || lastError.message.includes('500')) {
          errorMessage = 'Server error occurred. Please try again later.'
        } else if (lastError.message.toLowerCase().includes('unauthorized') || lastError.message.includes('401')) {
          errorMessage = 'Authentication failed. Please log in again.'
        } else if (lastError.message.toLowerCase().includes('forbidden') || lastError.message.includes('403')) {
          errorMessage = 'You don\'t have permission to perform this action.'
        } else {
          errorMessage = `${operationName} failed. Please try again.`
        }
      }

      // Add to error context for global tracking
      if (errorContext) {
        errorContext.addError(lastError, operationName.toLowerCase().replace(/\s+/g, '_'))
      }

      // Show error toast with retry option
      toast.showError(
        `${operationName} Failed`,
        errorMessage,
        {
          label: 'Try Again',
          onClick: () => {
            // Recursive retry - call the same function again
            handleNetworkOperation(operation, { ...options, maxRetries: 1 })
          }
        }
      )
    }

    return null
  }, [errorContext, toast])

  /**
   * Handles form submission with network error handling
   */
  const handleFormSubmission = useCallback(async <T>(
    submitOperation: () => Promise<T>,
    formName: string = 'form'
  ): Promise<T | null> => {
    return handleNetworkOperation(submitOperation, {
      operationName: `${formName} submission`,
      maxRetries: 1,
      showSuccessToast: true,
      successMessage: `${formName} submitted successfully!`,
      customErrorHandler: (error) => {
        if (error.message.toLowerCase().includes('validation')) {
          return 'Please check your input and try again.'
        }
        if (error.message.toLowerCase().includes('conflict')) {
          return 'This data conflicts with existing information. Please review and try again.'
        }
        return null // Use default error handling
      }
    })
  }, [handleNetworkOperation])

  /**
   * Handles data fetching with network error handling
   */
  const handleDataFetch = useCallback(async <T>(
    fetchOperation: () => Promise<T>,
    dataType: string = 'data'
  ): Promise<T | null> => {
    return handleNetworkOperation(fetchOperation, {
      operationName: `Loading ${dataType}`,
      maxRetries: 2,
      showSuccessToast: false,
      customErrorHandler: (error) => {
        if (error.message.toLowerCase().includes('not found') || error.message.includes('404')) {
          return `${dataType} not found. It may have been deleted or moved.`
        }
        return null // Use default error handling
      }
    })
  }, [handleNetworkOperation])

  return {
    handleNetworkOperation,
    handleFormSubmission,
    handleDataFetch
  }
}