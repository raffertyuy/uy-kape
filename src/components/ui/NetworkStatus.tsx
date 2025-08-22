import { useNetworkStatus } from '../../hooks/useNetworkStatus'

interface NetworkStatusProps {
  className?: string
  showDetailedInfo?: boolean
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  className = '', 
  showDetailedInfo = false 
}) => {
  const { isOnline, connectionType, effectiveType, lastConnected } = useNetworkStatus()

  // Don't show anything if we're online with a good connection
  if (isOnline && connectionType === 'fast') {
    return null
  }

  const getStatusIcon = () => {
    if (!isOnline) return '📴'
    if (connectionType === 'slow') return '🐌'
    return '📶'
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (connectionType === 'slow') return 'Slow Connection'
    return 'Connected'
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-100 text-red-800 border-red-200'
    if (connectionType === 'slow') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const formatLastConnected = () => {
    if (!lastConnected) return 'Never'
    const now = new Date()
    const diff = now.getTime() - lastConnected.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes === 0) return 'Just now'
    if (minutes === 1) return '1 minute ago'
    if (minutes < 60) return `${minutes} minutes ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return '1 hour ago'
    if (hours < 24) return `${hours} hours ago`
    
    return 'More than a day ago'
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()} ${className}`}>
      <span className="text-sm">{getStatusIcon()}</span>
      <span className="text-sm font-medium">{getStatusText()}</span>
      
      {showDetailedInfo && (
        <div className="flex items-center gap-2 text-xs opacity-75">
          {effectiveType && effectiveType !== 'unknown' && (
            <span className="uppercase">{effectiveType}</span>
          )}
          {!isOnline && lastConnected && (
            <span>Last: {formatLastConnected()}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Minimal version for status bars
export const NetworkStatusIndicator: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const { isOnline, connectionType } = useNetworkStatus()

  if (isOnline && connectionType === 'fast') {
    return null
  }

  const getIndicatorColor = () => {
    if (!isOnline) return 'bg-red-500'
    if (connectionType === 'slow') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div 
      className={`w-2 h-2 rounded-full ${getIndicatorColor()} ${className}`}
      title={isOnline ? `${connectionType} connection` : 'Offline'}
    />
  )
}

// Toast-style notification for network changes
export const NetworkStatusToast: React.FC = () => {
  const { isOnline, connectionType } = useNetworkStatus()

  // Only show when there are connection issues
  if (isOnline && connectionType === 'fast') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`
        rounded-lg border p-4 shadow-lg 
        ${!isOnline 
          ? 'bg-red-100 text-red-800 border-red-200' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      `}>
        <div className="flex items-center gap-3">
          <span className="text-lg">
            {!isOnline ? '📴' : '🐌'}
          </span>
          <div className="flex-1">
            <h4 className="font-medium">
              {!isOnline ? 'You\'re offline' : 'Slow connection detected'}
            </h4>
            <p className="text-sm opacity-90">
              {!isOnline 
                ? 'Some features may not work until you reconnect.'
                : 'Some features may load slowly.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}