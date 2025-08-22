import React, { useContext } from 'react'
import { AlertTriangle, RefreshCw, X, WifiOff } from 'lucide-react'
import { ErrorContext } from '../../contexts/ErrorContextTypes'
import type { ErrorDetails } from '../../hooks/useErrorHandling'

/**
 * Global error notification component that shows persistent error banners
 * for critical errors that require user attention
 */
export const GlobalErrorNotification: React.FC = () => {
  const errorContext = useContext(ErrorContext)

  if (!errorContext || !errorContext.hasErrors) {
    return null
  }

  const latestError = errorContext.getLatestError()
  if (!latestError) {
    return null
  }

  // Only show persistent notifications for critical errors
  const isCriticalError = errorContext.isGlobalError ||
                         latestError.message.toLowerCase().includes('server') ||
                         latestError.message.toLowerCase().includes('database') ||
                         latestError.message.toLowerCase().includes('offline')

  if (!isCriticalError) {
    return null
  }

  const getErrorIcon = () => {
    const message = latestError.message.toLowerCase()
    if (message.includes('network') || message.includes('offline') || message.includes('connection')) {
      return <WifiOff className="h-5 w-5" />
    }
    return <AlertTriangle className="h-5 w-5" />
  }

  const getErrorType = () => {
    const message = latestError.message.toLowerCase()
    if (message.includes('network') || message.includes('offline')) {
      return 'network'
    }
    if (message.includes('server') || message.includes('database')) {
      return 'server'
    }
    return 'general'
  }

  const getErrorStyles = () => {
    const type = getErrorType()
    switch (type) {
      case 'network':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'server':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  const getErrorTitle = () => {
    const type = getErrorType()
    switch (type) {
      case 'network':
        return 'Connection Issue'
      case 'server':
        return 'Service Unavailable'
      default:
        return 'System Alert'
    }
  }

  const getErrorMessage = () => {
    const message = latestError.message.toLowerCase()
    
    if (message.includes('offline') || message.includes('network')) {
      return 'You appear to be offline. Some features may not work properly.'
    }
    if (message.includes('server') || message.includes('database')) {
      return 'Our services are experiencing issues. We\'re working to resolve this quickly.'
    }
    
    // Return a user-friendly version of the error
    if (latestError.message.length < 100) {
      return latestError.message
    }
    
    return 'We\'re experiencing technical difficulties. Please try again or contact support if the problem persists.'
  }

  const handleRetry = () => {
    // Clear the current error
    errorContext.clearError((latestError as ErrorDetails & { id: string }).id)
    
    // Trigger a page refresh for server errors, or just clear for network errors
    if (getErrorType() === 'server') {
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    errorContext.clearError((latestError as ErrorDetails & { id: string }).id)
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 border-b ${getErrorStyles()}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getErrorIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium">
                {getErrorTitle()}
              </h3>
              <p className="text-sm opacity-90 mt-1">
                {getErrorMessage()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(getErrorType() === 'network' || getErrorType() === 'server') && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                title={getErrorType() === 'server' ? 'Refresh page' : 'Retry connection'}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {getErrorType() === 'server' ? 'Refresh' : 'Retry'}
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center w-6 h-6 text-sm rounded-md bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              title="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalErrorNotification