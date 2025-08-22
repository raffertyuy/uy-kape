import { useState, useCallback } from 'react'
import { 
  handleGlobalError, 
  isRetryableError, 
  isOffline,
  withRetry,
  type RecoveryStrategy,
  getRecoveryStrategy 
} from '../utils/globalErrorHandler'

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

  const setError = useCallback((error: any, action?: string) => {
    const errorDetails = handleGlobalError(error, action)
    
    setState({
      error: errorDetails,
      isError: true,
      isRetrying: false
    })
  }, [])

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

// Enhanced network error handling hook
export const useNetworkErrorHandling = () => {
  const [networkState, setNetworkState] = useState({
    isOffline: isOffline(),
    retryCount: 0,
    lastConnectionTime: null as Date | null
  })

  const retryWithBackoff = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context?: string
  ): Promise<T> => {
    return withRetry(operation, maxRetries, baseDelay, context)
  }, [])

  const handleNetworkError = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string,
    options?: {
      maxRetries?: number
      baseDelay?: number
      showOfflineMessage?: boolean
    }
  ): Promise<T | null> => {
    const { maxRetries = 3, baseDelay = 1000, showOfflineMessage = true } = options || {}

    try {
      // Check if we're offline first
      if (isOffline()) {
        setNetworkState(prev => ({ ...prev, isOffline: true }))
        if (showOfflineMessage) {
          throw new Error('You appear to be offline. Please check your internet connection.')
        }
        return null
      }

      const result = await retryWithBackoff(operation, maxRetries, baseDelay, context)
      
      // Reset network state on successful operation
      setNetworkState(prev => ({
        ...prev,
        isOffline: false,
        retryCount: 0,
        lastConnectionTime: new Date()
      }))
      
      return result
    } catch (error) {
      // Update retry count
      setNetworkState(prev => ({ 
        ...prev, 
        retryCount: prev.retryCount + 1,
        isOffline: isOffline()
      }))
      
      throw error
    }
  }, [retryWithBackoff])

  const resetNetworkState = useCallback(() => {
    setNetworkState({
      isOffline: isOffline(),
      retryCount: 0,
      lastConnectionTime: new Date()
    })
  }, [])

  return {
    ...networkState,
    retryWithBackoff,
    handleNetworkError,
    resetNetworkState,
    isRetryableError,
    checkOnlineStatus: () => !isOffline()
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

// Hook for operation-specific error handling with recovery strategies
export const useOperationErrorHandling = () => {
  const errorHandling = useErrorHandling()
  const networkHandling = useNetworkErrorHandling()

  const wrapOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    options?: {
      enableRetry?: boolean
      maxRetries?: number
      successMessage?: string
    }
  ): Promise<T | null> => {
    const { enableRetry = true, maxRetries = 3, successMessage } = options || {}

    try {
      let result: T

      if (enableRetry) {
        result = await networkHandling.handleNetworkError(
          operation,
          operationName,
          { maxRetries }
        ) as T
      } else {
        result = await errorHandling.handleAsyncOperation(operation, operationName) as T
      }
      
      if (result && successMessage) {
        // Integration with toast system will be added when ToastProvider is available
        // For now, we'll leave this as a placeholder for future enhancement
      }
      
      return result
    } catch (error) {
      return null
    }
  }, [errorHandling, networkHandling])

  const getErrorRecoveryStrategy = useCallback((error: any): RecoveryStrategy => {
    const category = errorHandling.error ? categorizeError(errorHandling.error as any) : 'unknown'
    return getRecoveryStrategy(category, error)
  }, [errorHandling.error])

  return {
    ...errorHandling,
    ...networkHandling,
    wrapOperation,
    getErrorRecoveryStrategy
  }
}

// Simple categorize function for backward compatibility
const categorizeError = (error: any): ErrorCategory => {
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
}