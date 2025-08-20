import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Logo } from './Logo'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error | undefined
  onRetry?: () => void
}

function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

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
            Oops! Something went wrong
          </h2>
          <p className="text-coffee-600 mb-4">
            Don't worry, even the best coffee machines need a restart sometimes.
          </p>
          
          {error && process.env.NODE_ENV === 'development' && (
            <div className="bg-coffee-100 border border-coffee-200 rounded-lg p-3 mb-4 text-left">
              <p className="text-xs text-coffee-700 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            🔄 Try Again
          </button>
          
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