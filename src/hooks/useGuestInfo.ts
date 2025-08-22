import { useState, useCallback } from 'react'
import { generateFunnyGuestName, isGeneratedFunnyName } from '@/utils/nameGenerator'

interface UseGuestInfoReturn {
  // Form data
  guestName: string
  specialRequest: string
  
  // Generation state
  isGeneratedName: boolean
  userHasClearedName: boolean
  
  // Validation state
  isValid: boolean
  error: string | null
  
  // Actions
  setGuestName: (_name: string) => void
  setSpecialRequest: (_request: string) => void
  generateNewFunnyName: () => void
  clearGeneratedName: () => void
  handleBlur: () => void
  validateName: (_nameToValidate?: string) => boolean
  clearError: () => void
  
  // Form utilities
  hasInput: boolean
  trimmedName: string
}

export function useGuestInfo(): UseGuestInfoReturn {
  const [guestName, setGuestNameState] = useState('')
  const [specialRequest, setSpecialRequestState] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isGeneratedName, setIsGeneratedName] = useState(false)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const [userHasClearedName, setUserHasClearedName] = useState(false)

  // Validation logic
  const validateName = useCallback((nameToValidate?: string): boolean => {
    const currentName = nameToValidate ?? guestName
    const trimmed = currentName.trim()
    
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

  // Generate a new funny name
  const generateNewFunnyName = useCallback(() => {
    const funnyName = generateFunnyGuestName()
    setGuestNameState(funnyName)
    setIsGeneratedName(true)
    setUserHasInteracted(false)
    setUserHasClearedName(false) // Reset the flag when generating a new name
    setError(null)
  }, [])

  // Clear generated name (when user clicks input)
  const clearGeneratedName = useCallback(() => {
    setGuestNameState('')
    setIsGeneratedName(false)
    setUserHasInteracted(true)
    setUserHasClearedName(true) // Track that user has intentionally cleared the name
    setError(null)
  }, [])

  // Enhanced setGuestName to track user input vs generated names
  const setGuestName = useCallback((name: string) => {
    setGuestNameState(name)
    
    // Use the utility function to detect if this is a generated name
    const isGenerated = isGeneratedFunnyName(name)
    setIsGeneratedName(isGenerated)
    
    // If user has interacted but left field empty, we'll handle this in blur
    if (name.trim() === '' && userHasInteracted) {
      setIsGeneratedName(false)
    } else if (name.trim() === '') {
      // Initial empty state - not generated yet
      setIsGeneratedName(false)
    } else {
      // User is entering their own name or we have a generated name
      if (!isGenerated) {
        setUserHasClearedName(false) // Reset flag when user starts typing their own name
        setUserHasInteracted(true)
      }
    }
    
    // Clear error when user starts typing (but don't validate immediately)
    // Only clear if it was a previous "empty name" error 
    if (error === 'Please enter your name' && name.trim().length > 0) {
      setError(null)
    }
  }, [error, userHasInteracted])

  // Handle when user leaves empty field - revert to funny name
  const handleBlur = useCallback(() => {
    if (guestName.trim() === '' && userHasInteracted) {
      const funnyName = generateFunnyGuestName()
      setGuestNameState(funnyName)
      setIsGeneratedName(true)
      setUserHasInteracted(false)
      setUserHasClearedName(false) // Reset the flag when regenerating on blur
    }
  }, [guestName, userHasInteracted])

  const setSpecialRequest = useCallback((request: string) => {
    // Limit to 500 characters
    const truncatedRequest = request.length > 500 ? request.slice(0, 500) : request
    setSpecialRequestState(truncatedRequest)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Computed properties
  const trimmedName = guestName.trim()
  const hasInput = trimmedName.length > 0
  const isValid = error === null && trimmedName.length >= 2

  return {
    // Form data
    guestName,
    specialRequest,
    
    // Generation state
    isGeneratedName,
    userHasClearedName,
    
    // Validation state
    isValid,
    error,
    
    // Actions
    setGuestName,
    setSpecialRequest,
    generateNewFunnyName,
    clearGeneratedName,
    handleBlur,
    validateName,
    clearError,
    
    // Form utilities
    hasInput,
    trimmedName
  }
}

export default useGuestInfo