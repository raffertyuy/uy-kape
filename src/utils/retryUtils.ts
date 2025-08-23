/**
 * Retry utilities for handling failed operations
 */

export interface RetryOptions {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  exponentialBase: number
  jitter: boolean
  shouldRetry?: (_error: unknown, _attempt: number) => boolean
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalTime: number
}

// Default retry options
const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBase: 2,
  jitter: true,
  shouldRetry: (error: any) => {
    // Default: retry on network errors only
    if (!error) return false
    
    const message = error.message?.toLowerCase() || ''
    const networkErrors = ['fetch', 'network', 'timeout', 'connection', 'abort']
    return networkErrors.some(term => message.includes(term))
  }
}

// Calculate delay with exponential backoff and jitter
const calculateDelay = (attempt: number, options: RetryOptions): number => {
  const { baseDelay, maxDelay, exponentialBase, jitter } = options
  
  let delay = baseDelay * Math.pow(exponentialBase, attempt - 1)
  
  // Apply maximum delay limit
  delay = Math.min(delay, maxDelay)
  
  // Add jitter to prevent thundering herd
  if (jitter) {
    const jitterAmount = delay * 0.1 * Math.random()
    delay += jitterAmount
  }
  
  return Math.round(delay)
}

// Wait for specified time
const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Main retry function
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> => {
  const config = { ...defaultRetryOptions, ...options }
  const startTime = Date.now()
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation()
      
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalTime: Date.now() - startTime
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if we should retry this error
      if (config.shouldRetry && !config.shouldRetry(error, attempt)) {
        break
      }
      
      // Don't wait after the last attempt
      if (attempt < config.maxAttempts) {
        const delay = calculateDelay(attempt, config)
        await wait(delay)
      }
    }
  }
  
  return {
    success: false,
    error: lastError || new Error('Unknown error occurred'),
    attempts: config.maxAttempts,
    totalTime: Date.now() - startTime
  }
}

// Specialized retry for network operations
export const retryNetworkOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  const result = await retryOperation(operation, {
    maxAttempts,
    baseDelay: 1000,
    maxDelay: 5000,
    shouldRetry: (error: any) => {
      // Retry on network-related errors
      if (!error) return false
      
      const message = error.message?.toLowerCase() || ''
      const networkErrors = [
        'failed to fetch',
        'network error',
        'connection',
        'timeout',
        'abort',
        'cors',
        'dns'
      ]
      
      return networkErrors.some(term => message.includes(term))
    }
  })
  
  if (!result.success) {
    throw result.error
  }
  
  return result.data as T
}

// Specialized retry for Supabase operations
export const retrySupabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  const result = await retryOperation(operation, {
    maxAttempts,
    baseDelay: 1500,
    maxDelay: 8000,
    shouldRetry: (error: any) => {
      if (!error) return false
      
      // Don't retry on certain error types
      const nonRetryableErrors = [
        'unique constraint',
        'foreign key constraint',
        'check constraint',
        'not found',
        'unauthorized',
        'permission denied'
      ]
      
      const message = error.message?.toLowerCase() || ''
      const isNonRetryable = nonRetryableErrors.some(term => message.includes(term))
      
      if (isNonRetryable) return false
      
      // Retry on network errors and server errors
      const retryableErrors = [
        'failed to fetch',
        'network',
        'timeout',
        'internal server error',
        'bad gateway',
        'service unavailable',
        'gateway timeout'
      ]
      
      return retryableErrors.some(term => message.includes(term))
    }
  })
  
  if (!result.success) {
    throw result.error
  }
  
  return result.data as T
}

// Create a retry wrapper for any function
export const withRetry = <T extends unknown[], R>(
  fn: (..._args: T) => Promise<R>,
  options: Partial<RetryOptions> = {}
) => {
  return async (..._args: T): Promise<R> => {
    const result = await retryOperation(() => fn(..._args), options)
    
    if (!result.success) {
      throw result.error
    }
    
    return result.data as R
  }
}

// Cache for successful operations
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class OperationCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  
  set(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  delete(key: string): void {
    this.cache.delete(key)
  }
}

// Create global cache instances
export const menuCache = new OperationCache<unknown>()

// Cache wrapper for operations
export const withCache = <T extends unknown[], R>(
  fn: (..._args: T) => Promise<R>,
  getCacheKey: (..._args: T) => string,
  ttl: number = 300000
) => {
  return async (..._args: T): Promise<R> => {
    const cacheKey = getCacheKey(..._args)
    
    // Try to get from cache first
    const cached = menuCache.get(cacheKey)
    if (cached !== null) {
      return cached as R
    }
    
    // Execute operation
    const result = await fn(..._args)
    
    // Cache successful result
    menuCache.set(cacheKey, result, ttl)
    
    return result
  }
}

// Combine retry and cache
export const withRetryAndCache = <T extends unknown[], R>(
  fn: (..._args: T) => Promise<R>,
  getCacheKey: (..._args: T) => string,
  retryOptions: Partial<RetryOptions> = {},
  cacheTtl: number = 300000
) => {
  const retryFn = withRetry(fn, retryOptions)
  return withCache(retryFn, getCacheKey, cacheTtl)
}

// Manual retry trigger for UI
export interface ManualRetryState {
  isRetrying: boolean
  lastError: Error | null
  retryCount: number
  canRetry: boolean
}

export const createManualRetryState = (): ManualRetryState => ({
  isRetrying: false,
  lastError: null,
  retryCount: 0,
  canRetry: true
})

export const executeWithManualRetry = async <T>(
  operation: () => Promise<T>,
  _state: ManualRetryState,
  updateState: (_state: ManualRetryState) => void,
  maxRetries: number = 5
): Promise<T | null> => {
  if (_state.isRetrying || !_state.canRetry) {
    return null
  }
  
  updateState({
    ..._state,
    isRetrying: true,
    lastError: null
  })
  
  try {
    const result = await operation()
    
    updateState({
      ..._state,
      isRetrying: false,
      lastError: null,
      retryCount: 0,
      canRetry: true
    })
    
    return result
  } catch (error) {
    const newRetryCount = _state.retryCount + 1
    const canRetry = newRetryCount < maxRetries
    
    updateState({
      ..._state,
      isRetrying: false,
      lastError: error instanceof Error ? error : new Error(String(error)),
      retryCount: newRetryCount,
      canRetry
    })
    
    return null
  }
}