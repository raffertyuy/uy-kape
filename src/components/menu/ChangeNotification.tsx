import React, { useState, useEffect } from 'react'
import type { MenuChange } from '@/hooks/useMenuSubscriptions'

interface ChangeNotificationProps {
  changes: MenuChange[]
  onClearChanges: () => void
  className?: string
}

export const ChangeNotification: React.FC<ChangeNotificationProps> = ({
  changes,
  onClearChanges,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [recentChange, setRecentChange] = useState<MenuChange | null>(null)

  // Show notification when new changes arrive
  useEffect(() => {
    if (changes.length > 0) {
      const latestChange = changes[0]
      setRecentChange(latestChange)
      setIsVisible(true)
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [changes])

  const getChangeIcon = (event: string) => {
    switch (event) {
      case 'INSERT':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        )
      case 'UPDATE':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        )
      case 'DELETE':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getTableDisplayName = (table: string) => {
    switch (table) {
      case 'drink_categories':
        return 'Drink Category'
      case 'drinks':
        return 'Drink'
      case 'option_categories':
        return 'Option Category'
      case 'option_values':
        return 'Option Value'
      case 'drink_options':
        return 'Drink Option'
      default:
        return table.replace('_', ' ')
    }
  }

  const getChangeMessage = (change: MenuChange) => {
    const tableName = getTableDisplayName(change.table)
    const itemName = change.data?.name || change.data?.id || 'Item'
    
    switch (change.event) {
      case 'INSERT':
        return `New ${tableName.toLowerCase()} "${itemName}" was added`
      case 'UPDATE':
        return `${tableName} "${itemName}" was updated`
      case 'DELETE':
        return `${tableName} "${itemName}" was deleted`
      default:
        return `${tableName} "${itemName}" was changed`
    }
  }

  if (!isVisible || !recentChange) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {getChangeIcon(recentChange.event)}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Menu Updated
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {getChangeMessage(recentChange)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {recentChange.timestamp.toLocaleTimeString()}
            </p>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {changes.length > 1 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={onClearChanges}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              View all {changes.length} recent changes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}