import { useState, useCallback } from 'react'

interface UseGuestInfoReturn {
  // Form data
  guestName: string
  
  // Validation state
  isValid: boolean
  error: string | null
  
  // Actions
  setGuestName: (_name: string) => void
  validateName: () => boolean
  clearError: () => void
  
  // Form utilities
  hasInput: boolean
  trimmedName: string
}

export function useGuestInfo(): UseGuestInfoReturn {
  const [guestName, setGuestNameState] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Validation logic
  const validateName = useCallback((): boolean => {
    const trimmed = guestName.trim()
    
    if (!trimmed) {
      setError('Please enter your name')
      return false
    }
    
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters long')
      return false
    }
    
    if (trimmed.length > 50) {
      setError('Name must be less than 50 characters')
      return false
    }
    
    // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
    const validNamePattern = /^[a-zA-Z\s'-]+$/
    if (!validNamePattern.test(trimmed)) {
      setError('Name can only contain letters, spaces, hyphens, and apostrophes')
      return false
    }
    
    // Check for reasonable name pattern (at least one letter)
    const hasLetter = /[a-zA-Z]/.test(trimmed)
    if (!hasLetter) {
      setError('Name must contain at least one letter')
      return false
    }
    
    setError(null)
    return true
  }, [guestName])

  // Action handlers
  const setGuestName = useCallback((name: string) => {
    setGuestNameState(name)
    
    // Clear error when user starts typing (but don't validate immediately)
    if (error && name.trim().length > 0) {
      setError(null)
    }
  }, [error])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Computed properties
  const trimmedName = guestName.trim()
  const hasInput = guestName.length > 0
  const isValid = error === null && trimmedName.length >= 2

  return {
    // Form data
    guestName,
    
    // Validation state
    isValid,
    error,
    
    // Actions
    setGuestName,
    validateName,
    clearError,
    
    // Form utilities
    hasInput,
    trimmedName
  }
}

export default useGuestInfo