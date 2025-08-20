import React, { useState, useEffect } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface MenuNotificationsProps {
  notifications: Notification[]
  onDismiss: (_id: string) => void
  className?: string
}

export const MenuNotifications: React.FC<MenuNotificationsProps> = ({
  notifications,
  onDismiss,
  className = ''
}) => {
  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onDismiss: (_id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss(notification.id), 300) // Wait for animation
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.id, onDismiss])

  const getNotificationStyles = () => {
    const baseStyles = 'p-4 rounded-lg shadow-lg border-l-4 max-w-sm transition-all duration-300'
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-900`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-900`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-900`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-900`
      default:
        return `${baseStyles} bg-gray-50 border-gray-500 text-gray-900`
    }
  }

  const getIcon = () => {
    const iconStyles = 'w-5 h-5 flex-shrink-0'
    
    switch (notification.type) {
      case 'success':
        return (
          <svg className={`${iconStyles} text-green-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className={`${iconStyles} text-red-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className={`${iconStyles} text-yellow-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
        return (
          <svg className={`${iconStyles} text-blue-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`${getNotificationStyles()} opacity-100 translate-x-0`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm opacity-75 mt-1">
              {notification.message}
            </p>
          )}
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-sm font-medium underline hover:no-underline mt-2"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Hook for managing notifications
// eslint-disable-next-line react-refresh/only-export-components
export const useMenuNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000 // Default 5 seconds
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const dismissAll = () => {
    setNotifications([])
  }

  // Convenience methods for different notification types
  const showSuccess = (title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ 
      type: 'success', 
      title, 
      ...(message && { message }),
      ...(action && { action })
    })
  }

  const showError = (title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ 
      type: 'error', 
      title, 
      ...(message && { message }),
      ...(action && { action }),
      duration: 8000 
    })
  }

  const showWarning = (title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ 
      type: 'warning', 
      title, 
      ...(message && { message }),
      ...(action && { action }),
      duration: 6000 
    })
  }

  const showInfo = (title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ 
      type: 'info', 
      title, 
      ...(message && { message }),
      ...(action && { action })
    })
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}