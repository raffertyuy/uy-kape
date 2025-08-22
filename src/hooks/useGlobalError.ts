import { useCallback, useContext } from 'react'
import { ErrorContext, type ErrorContextState } from '../contexts/ErrorContext'

export const useGlobalError = (): ErrorContextState => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useGlobalError must be used within an ErrorContextProvider')
  }
  return context
}

// Hook for reporting errors to the global context
export const useErrorReporting = () => {
  const { addError } = useGlobalError()

  const reportError = useCallback((error: unknown, context?: string) => {
    addError(error, context)
  }, [addError])

  const reportNetworkError = useCallback((error: unknown, operation?: string) => {
    reportError(error, `network_${operation || 'unknown'}`)
  }, [reportError])

  const reportValidationError = useCallback((error: unknown, form?: string) => {
    reportError(error, `validation_${form || 'unknown'}`)
  }, [reportError])

  const reportServerError = useCallback((error: unknown, endpoint?: string) => {
    reportError(error, `server_${endpoint || 'unknown'}`)
  }, [reportError])

  return {
    reportError,
    reportNetworkError,
    reportValidationError,
    reportServerError
  }
}

// Hook for handling critical errors that should show global error states
export const useCriticalErrorHandling = () => {
  const { addError, isGlobalError, getLatestError } = useGlobalError()

  const handleCriticalError = useCallback((error: unknown, context?: string) => {
    // Add error to global context
    addError(error, context)

    // For server errors, consider navigating to error page
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = (error as { status: number }).status
      if (status >= 500) {
        // Navigate to server error page
        setTimeout(() => {
          window.location.href = `/error?code=${status}`
        }, 1000)
      }
    }
  }, [addError])

  const handleNetworkFailure = useCallback((error: unknown) => {
    handleCriticalError(error, 'critical_network_failure')
  }, [handleCriticalError])

  return {
    handleCriticalError,
    handleNetworkFailure,
    isGlobalError,
    latestError: getLatestError()
  }
}