import React from 'react'
import type { EnhancedConnectionStatus } from '@/hooks/useMenuSubscriptions'

interface RealtimeIndicatorProps {
  connectionStatus: EnhancedConnectionStatus
  onReconnect?: () => void
  className?: string
  showDetails?: boolean
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  connectionStatus,
  onReconnect,
  className = '',
  showDetails = false
}) => {
  const { lastUpdate, error, status, retryCount, latency, quality } = connectionStatus

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return quality === 'excellent' ? 'text-green-500' : 
               quality === 'good' ? 'text-yellow-500' : 'text-orange-500'
      case 'connecting':
      case 'reconnecting':
        return 'text-blue-500'
      case 'error':
      case 'disconnected':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return showDetails ? `Live (${quality})` : 'Live'
      case 'connecting':
        return 'Connecting...'
      case 'reconnecting':
        return `Reconnecting... (${retryCount})`
      case 'error':
        return 'Connection Error'
      case 'disconnected':
        return 'Disconnected'
      default:
        return 'Unknown'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'error':
      case 'disconnected':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      
      case 'connected':
        return (
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${
              quality === 'excellent' ? 'bg-green-500' :
              quality === 'good' ? 'bg-yellow-500' : 'bg-orange-500'
            }`} />
            <div className={`absolute top-0 left-0 w-3 h-3 rounded-full animate-ping ${
              quality === 'excellent' ? 'bg-green-500' :
              quality === 'good' ? 'bg-yellow-500' : 'bg-orange-500'
            }`} />
          </div>
        )
      
      case 'connecting':
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )
      
      case 'reconnecting':
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
        )
      
      default:
        return (
          <div className="w-3 h-3 bg-gray-500 rounded-full" />
        )
    }
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

  const formatLatency = (latency: number | null) => {
    if (latency === null) return null
    return `${Math.round(latency)}ms`
  }

  const canReconnect = status === 'error' || status === 'disconnected'

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`} data-testid="realtime-indicator">
      <div className="flex items-center gap-1">
        {getStatusIcon()}
        <span className={getStatusColor()}>
          {getStatusText()}
        </span>
      </div>
      
      {showDetails && latency !== null && status === 'connected' && (
        <span className="text-gray-500 text-xs">
          {formatLatency(latency)}
        </span>
      )}
      
      {lastUpdate && status === 'connected' && (
        <span className="text-gray-500 text-xs">
          Last update: {formatLastUpdate(lastUpdate)}
        </span>
      )}
      
      {error && (
        <span className="text-red-500 text-xs truncate max-w-32" title={error}>
          {error}
        </span>
      )}

      {canReconnect && onReconnect && (
        <button
          onClick={onReconnect}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          title="Manually reconnect to real-time updates"
        >
          Reconnect
        </button>
      )}
      
      {status === 'reconnecting' && retryCount > 0 && (
        <span className="text-blue-500 text-xs">
          Attempt {retryCount}
        </span>
      )}
    </div>
  )
}