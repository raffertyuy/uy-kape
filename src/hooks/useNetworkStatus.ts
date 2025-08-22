import { useState, useEffect } from 'react'
import { addNetworkEventListeners, getNetworkInfo, type NetworkInfo } from '../utils/networkUtils'

export const useNetworkStatus = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(() => getNetworkInfo())
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'offline'>('fast')

  useEffect(() => {
    const updateNetworkInfo = () => {
      const info = getNetworkInfo()
      setNetworkInfo(info)
      setConnectionQuality(info.connectionType)
    }

    // Update network info immediately
    updateNetworkInfo()

    // Set up event listeners for online/offline changes
    const cleanup = addNetworkEventListeners(
      () => {
        updateNetworkInfo()
      },
      () => {
        updateNetworkInfo()
      }
    )

    // Also listen to connection change events if available
    if (typeof window !== 'undefined' && window.navigator && 'connection' in window.navigator) {
      const connection = (window.navigator as any).connection
      if (connection) {
        const handleConnectionChange = () => updateNetworkInfo()
        connection.addEventListener('change', handleConnectionChange)
        
        return () => {
          cleanup()
          connection.removeEventListener('change', handleConnectionChange)
        }
      }
    }

    return cleanup
  }, [])

  return {
    isOnline: networkInfo.isOnline,
    connectionType: networkInfo.connectionType,
    lastConnected: networkInfo.lastConnected,
    effectiveType: networkInfo.effectiveType,
    connectionQuality
  }
}