import { Logo } from './Logo'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const logoSize = size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'md'
  
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="coffee-loading">
        <Logo 
          size={logoSize}
          alt=""
          className="opacity-60"
        />
      </div>
      {message && (
        <p className="text-coffee-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
  isVisible: boolean
}

export function LoadingOverlay({ 
  message = 'Loading...', 
  isVisible 
}: LoadingOverlayProps) {
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 bg-coffee-900/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-coffee-lg p-8 max-w-sm mx-4">
        <LoadingSpinner message={message} size="lg" />
      </div>
    </div>
  )
}

interface InlineLoadingProps {
  message?: string
  className?: string
}

export function InlineLoading({ 
  message = 'Loading...', 
  className = '' 
}: InlineLoadingProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="coffee-loading">
        <Logo 
          size="xs"
          alt=""
          className="opacity-60"
        />
      </div>
      <span className="text-coffee-600 text-sm">
        {message}
      </span>
    </div>
  )
}