import { memo, useState } from 'react'

interface GuestInfoFormProps {
  guestName: string
  onGuestNameChange: (_name: string) => void
  isValid: boolean
  error?: string
  className?: string
}

export const GuestInfoForm = memo<GuestInfoFormProps>(
  function GuestInfoForm({ 
    guestName, 
    onGuestNameChange, 
    isValid, 
    error, 
    className = '' 
  }) {
    const [isFocused, setIsFocused] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onGuestNameChange(e.target.value)
    }

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

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
              placeholder="Enter your name for the order"
              aria-describedby={error ? 'guest-name-error' : 'guest-name-hint'}
              aria-invalid={!isValid}
              className={`
                w-full px-4 py-3 rounded-lg border text-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
                placeholder:text-coffee-400
                ${!isValid && guestName
                  ? 'border-red-300 bg-red-50'
                  : isFocused
                  ? 'border-coffee-400 bg-coffee-25'
                  : 'border-coffee-200 bg-white hover:border-coffee-300'
                }
              `}
              maxLength={50}
              autoComplete="name"
              autoCapitalize="words"
            />
            
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
              We&apos;ll call your name when your order is ready
            </p>
          )}
        </div>
      </div>
    )
  }
)

export default GuestInfoForm