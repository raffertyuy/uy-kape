import React, { useState, useCallback } from 'react'
import type { ToastData } from '@/components/ui/Toast'
import { ToastContainer } from '@/components/ui/Toast'
import { ToastContext, type ToastContextType } from './useToastHook'

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? 5000 // Default 5 seconds
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Limit number of toasts
      return updated.slice(0, maxToasts)
    })
  }, [maxToasts])

  const showSuccess = useCallback((title: string, message: string, action?: ToastData['action']) => {
    showToast({ 
      type: 'success', 
      title, 
      message, 
      ...(action && { action })
    })
  }, [showToast])

  const showError = useCallback((title: string, message: string, action?: ToastData['action']) => {
    showToast({ 
      type: 'error', 
      title, 
      message, 
      duration: 0, // Errors don't auto-dismiss
      ...(action && { action })
    })
  }, [showToast])

  const showWarning = useCallback((title: string, message: string, action?: ToastData['action']) => {
    showToast({ 
      type: 'warning', 
      title, 
      message, 
      ...(action && { action })
    })
  }, [showToast])

  const showInfo = useCallback((title: string, message: string, action?: ToastData['action']) => {
    showToast({ 
      type: 'info', 
      title, 
      message, 
      ...(action && { action })
    })
  }, [showToast])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
    clearAllToasts
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}