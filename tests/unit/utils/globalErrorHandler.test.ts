import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  categorizeError,
  getUserFriendlyMessage,
  handleGlobalError,
  getRecoveryStrategy,
  withRetry
} from '../../../src/utils/globalErrorHandler'

// Mock console methods
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50
    }
  },
  writable: true
})

describe('globalErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleSpy.mockClear()
    consoleWarnSpy.mockClear()
  })

  describe('categorizeError', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new Error('Failed to fetch')
      expect(categorizeError(networkError)).toBe('network')

      const connectionError = new Error('Network request failed')
      expect(categorizeError(connectionError)).toBe('network')

      const timeoutError = new Error('Request timeout')
      expect(categorizeError(timeoutError)).toBe('network')
    })

    it('should categorize permission errors correctly', () => {
      const permissionError = new Error('Access denied')
      expect(categorizeError(permissionError)).toBe('permission')

      const unauthorizedError = new Error('Unauthorized access')
      expect(categorizeError(unauthorizedError)).toBe('permission')

      const forbiddenError = new Error('Forbidden request')
      expect(categorizeError(forbiddenError)).toBe('permission')
    })

    it('should categorize validation errors correctly', () => {
      const validationError = new Error('Invalid input data')
      expect(categorizeError(validationError)).toBe('validation')

      const schemaError = new Error('Schema validation failed')
      expect(categorizeError(schemaError)).toBe('validation')

      const formatError = new Error('Invalid format provided')
      expect(categorizeError(formatError)).toBe('validation')
    })

    it('should return unknown for unrecognized errors', () => {
      const unknownError = new Error('Something unexpected happened')
      expect(categorizeError(unknownError)).toBe('unknown')

      const emptyError = new Error('')
      expect(categorizeError(emptyError)).toBe('unknown')
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly messages for different error categories', () => {
      const networkError = new Error('Failed to fetch')
      expect(getUserFriendlyMessage(networkError, 'network')).toBe(
        'Unable to connect to our servers. Please check your internet connection and try again.'
      )

      const permissionError = new Error('Access denied')
      expect(getUserFriendlyMessage(permissionError, 'permission')).toBe(
        'You do not have permission to perform this action. Please contact your administrator.'
      )

      const validationError = new Error('Invalid input')
      expect(getUserFriendlyMessage(validationError, 'validation')).toBe(
        'The information provided is not valid. Please check your input and try again.'
      )

      const unknownError = new Error('Something happened')
      expect(getUserFriendlyMessage(unknownError, 'unknown')).toBe(
        'An unexpected error occurred. Please try again, and contact support if the problem continues.'
      )
    })

    it('should return custom user message when available', () => {
      const errorWithUserMessage = {
        message: 'Technical error',
        userMessage: 'Custom user-friendly message'
      }
      
      expect(getUserFriendlyMessage(errorWithUserMessage, 'unknown')).toBe(
        'Custom user-friendly message'
      )
    })
  })

  describe('getRecoveryStrategy', () => {
    it('should return appropriate recovery strategies for network errors', () => {
      const networkError = new Error('Failed to fetch')
      const strategy = getRecoveryStrategy('network', networkError)

      expect(strategy).toEqual({
        canRetry: true,
        retryDelay: 1000,
        maxRetries: 3,
        message: 'Connection problem. Please check your internet connection and try again.'
      })
    })

    it('should return appropriate recovery strategies for permission errors', () => {
      const permissionError = new Error('Access denied')
      const strategy = getRecoveryStrategy('permission', permissionError)

      expect(strategy).toEqual({
        canRetry: false,
        retryDelay: 0,
        maxRetries: 0,
        message: 'You don\'t have permission to perform this action. Please contact support if you think this is an error.'
      })
    })

    it('should return appropriate recovery strategies for validation errors', () => {
      const validationError = new Error('Invalid input')
      const strategy = getRecoveryStrategy('validation', validationError)

      expect(strategy).toEqual({
        canRetry: false,
        retryDelay: 0,
        maxRetries: 0,
        message: 'There\'s an issue with the information provided. Please check your input and try again.'
      })
    })

    it('should return appropriate recovery strategies for unknown errors', () => {
      const unknownError = new Error('Something weird happened')
      const strategy = getRecoveryStrategy('unknown', unknownError)

      expect(strategy).toEqual({
        canRetry: true,
        retryDelay: 2000,
        maxRetries: 2,
        message: 'Something unexpected happened. Please try again, and contact support if the problem persists.'
      })
    })
  })

  describe('handleGlobalError', () => {
    it('should process and log error correctly', () => {
      const error = new Error('Test error')
      const result = handleGlobalError(error, 'test_context')

      expect(result).toEqual({
        code: 'Error',
        message: 'An unexpected error occurred. Please try again, and contact support if the problem continues.',
        details: expect.any(Object),
        timestamp: expect.any(Date),
        action: 'test_context'
      })

      expect(result.details).toEqual({
        originalError: error,
        stack: error.stack,
        context: 'test_context',
        timestamp: expect.any(String),
        userAgent: expect.any(String),
        url: expect.any(String)
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Global Error:',
        expect.objectContaining({
          category: 'unknown',
          context: 'test_context',
          userMessage: 'An unexpected error occurred. Please try again, and contact support if the problem continues.'
        })
      )
    })

    it('should handle errors without context', () => {
      const error = new Error('Test error without context')
      const result = handleGlobalError(error)

      expect(result.action).toBeUndefined()
    })

    it('should generate different timestamps for different errors', () => {
      const error1 = new Error('Error 1')
      const error2 = new Error('Error 2')

      const result1 = handleGlobalError(error1)
      const result2 = handleGlobalError(error2)

      // Should have different timestamps (or at least different milliseconds)
      expect(result1.timestamp.getTime()).not.toBe(result2.timestamp.getTime())
    })
  })

  describe('withRetry', () => {
    it('should succeed on first try if operation succeeds', async () => {
      const successOperation = vi.fn().mockResolvedValue('success')
      
      const result = await withRetry(successOperation, 3, 100)
      
      expect(result).toBe('success')
      expect(successOperation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      const retryOperation = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success on third try')

      const result = await withRetry(retryOperation, 3, 10)
      
      expect(result).toBe('success on third try')
      expect(retryOperation).toHaveBeenCalledTimes(3)
    })

    it('should fail after maximum retries', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Always fails'))

      await expect(withRetry(failingOperation, 2, 10)).rejects.toThrow('Always fails')
      expect(failingOperation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should apply exponential backoff between retries', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Always fails'))
      const startTime = Date.now()

      try {
        await withRetry(failingOperation, 2, 50)
      } catch {
        // Expected to fail
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should take at least 50ms (first retry) + 100ms (second retry) = 150ms
      expect(duration).toBeGreaterThan(140) // Allow some margin for test execution
    })

    it('should handle non-error rejections', async () => {
      const stringRejectOperation = vi.fn().mockRejectedValue('String error')

      await expect(withRetry(stringRejectOperation, 1, 10)).rejects.toBe('String error')
    })
  })

  describe('error handling edge cases', () => {
    it('should handle missing navigator.connection gracefully', () => {
      // Mock navigator without connection
      Object.defineProperty(window, 'navigator', {
        value: { onLine: true },
        writable: true
      })

      const error = new Error('Test error')
      const result = handleGlobalError(error)

      expect(result.details?.userAgent).toBeDefined()
    })

    it('should handle missing navigator gracefully', () => {
      // Mock missing navigator
      Object.defineProperty(window, 'navigator', {
        value: undefined,
        writable: true
      })

      const error = new Error('Test error')
      const result = handleGlobalError(error)

      expect(result.details?.userAgent).toBe('unknown')
    })
  })
})