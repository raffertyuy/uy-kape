import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Logo } from './Logo'
import { handleGlobalError, getRecoveryStrategy, categorizeError } from '../../utils/globalErrorHandler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error | undefined
  errorInfo?: ErrorInfo | undefined
  retryCount: number
  canRetry: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryTimeouts: number[] = []

  public state: State = {
    hasError: false,
    retryCount: 0,
    canRetry: true
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const category = categorizeError(error)
    const canRetry = category === 'network' || category === 'unknown'
    
    return { 
      hasError: true, 
      error,
      canRetry
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Report error to global error handler
    const errorDetails = handleGlobalError(error, 'error_boundary')
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log comprehensive error information
    // eslint-disable-next-line no-console
    console.error('Error Boundary caught an error:', {
      error,
      errorInfo,
      errorDetails,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary'
    })

    // Auto-retry for network errors with exponential backoff
    const category = categorizeError(error)
    if (category === 'network' && this.state.retryCount < this.maxRetries) {
      const delay = Math.pow(2, this.state.retryCount) * 1000 // Exponential backoff
      const timeout = window.setTimeout(() => {
        this.handleRetry()
      }, delay)
      
      this.retryTimeouts.push(timeout)
    }
  }

  public componentWillUnmount() {
    // Clean up any pending retry timeouts
    this.retryTimeouts.forEach(timeout => window.clearTimeout(timeout))
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      this.setState({ canRetry: false })
      return
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }))
  }

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
      canRetry: true
    })
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <DefaultErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          onRetry={this.state.canRetry ? this.handleManualRetry : undefined}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error | undefined
  errorInfo?: ErrorInfo | undefined
  onRetry?: (() => void) | undefined
  retryCount?: number
  maxRetries?: number
}

function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  onRetry, 
  retryCount = 0, 
  maxRetries = 3 
}: ErrorFallbackProps) {
  const category = error ? categorizeError(error) : 'unknown'
  const recovery = error ? getRecoveryStrategy(category, error) : null

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const getErrorTitle = () => {
    switch (category) {
      case 'network':
        return 'Connection Problem'
      case 'permission':
        return 'Access Denied'
      case 'validation':
        return 'Data Error'
      default:
        return 'Something went wrong'
    }
  }

  const getErrorDescription = () => {
    if (recovery?.message) {
      return recovery.message
    }

    switch (category) {
      case 'network':
        return 'We\'re having trouble connecting to our coffee servers. Please check your internet connection.'
      case 'permission':
        return 'You don\'t have permission to access this feature. Please contact support.'
      default:
        return 'Don\'t worry, even the best coffee machines need a restart sometimes.'
    }
  }

  const showRetryInfo = retryCount > 0 && onRetry

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-coffee-lg p-8 text-center">
        <div className="mb-6">
          <Logo 
            size="lg" 
            className="mx-auto opacity-60 mb-4" 
            alt="Uy, Kape!"
          />
          <h1 className="text-2xl font-bold text-coffee-800">
            Uy, Kape!
          </h1>
        </div>
        
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-coffee-800 mb-2">
            {getErrorTitle()}
          </h2>
          <p className="text-coffee-600 mb-4">
            {getErrorDescription()}
          </p>
          
          {showRetryInfo && (
            <div className="bg-coffee-100 border border-coffee-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-coffee-700">
                Attempted {retryCount} of {maxRetries} retries
              </p>
            </div>
          )}

          {error && process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                🔍 Developer Info
              </summary>
              <div className="mt-2 text-xs text-gray-600 font-mono">
                <p><strong>Error:</strong> {error.message}</p>
                <p><strong>Category:</strong> {category}</p>
                {error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                )}
                {errorInfo?.componentStack && (
                  <div className="mt-2">
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={handleRetry}
              className="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              🔄 Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-coffee-200 hover:bg-coffee-300 text-coffee-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            🏠 Go Home
          </button>
        </div>
        
        <div className="mt-6 text-sm text-coffee-500">
          <p>If this problem persists, please refresh the page or contact support.</p>
        </div>
      </div>
    </div>
  )
}

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="text-red-500 text-xl">⚠️</div>
        </div>
        <div className="flex-1">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface NetworkErrorProps {
  onRetry?: () => void
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <div className="text-center py-8">
      <Logo size="md" className="mx-auto opacity-60 mb-4" alt="" />
      <h3 className="text-lg font-semibold text-coffee-800 mb-2">
        Connection Problem
      </h3>
      <p className="text-coffee-600 mb-4">
        Unable to connect to our coffee servers. Please check your internet connection.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="coffee-button-primary"
        >
          🔄 Retry Connection
        </button>
      )}
    </div>
  )
}