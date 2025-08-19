import React from 'react'
import type { ConnectionStatus } from '@/hooks/useMenuSubscriptions'

interface RealtimeIndicatorProps {
  connectionStatus: ConnectionStatus
  className?: string
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  connectionStatus,
  className = ''
}) => {
  const { connected, lastUpdate, error } = connectionStatus

  const getStatusColor = () => {
    if (error) return 'text-red-500'
    if (connected) return 'text-green-500'
    return 'text-yellow-500'
  }

  const getStatusText = () => {
    if (error) return 'Connection Error'
    if (connected) return 'Live'
    return 'Connecting...'
  }

  const getStatusIcon = () => {
    if (error) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    }
    
    if (connected) {
      return (
        <div className="relative">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
        </div>
      )
    }
    
    return (
      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
    )
  }

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'No updates'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else {
      return date.toLocaleTimeString()
    }
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        {getStatusIcon()}
        <span className={getStatusColor()}>
          {getStatusText()}
        </span>
      </div>
      
      {lastUpdate && !error && (
        <span className="text-gray-500 text-xs">
          Last update: {formatLastUpdate(lastUpdate)}
        </span>
      )}
      
      {error && (
        <span className="text-red-500 text-xs">
          {error}
        </span>
      )}
    </div>
  )
}