import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { handleGlobalError } from '../utils/globalErrorHandler'
import { telemetryLogger, telemetryHelpers } from '../utils/telemetryLogger'
import { isTelemetryEnabled } from '../config/telemetryConfig'
import type { ErrorDetails } from '../hooks/useErrorHandling'
import { ErrorContext, type ErrorContextState, type ErrorWithId } from './ErrorContextTypes'

interface ErrorContextProviderProps {
  children: React.ReactNode
  maxErrors?: number
}

export const ErrorContextProvider: React.FC<ErrorContextProviderProps> = ({
  children,
  maxErrors = 5
}) => {
  const [errors, setErrors] = useState<ErrorWithId[]>([])

  // Track errors.length via ref so addError doesn't need it as a dependency.
  // The telemetry count being slightly stale is acceptable for non-critical diagnostics.
  const errorsLengthRef = useRef(errors.length)
  useEffect(() => { errorsLengthRef.current = errors.length }, [errors.length])

  const addError = useCallback((error: unknown, context?: string) => {
    const errorDetails = handleGlobalError(error, context)

    // Add a unique ID to the error for tracking
    const errorWithId: ErrorWithId = {
      ...errorDetails,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Log error frequency and patterns to telemetry if enabled (optional)
    if (isTelemetryEnabled()) {
      try {
        telemetryHelpers.logError(
          error instanceof Error ? error : new Error(error?.toString() || 'Unknown error'),
          {
            errorId: errorWithId.id,
            contextName: context,
            errorCategory: 'user-reported',
            totalActiveErrors: errorsLengthRef.current + 1,
            handledBy: 'ErrorContext',
          }
        );
      } catch (telemetryError) {
        // Telemetry logging should never affect error handling
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("Failed to log error context to telemetry:", telemetryError);
        }
      }
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

  // Memoize global error check — only recompute when errors array changes
  const isGlobalError = useMemo(() => errors.some(error => {
    const message = error.message.toLowerCase()
    return message.includes('server') ||
           message.includes('network') ||
           message.includes('offline') ||
           error.code?.includes('5') // 5xx server errors
  }), [errors])

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

  // Track error patterns and metrics in telemetry if enabled (optional)
  useEffect(() => {
    if (!isTelemetryEnabled() || errors.length === 0) return

    try {
      // Log error metrics summary periodically
      const errorMetrics = telemetryLogger.getCategoryMetrics('errors');
      const recentErrors = errors.filter(error =>
        Date.now() - error.timestamp.getTime() < 60000 // Last minute
      );

      if (recentErrors.length > 0) {
        telemetryLogger.logEvent({
          type: 'error',
          data: {
            name: 'ErrorContext.ErrorTrends',
            message: `${recentErrors.length} active errors, ${errorMetrics.length} total tracked`,
            timestamp: Date.now(),
            url: globalThis.location?.href || '',
            userAgent: globalThis.navigator?.userAgent || '',
            context: {
              activeErrors: errors.length,
              recentErrorsLastMinute: recentErrors.length,
              hasGlobalError: isGlobalError,
              errorTypes: errors.map(e => e.code).filter(Boolean),
            }
          }
        });
      }
    } catch (telemetryError) {
      // Telemetry logging should never affect error handling
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to log error trends to telemetry:", telemetryError);
      }
    }
  }, [errors, isGlobalError])

  const hasErrors = errors.length > 0

  const contextValue = useMemo<ErrorContextState>(() => ({
    errors,
    isGlobalError,
    addError,
    clearError,
    clearAllErrors,
    getLatestError,
    hasErrors,
  }), [errors, isGlobalError, addError, clearError, clearAllErrors, getLatestError, hasErrors])

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  )
}