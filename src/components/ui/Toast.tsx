import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastItemProps {
  toast: ToastData
  onDismiss: (_id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300) // Animation duration
  }, [toast.id, onDismiss])

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration, handleDismiss])

  const getToastStyles = () => {
    const baseStyles = "rounded-lg shadow-lg border p-4 max-w-sm w-full transition-all duration-300 transform"
    const positionStyles = isVisible && !isExiting 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0"

    switch (toast.type) {
      case 'success':
        return `${baseStyles} ${positionStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} ${positionStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} ${positionStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      case 'info':
        return `${baseStyles} ${positionStyles} bg-blue-50 border-blue-200 text-blue-800`
      default:
        return `${baseStyles} ${positionStyles} bg-gray-50 border-gray-200 text-gray-800`
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 text-lg">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-1">
            {toast.title}
          </div>
          <div className="text-sm opacity-90">
            {toast.message}
          </div>
          
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-3 text-lg opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (_id: string) => void
  onClearAll?: () => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss, onClearAll }) => {
  // Create portal to render toasts at the top level
  const toastRoot = document.getElementById('toast-root') || document.body

  // Check if there's a global error banner by looking for the fixed top element
  const hasGlobalErrorBanner = document.querySelector('.fixed.top-0.left-0.right-0.z-50') !== null
  const topPosition = hasGlobalErrorBanner ? 'top-20' : 'top-4' // Adjust for banner height

  return createPortal(
    <div 
      className={`fixed ${topPosition} right-4 z-40 space-y-2`} // z-40 to be below banner (z-50)
      aria-live="polite"
      aria-label="Notifications"
    >
      {/* Show clear all button when there are 2+ toasts */}
      {toasts.length >= 2 && onClearAll && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClearAll}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
      
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>,
    toastRoot
  )
}