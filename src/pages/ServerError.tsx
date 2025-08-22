import { Logo } from '../components/ui/Logo'

interface ServerErrorProps {
  errorCode?: number
  message?: string
  retryAction?: () => void
  // Optional debug details for development builds
  debugStack?: string
  debugMessage?: string
}

export default function ServerError({ 
  errorCode = 500, 
  message, 
  retryAction,
  debugStack,
  debugMessage
}: ServerErrorProps) {
  const defaultMessages: Record<number, string> = {
    500: 'Our coffee servers are having trouble brewing right now.',
    502: 'We\'re having trouble connecting to our coffee database.',
    503: 'Our cafe is temporarily closed for maintenance.',
    504: 'Our coffee servers are taking too long to respond.'
  }

  const displayMessage = message || defaultMessages[errorCode] || 'Something went wrong with our coffee servers.'
  
  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleRetry = () => {
    if (retryAction) {
      retryAction()
    } else {
      window.location.reload()
    }
  }

  const getErrorIcon = (code: number) => {
    switch (Math.floor(code / 100)) {
      case 5:
        return '☕💥' // Server error
      default:
        return '⚠️'
    }
  }

  const getErrorTitle = (code: number) => {
    switch (code) {
      case 500:
        return 'Coffee Machine Malfunction'
      case 502:
        return 'Coffee Connection Lost'
      case 503:
        return 'Cafe Temporarily Closed'
      case 504:
        return 'Coffee Taking Too Long'
      default:
        return 'Coffee Server Error'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-coffee-lg p-8 text-center">
        {/* Logo Section */}
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
        
        {/* Error Display */}
        <div className="mb-8">
          <div className="text-6xl mb-4">
            {getErrorIcon(errorCode)}
          </div>
          
          <div className="mb-4">
            <h2 className="text-xl font-bold text-coffee-800 mb-2">
              {getErrorTitle(errorCode)}
            </h2>
            <div className="text-coffee-400 text-sm font-mono mb-2">
              Error {errorCode}
            </div>
          </div>
          
          <p className="text-coffee-600 mb-4">
            {displayMessage}
          </p>
          
          <div className="bg-coffee-50 border border-coffee-200 rounded-lg p-4 mb-4">
            <p className="text-coffee-700 text-sm">
              🔧 <strong>What this means:</strong> Our backend services are experiencing issues. 
              This is usually temporary and should resolve automatically.
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            🔄 Try Again
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-coffee-200 hover:bg-coffee-300 text-coffee-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            🏠 Go Home
          </button>
        </div>
        
        {/* Help Text */}
        <div className="mt-6 text-sm text-coffee-500">
          <p>
            If this problem keeps happening, please try refreshing in a few minutes 
            or contact our support team.
          </p>
        </div>
        
        {/* Development Info */}
        {import.meta.env.VITE_IS_DEV === 'true' && (debugStack || debugMessage) && (
          <pre className="mt-4 text-sm bg-red-50 border border-red-200 p-3 rounded text-red-700">
            {String(debugStack || debugMessage)}
          </pre>
        )}
      </div>
    </div>
  )
}