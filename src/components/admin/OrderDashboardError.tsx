import React from 'react'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

export interface OrderDashboardErrorProps {
  /**
   * The error that occurred
   */
  error: Error | null
  /**
   * Function to retry the failed operation
   */
  onRetry: () => void
  /**
   * Whether the system is currently retrying
   */
  isRetrying?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Type of error for customized messaging
   */
  errorType?: 'network' | 'database' | 'permission' | 'unknown'
}

interface ErrorConfig {
  icon: React.ElementType
  title: string
  message: string
  actionText: string
  severity: 'error' | 'warning'
}

/**
 * Error boundary component for the Order Dashboard
 * Provides user-friendly error messages and retry functionality
 */
export default function OrderDashboardError({
  error,
  onRetry,
  isRetrying = false,
  className = '',
  errorType = 'unknown'
}: OrderDashboardErrorProps) {
  // Determine error configuration based on type and error message
  const getErrorConfig = (): ErrorConfig => {
    const errorMessage = error?.message?.toLowerCase() || ''
    
    // Network connectivity issues
    if (errorType === 'network' || errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        icon: WifiOff,
        title: 'Connection Problem',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        actionText: 'Retry Connection',
        severity: 'error'
      }
    }
    
    // Database/Supabase issues
    if (errorType === 'database' || errorMessage.includes('database') || errorMessage.includes('supabase')) {
      return {
        icon: AlertTriangle,
        title: 'Database Error',
        message: 'There was a problem accessing the order data. The issue has been logged and we\'re working to fix it.',
        actionText: 'Retry',
        severity: 'error'
      }
    }
    
    // Permission issues
    if (errorType === 'permission' || errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return {
        icon: AlertTriangle,
        title: 'Access Denied',
        message: 'You don\'t have permission to access this feature. Please contact your administrator.',
        actionText: 'Retry',
        severity: 'warning'
      }
    }
    
    // Generic error
    return {
      icon: AlertTriangle,
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred while loading the order dashboard. Please try again.',
      actionText: 'Retry',
      severity: 'error'
    }
  }
  
  const config = getErrorConfig()
  const IconComponent = config.icon
  
  const severityStyles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800'
  }
  
  const buttonStyles = {
    error: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
  }
  
  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className={`
        border rounded-lg p-8 text-center 
        ${severityStyles[config.severity]}
      `}>
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <IconComponent className="h-12 w-12" />
        </div>
        
        {/* Error Title */}
        <h3 className="text-lg font-semibold mb-2">
          {config.title}
        </h3>
        
        {/* Error Message */}
        <p className="mb-6 opacity-90">
          {config.message}
        </p>
        
        {/* Error Details (in development) */}
        {import.meta.env.VITE_IS_DEV === 'true' && error && (
          <pre className="mt-2 text-xs text-red-200" aria-label="error-details">
            {error.stack || error.message}
          </pre>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className={`
              px-6 py-2 rounded-md text-white font-medium 
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${buttonStyles[config.severity]}
            `}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="inline h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="inline h-4 w-4 mr-2" />
                {config.actionText}
              </>
            )}
          </button>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center text-sm opacity-75">
            {typeof window !== 'undefined' && window.navigator.onLine ? (
              <>
                <Wifi className="h-4 w-4 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 mr-1" />
                Offline
              </>
            )}
          </div>
        </div>
        
        {/* Additional Help */}
        <div className="mt-6 pt-4 border-t border-current border-opacity-20">
          <p className="text-sm opacity-75">
            If the problem persists, please contact support or try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * React Error Boundary component for catching JavaScript errors
 * in the Order Dashboard component tree
 */
interface OrderDashboardErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface OrderDashboardErrorBoundaryProps {
  children: React.ReactNode
  onError?: (_error: Error, _errorInfo: React.ErrorInfo) => void
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class OrderDashboardErrorBoundary extends React.Component<
  OrderDashboardErrorBoundaryProps,
  OrderDashboardErrorBoundaryState
> {
  constructor(props: OrderDashboardErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }
  
  static getDerivedStateFromError(error: Error): Partial<OrderDashboardErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error
    })
    
    // Log error to console in development
    if (import.meta.env.VITE_IS_DEV === 'true') {
      console.error('Order dashboard error:', {
        error,
        errorInfo,
        componentStack: errorInfo.componentStack
      })
    }
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }
  
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    })
  }
  
  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }
      
      // Default error UI
      return (
        <OrderDashboardError
          error={this.state.error}
          onRetry={this.handleRetry}
          errorType="unknown"
          className="p-8"
        />
      )
    }
    
    return this.props.children
  }
}
