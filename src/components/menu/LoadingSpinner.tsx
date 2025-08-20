import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  className?: string
  centered?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...',
  className = '',
  centered = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const borderClasses = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3',
    xl: 'border-4'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const spinnerElement = (
    <div className="flex items-center space-x-3">
      <div
        className={`
          ${sizeClasses[size]} 
          ${borderClasses[size]} 
          border-coffee-200 
          border-t-coffee-600 
          rounded-full 
          animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <span className={`text-coffee-600 ${textSizeClasses[size]} font-medium`}>
          {message}
        </span>
      )}
    </div>
  )

  if (centered) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        {spinnerElement}
      </div>
    )
  }

  return (
    <div className={className}>
      {spinnerElement}
    </div>
  )
}

// Specialized loading components for common use cases
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading page...' }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" message={message} />
  </div>
)

export const CardLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <LoadingSpinner size="md" message={message} />
  </div>
)

export const TableLoader: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    ))}
  </div>
)

export const FormLoader: React.FC = () => (
  <div className="space-y-4">
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-10 bg-gray-200 rounded w-full" />
    </div>
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-24 bg-gray-200 rounded w-full" />
    </div>
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/5" />
      <div className="h-10 bg-gray-200 rounded w-full" />
    </div>
  </div>
)

// Button loading state
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
    role="status"
    aria-label="Loading"
  />
)