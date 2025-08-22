import { useEffect, useContext, useRef } from 'react'
import { ErrorContext } from '../contexts/ErrorContext'
import { useToast } from './useToastHook'

/**
 * Hook that automatically displays toast notifications for errors in the ErrorContext
 * This bridges the gap between error handling and user-visible notifications
 */
export const useErrorToast = () => {
  const errorContext = useContext(ErrorContext)
  const toast = useToast()
  const processedErrorsRef = useRef<Set<string>>(new Set())
  const errorContextRef = useRef(errorContext)
  const toastRef = useRef(toast)

  // Update refs
  errorContextRef.current = errorContext
  toastRef.current = toast

  useEffect(() => {
    const currentErrorContext = errorContextRef.current
    const currentToast = toastRef.current

    if (!currentErrorContext || currentErrorContext.errors.length === 0) {
      return
    }

    const latestError = currentErrorContext.getLatestError()
    if (!latestError) {
      return
    }

    // Prevent processing the same error multiple times
    const errorId = (latestError as any).id || `${latestError.message}-${Date.now()}`
    if (processedErrorsRef.current.has(errorId)) {
      return
    }
    processedErrorsRef.current.add(errorId)

    // Determine error category for deduplication
    const getErrorCategory = (error: typeof latestError) => {
      const message = error.message.toLowerCase()
      
      if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return 'network'
      }
      if (message.includes('server') || message.includes('500') || message.includes('internal')) {
        return 'server'
      }
      if (message.includes('permission') || message.includes('unauthorized') || message.includes('403')) {
        return 'permission'
      }
      if (message.includes('validation') || message.includes('invalid') || message.includes('400')) {
        return 'validation'
      }
      if (message.includes('timeout')) {
        return 'timeout'
      }
      
      return 'general'
    }

    const errorCategory = getErrorCategory(latestError)
    
    // For server and network errors, only show toast if no global error banner is active
    // This prevents redundant notifications
    const shouldShowToast = !(
      (errorCategory === 'server' || errorCategory === 'network') && 
      currentErrorContext.isGlobalError
    )

    if (!shouldShowToast) {
      // Don't show toast for this error, but still mark it as processed
      return
    }

    // Create user-friendly error messages
    const getErrorTitle = (error: typeof latestError) => {
      const message = error.message.toLowerCase()
      
      if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return 'Connection Problem'
      }
      if (message.includes('server') || message.includes('500') || message.includes('internal')) {
        return 'Server Error'
      }
      if (message.includes('permission') || message.includes('unauthorized') || message.includes('403')) {
        return 'Access Denied'
      }
      if (message.includes('validation') || message.includes('invalid') || message.includes('400')) {
        return 'Invalid Data'
      }
      if (message.includes('timeout')) {
        return 'Request Timeout'
      }
      
      return 'Something went wrong'
    }

    const getErrorMessage = (error: typeof latestError) => {
      const message = error.message.toLowerCase()
      
      if (message.includes('network') || message.includes('fetch')) {
        return 'Please check your internet connection and try again.'
      }
      if (message.includes('server') || message.includes('500')) {
        return 'Our servers are experiencing issues. Please try again in a moment.'
      }
      if (message.includes('permission') || message.includes('unauthorized')) {
        return 'You don\'t have permission to perform this action.'
      }
      if (message.includes('validation') || message.includes('invalid')) {
        return 'Please check your input and try again.'
      }
      if (message.includes('timeout')) {
        return 'The request took too long. Please try again.'
      }
      if (message.includes('database') || message.includes('connection timeout')) {
        return 'We\'re experiencing database issues. Please try again shortly.'
      }
      
      // If it's a user-friendly message already, use it
      if (error.message.length < 100 && !error.message.includes('Error:')) {
        return error.message
      }
      
      return 'An unexpected error occurred. Please try refreshing the page.'
    }

    const shouldShowRetry = (error: typeof latestError) => {
      const message = error.message.toLowerCase()
      return message.includes('network') || 
             message.includes('server') || 
             message.includes('timeout') ||
             message.includes('fetch') ||
             message.includes('connection')
    }

    const title = getErrorTitle(latestError)
    const message = getErrorMessage(latestError)
    const showRetry = shouldShowRetry(latestError)

    // Show error toast with retry option if applicable
    currentToast.showError(title, message, showRetry ? {
      label: 'Retry',
      onClick: () => {
        // Clear the error and provide feedback
        currentErrorContext.clearError(errorId)
        currentToast.showInfo('Retrying...', 'Please try your action again.')
      }
    } : undefined)

    // Auto-clear non-critical errors after showing toast
    const isCriticalError = latestError.message.toLowerCase().includes('server') ||
                           latestError.message.toLowerCase().includes('permission')
    
    if (!isCriticalError) {
      setTimeout(() => {
        currentErrorContext.clearError(errorId)
        processedErrorsRef.current.delete(errorId)
      }, 5000)
    }

  }, [errorContext?.errors.length]) // Only depend on the error count

  return {
    hasActiveErrors: errorContext?.hasErrors || false,
    errorCount: errorContext?.errors.length || 0,
    isGlobalError: errorContext?.isGlobalError || false
  }
}