import React, { createContext, useState, useCallback, useEffect } from 'react'
import { handleGlobalError } from '../utils/globalErrorHandler'
import type { ErrorDetails } from '../hooks/useErrorHandling'

export interface ErrorContextState {
  errors: ErrorDetails[]
  isGlobalError: boolean
  addError: (_error: unknown, _context?: string) => void
  clearError: (_id: string) => void
  clearAllErrors: () => void
  getLatestError: () => ErrorDetails | null
  hasErrors: boolean
}

interface ErrorWithId extends ErrorDetails {
  id: string
}

export const ErrorContext = createContext<ErrorContextState | null>(null)

interface ErrorContextProviderProps {
  children: React.ReactNode
  maxErrors?: number
}

export const ErrorContextProvider: React.FC<ErrorContextProviderProps> = ({ 
  children, 
  maxErrors = 5 
}) => {
  const [errors, setErrors] = useState<ErrorWithId[]>([])

  const addError = useCallback((error: unknown, context?: string) => {
    const errorDetails = handleGlobalError(error, context)
    
    // Add a unique ID to the error for tracking
    const errorWithId: ErrorWithId = {
      ...errorDetails,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    setErrors(prevErrors => {
      const newErrors = [errorWithId, ...prevErrors]
      // Keep only the most recent errors
      return newErrors.slice(0, maxErrors)
    })
  }, [maxErrors])

  const clearError = useCallback((id: string) => {
    setErrors(prevErrors => prevErrors.filter(error => error.id !== id))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  const getLatestError = useCallback((): ErrorDetails | null => {
    return errors.length > 0 ? errors[0] : null
  }, [errors])

  // Determine if there's a global error that should affect the entire app
  const isGlobalError = errors.some(error => {
    const message = error.message.toLowerCase()
    return message.includes('server') || 
           message.includes('network') || 
           message.includes('offline') ||
           error.code?.includes('5') // 5xx server errors
  })

  // Auto-clear errors after a certain time (except server errors)
  useEffect(() => {
    if (errors.length === 0) return

    const timeouts = errors.map((error) => {
      const isServerError = error.message.toLowerCase().includes('server') || 
                           error.code?.includes('5')
      
      // Don't auto-clear server errors, let user dismiss them
      if (isServerError) return null

      return setTimeout(() => {
        clearError(error.id)
      }, 10000) // Clear after 10 seconds
    })

    return () => {
      timeouts.forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [errors, clearError])

  const contextValue: ErrorContextState = {
    errors,
    isGlobalError,
    addError,
    clearError,
    clearAllErrors,
    getLatestError,
    hasErrors: errors.length > 0
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  )
}