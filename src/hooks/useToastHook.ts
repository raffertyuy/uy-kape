import React from 'react'
import type { ToastData } from '@/components/ui/Toast'

// Toast context type definition
export interface ToastContextType {
  showToast: (_toast: Omit<ToastData, 'id'>) => void
  showSuccess: (_title: string, _message: string, _action?: ToastData['action']) => void
  showError: (_title: string, _message: string, _action?: ToastData['action']) => void
  showWarning: (_title: string, _message: string, _action?: ToastData['action']) => void
  showInfo: (_title: string, _message: string, _action?: ToastData['action']) => void
  dismissToast: (_id: string) => void
  clearAllToasts: () => void
}

// Toast context
export const ToastContext = React.createContext<ToastContextType | null>(null)

// useToast hook
export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}