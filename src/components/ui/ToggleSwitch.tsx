import React from 'react'

interface ToggleSwitchProps {
  id: string
  checked: boolean
  onChange: (_checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      switch: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: checked ? 'translate-x-3' : 'translate-x-0'
    },
    md: {
      switch: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0'
    },
    lg: {
      switch: 'h-8 w-14',
      thumb: 'h-7 w-7',
      translate: checked ? 'translate-x-6' : 'translate-x-0'
    }
  }

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col">
        <label 
          htmlFor={id} 
          className={`text-sm font-medium ${
            disabled ? 'text-gray-400' : 'text-coffee-700'
          } cursor-pointer`}
        >
          {label}
        </label>
        {description && (
          <p className={`text-xs mt-1 ${
            disabled ? 'text-gray-400' : 'text-coffee-600'
          }`}>
            {description}
          </p>
        )}
      </div>
      
      <button
        id={id}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-coffee-500 
          focus:ring-offset-2 ${sizeClasses[size].switch} ${
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-200' 
            : checked 
              ? 'bg-coffee-600' 
              : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        aria-describedby={description ? `${id}-description` : undefined}
      >
        <span
          className={`
            pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out ${sizeClasses[size].thumb} ${sizeClasses[size].translate}
          `}
        />
      </button>
    </div>
  )
}

export default ToggleSwitch