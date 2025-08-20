import { useState, useCallback } from 'react'

export interface ErrorDetails {
  code?: string
  message: string
  details?: any
  timestamp: Date
  action?: string
}

export interface ErrorHandlingState {
  error: ErrorDetails | null
  isError: boolean
  isRetrying: boolean
}

export type ErrorCategory = 'network' | 'validation' | 'permission' | 'conflict' | 'unknown'

export const useErrorHandling = () => {
  const [state, setState] = useState<ErrorHandlingState>({
    error: null,
    isError: false,
    isRetrying: false
  })

  const categorizeError = useCallback((error: any): ErrorCategory => {
    if (error?.code === 'PGRST301' || error?.message?.includes('permission')) {
      return 'permission'
    }
    if (error?.code === 'PGRST116' || error?.message?.includes('conflict')) {
      return 'conflict'
    }
    if (error?.code?.startsWith('PGRST') || error?.name === 'ValidationError') {
      return 'validation'
    }
    if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      return 'network'
    }
    return 'unknown'
  }, [])

  const getUserFriendlyMessage = useCallback((error: any, category: ErrorCategory): string => {
    switch (category) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.'
      case 'permission':
        return 'You do not have permission to perform this action. Please contact your administrator.'
      case 'validation':
        return error?.message || 'The data you entered is invalid. Please check your input and try again.'
      case 'conflict':
        return 'This item was modified by another user. Please refresh and try again.'
      default:
        return error?.message || 'An unexpected error occurred. Please try again or contact support.'
    }
  }, [])

  const setError = useCallback((error: any, action?: string) => {
    const category = categorizeError(error)
    const userMessage = getUserFriendlyMessage(error, category)
    
    const errorDetails: ErrorDetails = {
      code: error?.code || error?.name,
      message: userMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined,
      timestamp: new Date(),
      ...(action && { action })
    }

    setState({
      error: errorDetails,
      isError: true,
      isRetrying: false
    })

    // Log error for debugging/monitoring
    console.error('Menu Error:', {
      category,
      action,
      originalError: error,
      userMessage
    })
  }, [categorizeError, getUserFriendlyMessage])

  const clearError = useCallback(() => {
    setState({
      error: null,
      isError: false,
      isRetrying: false
    })
  }, [])

  const retry = useCallback(async (retryFn: () => Promise<any>) => {
    setState(prev => ({ ...prev, isRetrying: true }))
    
    try {
      await retryFn()
      clearError()
    } catch (error) {
      setError(error, 'retry')
    } finally {
      setState(prev => ({ ...prev, isRetrying: false }))
    }
  }, [setError, clearError])

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    action?: string
  ): Promise<T | null> => {
    try {
      clearError()
      const result = await operation()
      return result
    } catch (error) {
      setError(error, action)
      return null
    }
  }, [setError, clearError])

  return {
    ...state,
    setError,
    clearError,
    retry,
    handleAsyncOperation
  }
}

// Hook for specific error handling patterns
export const useFormErrorHandling = () => {
  const { setError, clearError, isError, error } = useErrorHandling()

  const handleValidationError = useCallback((fieldErrors: Record<string, string>) => {
    const firstError = Object.values(fieldErrors)[0]
    setError(new Error(firstError), 'form_validation')
  }, [setError])

  const handleSubmissionError = useCallback((error: any) => {
    setError(error, 'form_submission')
  }, [setError])

  return {
    isError,
    error,
    clearError,
    handleValidationError,
    handleSubmissionError
  }
}

// Hook for operation-specific error handling
export const useOperationErrorHandling = () => {
  const errorHandling = useErrorHandling()

  const wrapOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    successMessage?: string
  ): Promise<T | null> => {
    const result = await errorHandling.handleAsyncOperation(operation, operationName)
    
    if (result && successMessage) {
      // Could integrate with toast/notification system here
      console.log(successMessage)
    }
    
    return result
  }, [errorHandling])

  return {
    ...errorHandling,
    wrapOperation
  }
}