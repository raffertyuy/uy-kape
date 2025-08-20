import { useCallback } from 'react'
import { useErrorHandling, useFormErrorHandling } from './useErrorHandling'
import { useToast } from './useToastHook'

/**
 * Enhanced error handling hook that integrates with toast notifications
 * Provides user-friendly error messages with proper categorization
 */
export const useEnhancedErrorHandling = () => {
  const errorHandling = useErrorHandling()
  const toast = useToast()

  const setErrorWithToast = useCallback((error: any, action?: string) => {
    errorHandling.setError(error, action)
    
    if (errorHandling.error) {
      toast.showError('Error', errorHandling.error.message, {
        label: 'Retry',
        onClick: () => {
          // This would trigger a retry if a retry function was provided
          errorHandling.clearError()
        }
      })
    }
  }, [errorHandling, toast])

  const handleAsyncOperationWithToast = useCallback(async <T>(
    operation: () => Promise<T>,
    action?: string,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      errorHandling.clearError()
      const result = await operation()
      
      if (result && successMessage) {
        toast.showSuccess('Success', successMessage)
      }
      
      return result
    } catch (error) {
      setErrorWithToast(error, action)
      return null
    }
  }, [errorHandling, toast, setErrorWithToast])

  const retryWithToast = useCallback(async (retryFn: () => Promise<any>, actionName = 'operation') => {
    try {
      await errorHandling.retry(retryFn)
      toast.showSuccess('Success', `${actionName} completed successfully`)
    } catch (error) {
      // Error is already handled by the retry function
      // Just show a toast for the retry failure
      toast.showError('Retry Failed', `Failed to retry ${actionName}. Please try again.`)
    }
  }, [errorHandling, toast])

  return {
    ...errorHandling,
    setErrorWithToast,
    handleAsyncOperationWithToast,
    retryWithToast,
    toast
  }
}

/**
 * Enhanced form error handling with toast integration
 */
export const useEnhancedFormErrorHandling = () => {
  const formErrorHandling = useFormErrorHandling()
  const toast = useToast()

  const handleValidationErrorWithToast = useCallback((fieldErrors: Record<string, string>) => {
    formErrorHandling.handleValidationError(fieldErrors)
    
    const firstError = Object.values(fieldErrors)[0]
    toast.showError('Validation Error', firstError)
  }, [formErrorHandling, toast])

  const handleSubmissionErrorWithToast = useCallback((error: any) => {
    formErrorHandling.handleSubmissionError(error)
    
    const errorMessage = error?.message || 'Failed to submit form. Please try again.'
    toast.showError('Submission Failed', errorMessage)
  }, [formErrorHandling, toast])

  const handleSubmissionSuccessWithToast = useCallback((message: string) => {
    formErrorHandling.clearError()
    toast.showSuccess('Success', message)
  }, [formErrorHandling, toast])

  return {
    ...formErrorHandling,
    handleValidationErrorWithToast,
    handleSubmissionErrorWithToast,
    handleSubmissionSuccessWithToast,
    toast
  }
}

/**
 * Menu-specific error handling with enhanced user feedback
 */
export const useMenuErrorHandling = () => {
  const enhancedErrorHandling = useEnhancedErrorHandling()

  const handleMenuOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    itemName?: string
  ): Promise<T | null> => {
    const successMessage = itemName 
      ? `${operationName} ${itemName} successfully`
      : `${operationName} completed successfully`

    return enhancedErrorHandling.handleAsyncOperationWithToast(
      operation,
      operationName.toLowerCase().replace(' ', '_'),
      successMessage
    )
  }, [enhancedErrorHandling])

  const handleMenuValidation = useCallback((validationErrors: Record<string, string>) => {
    if (Object.keys(validationErrors).length > 0) {
      const firstFieldError = Object.entries(validationErrors)[0]
      const fieldName = firstFieldError[0]
      const errorMessage = firstFieldError[1]
      
      enhancedErrorHandling.toast.showError(
        'Validation Error',
        `${fieldName}: ${errorMessage}`
      )
      return false
    }
    return true
  }, [enhancedErrorHandling.toast])

  return {
    ...enhancedErrorHandling,
    handleMenuOperation,
    handleMenuValidation
  }
}