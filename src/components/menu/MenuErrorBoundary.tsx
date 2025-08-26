import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error | undefined
  errorInfo?: ErrorInfo | undefined
}

export class MenuErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Menu Error Boundary caught an error:', error, errorInfo)
    
    // Log error to external service in production
    if (import.meta.env.VITE_IS_PROD === 'true') {
      // Example: logErrorToService(error, errorInfo)
    }
    
    this.setState({
      error,
      errorInfo
    })
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    })
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong with the menu system
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              An unexpected error occurred while loading the menu management interface. 
              Please try refreshing the page or contact support if the problem persists.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-coffee-600 text-white px-4 py-2 rounded-md hover:bg-coffee-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {import.meta.env.VITE_IS_DEV === 'true' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border overflow-auto max-h-32" aria-label="error-details">
                  {this.state.error.stack || this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border overflow-auto max-h-32" aria-label="error-info">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}