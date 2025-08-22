import { memo, useState, useCallback } from 'react'

interface GuestInfoFormProps {
  guestName: string
  specialRequest: string
  onGuestNameChange: (_name: string) => void
  onSpecialRequestChange: (_request: string) => void
  isValid: boolean
  error?: string
  className?: string
  
  // Funny name generation props
  isGeneratedName?: boolean
  onClearGeneratedName?: () => void
  onGenerateNewName?: () => void
  onBlur?: () => void
}

export const GuestInfoForm = memo<GuestInfoFormProps>(
  function GuestInfoForm({ 
    guestName, 
    specialRequest,
    onGuestNameChange,
    onSpecialRequestChange, 
    isValid, 
    error, 
    className = '',
    isGeneratedName = false,
    onClearGeneratedName,
    onGenerateNewName,
    onBlur
  }) {
    const [isFocused, setIsFocused] = useState(false)
    const [isSpecialRequestFocused, setIsSpecialRequestFocused] = useState(false)

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onGuestNameChange(e.target.value)
      },
      [onGuestNameChange]
    )

    const handleSpecialRequestChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onSpecialRequestChange(e.target.value)
      },
      [onSpecialRequestChange]
    )

    const handleFocus = useCallback(() => {
      // If this is a generated name and user focuses the input, clear it
      if (isGeneratedName && onClearGeneratedName) {
        onClearGeneratedName()
      }
      setIsFocused(true)
    }, [isGeneratedName, onClearGeneratedName])

    const handleBlur = useCallback(() => {
      setIsFocused(false)
      if (onBlur) {
        onBlur()
      }
    }, [onBlur])
    const handleSpecialRequestFocus = useCallback(() => setIsSpecialRequestFocused(true), [])
    const handleSpecialRequestBlur = useCallback(() => setIsSpecialRequestFocused(false), [])

    const remainingChars = 500 - specialRequest.length

    return (
      <div className={`space-y-3 ${className}`}>
        <div className="space-y-2">
          <label 
            htmlFor="guest-name"
            className="block text-lg font-medium text-coffee-800"
          >
            Your Name
            <span className="text-red-500 ml-1" aria-label="Required">*</span>
          </label>
          
          <div className="relative">
            <input
              id="guest-name"
              type="text"
              value={guestName}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={isGeneratedName ? "Click to enter your own name..." : "Enter your name for the order"}
              aria-describedby={error ? 'guest-name-error' : 'guest-name-hint'}
              aria-invalid={!isValid}
              className={`
                w-full px-4 py-3 rounded-lg border text-lg ${isGeneratedName && onGenerateNewName ? 'pr-20' : 'pr-16'}
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
                placeholder:text-coffee-400
                ${!isValid && guestName
                  ? 'border-red-300 bg-red-50'
                  : isFocused
                  ? 'border-coffee-400 bg-coffee-25'
                  : isGeneratedName
                  ? 'border-amber-300 bg-amber-25 text-amber-600'
                  : 'border-coffee-200 bg-white hover:border-coffee-300 text-coffee-800'
                }
              `}
              maxLength={50}
              autoComplete="name"
              autoCapitalize="words"
            />
            
            {/* Regenerate button for generated names */}
            {isGeneratedName && onGenerateNewName && (
              <button
                type="button"
                onClick={onGenerateNewName}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-700 transition-colors"
                aria-label="Generate new funny name"
                title="Generate a new funny name"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </button>
            )}
            
            {/* Character count indicator */}
            <div className="absolute bottom-2 right-3 text-xs text-coffee-500">
              {guestName.length}/50
            </div>
          </div>

          {/* Helper text or error */}
          {error ? (
            <p 
              id="guest-name-error" 
              className="text-sm text-red-600 flex items-center"
              role="alert"
            >
              <svg 
                className="w-4 h-4 mr-1 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              {error}
            </p>
          ) : (
            <p 
              id="guest-name-hint" 
              className="text-sm text-coffee-600"
            >
              {isGeneratedName 
                ? "We've given you a fun coffee name! Click the input to enter your own name."
                : "We'll call your name when your order is ready"
              }
            </p>
          )}
        </div>

        {/* Special Request Field */}
        <div className="space-y-2">
          <label 
            htmlFor="special-request"
            className="block text-lg font-medium text-coffee-800"
          >
            Special Request 
            <span className="text-coffee-600 font-normal text-base ml-1">(Optional)</span>
          </label>
          
          <div className="relative">
            <textarea
              id="special-request"
              value={specialRequest}
              onChange={handleSpecialRequestChange}
              onFocus={handleSpecialRequestFocus}
              onBlur={handleSpecialRequestBlur}
              placeholder="Any special instructions for your order..."
              aria-describedby="special-request-help"
              className={`
                w-full px-4 py-3 rounded-lg border text-base resize-none
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
                placeholder:text-coffee-400
                ${isSpecialRequestFocused
                  ? 'border-coffee-400 bg-coffee-25'
                  : 'border-coffee-200 bg-white hover:border-coffee-300'
                }
              `}
              maxLength={500}
              rows={3}
            />
            
            {/* Character count indicator */}
            <div className={`absolute bottom-2 right-3 text-xs ${
              remainingChars < 50 ? 'text-amber-600' : 'text-coffee-500'
            }`}>
              {remainingChars} characters remaining
            </div>
          </div>

          <p 
            id="special-request-help" 
            className="text-sm text-coffee-600"
          >
            Let us know if you have any special preferences or dietary requirements
          </p>
        </div>
      </div>
    )
  }
)

export default GuestInfoForm