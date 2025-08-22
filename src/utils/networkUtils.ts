/**
 * Network connectivity detection and utilities
 */

export interface NetworkInfo {
  isOnline: boolean
  connectionType: 'fast' | 'slow' | 'offline'
  lastConnected: Date | null
  effectiveType?: string
}

export interface ConnectionQuality {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'
  downlink: number
  rtt: number
}

// Browser compatibility check for Network Information API
const hasNetworkInformation = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.navigator !== 'undefined' && 
         'connection' in window.navigator
}

// Get network information if available
const getNetworkConnection = (): any => {
  if (!hasNetworkInformation()) return null
  const nav = window.navigator as any
  return nav.connection || nav.mozConnection || nav.webkitConnection
}

/**
 * Detect current network connectivity status
 */
export const getNetworkInfo = (): NetworkInfo => {
  const isOnline = typeof window !== 'undefined' && window.navigator ? window.navigator.onLine : true
  const connection = getNetworkConnection()
  
  let connectionType: 'fast' | 'slow' | 'offline' = 'fast'
  
  if (!isOnline) {
    connectionType = 'offline'
  } else if (connection) {
    const effectiveType = connection.effectiveType || 'unknown'
    
    // Categorize connection speed
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      connectionType = 'slow'
    } else if (effectiveType === '3g') {
      connectionType = 'slow'
    } else {
      connectionType = 'fast'
    }
  }
  
  return {
    isOnline,
    connectionType,
    lastConnected: isOnline ? new Date() : null,
    effectiveType: connection?.effectiveType || 'unknown'
  }
}

/**
 * Get detailed connection quality information
 */
export const getConnectionQuality = (): ConnectionQuality => {
  const connection = getNetworkConnection()
  
  if (!connection) {
    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0
    }
  }
  
  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0
  }
}

/**
 * Check if current connection is considered slow
 */
export const isSlowConnection = (): boolean => {
  const { connectionType } = getNetworkInfo()
  return connectionType === 'slow'
}

/**
 * Estimate if an operation should use reduced data
 */
export const shouldReduceDataUsage = (): boolean => {
  const connection = getNetworkConnection()
  
  if (!connection) return false
  
  // Reduce data usage for slow connections or when save-data is enabled
  return connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.saveData === true
}

/**
 * Add network event listeners
 */
export const addNetworkEventListeners = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {} // Return no-op cleanup function for SSR
  }
  
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  
  // Cleanup function
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

/**
 * Wait for network to come back online
 */
export const waitForOnline = (timeout: number = 30000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || window.navigator.onLine) {
      resolve(true)
      return
    }
    
    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', handleOnline)
      resolve(false)
    }, timeout)
    
    const handleOnline = () => {
      clearTimeout(timeoutId)
      window.removeEventListener('online', handleOnline)
      resolve(true)
    }
    
    window.addEventListener('online', handleOnline)
  })
}

/**
 * Test network connectivity by making a simple request
 */
export const testConnectivity = async (url: string = '/favicon.ico'): Promise<boolean> => {
  if (typeof window === 'undefined') return true
  
  try {
    const controller = new window.AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await window.fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Retry function with exponential backoff for network operations
 */
export const retryNetworkOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  shouldRetry?: (_error: any) => boolean
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break
      }
      
      // Wait for network if offline
      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        const isBackOnline = await waitForOnline(10000)
        if (!isBackOnline) {
          throw new Error('Network is offline and did not recover within timeout')
        }
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1)
      const jitter = Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay + jitter))
    }
  }
  
  throw lastError
}

/**
 * Create a timeout promise for network operations
 */
export const withTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  })
  
  return Promise.race([promise, timeoutPromise])
}

/**
 * Check if an error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false
  
  // Check error types
  if (error.name === 'NetworkError' || error.name === 'TypeError') {
    return true
  }
  
  // Check error messages
  const message = error.message?.toLowerCase() || ''
  const networkMessages = [
    'fetch',
    'network',
    'connection',
    'timeout',
    'abort',
    'cors',
    'failed to fetch'
  ]
  
  return networkMessages.some(term => message.includes(term))
}