/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface GuestNameDisplayProps {
  guestName: string
  className?: string
  /** Additional classes for the name text */
  textClassName?: string
  /** Max width before truncation kicks in */
  maxWidth?: string
  /** Show tooltip on desktop when truncated */
  showTooltip?: boolean
  /** Allow expansion on mobile */
  allowMobileExpansion?: boolean
}

/**
 * Enhanced guest name display component that handles long names gracefully
 * - Shows tooltip on desktop hover when text is truncated
 * - Allows click expansion on mobile devices
 * - Maintains accessibility with proper ARIA attributes
 * - Responsive behavior for different screen sizes
 */
export const GuestNameDisplay = ({
  guestName,
  className,
  textClassName = 'font-semibold text-gray-900',
  maxWidth,
  showTooltip = true,
  allowMobileExpansion = true
}: GuestNameDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [showTooltipState, setShowTooltipState] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<any>(null)
  const textRef = useRef<any>(null)

  // Check if we're on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check if text is overflowing
  const checkOverflow = useCallback(() => {
    if (textRef.current) {
      const element = textRef.current
      const isOverflow = element.scrollWidth > element.clientWidth
      setIsOverflowing(isOverflow)
    }
  }, [])

  useEffect(() => {
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [guestName, checkOverflow])

  const handleMouseEnter = () => {
    if (!isMobile && showTooltip && isOverflowing) {
      setShowTooltipState(true)
    }
  }

  const handleMouseLeave = () => {
    setShowTooltipState(false)
  }

  const handleClick = () => {
    if (isMobile && allowMobileExpansion && isOverflowing) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isMobile && allowMobileExpansion && isOverflowing) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setIsExpanded(!isExpanded)
      }
    }
  }

  // Close expanded state when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isMobile && isExpanded && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, isMobile])

  const shouldShowTooltip = showTooltipState && showTooltip && isOverflowing && !isMobile
  const shouldAllowInteraction = (isMobile && allowMobileExpansion && isOverflowing) || (!isMobile && showTooltip && isOverflowing)

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <h3
        ref={textRef}
        className={cn(
          textClassName,
          // Base truncation when not expanded
          !isExpanded && 'truncate',
          // Cursor and interaction styles
          shouldAllowInteraction && 'cursor-pointer',
          // Mobile expansion styles
          isMobile && isExpanded && 'whitespace-normal break-words',
          // Focus styles for accessibility
          shouldAllowInteraction && 'focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-1 rounded-sm'
        )}
        style={maxWidth ? { maxWidth } : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={shouldAllowInteraction ? 0 : undefined}
        role={shouldAllowInteraction ? 'button' : undefined}
        aria-label={
          shouldAllowInteraction 
            ? `Guest name: ${guestName}${isMobile ? (isExpanded ? ' (tap to collapse)' : ' (tap to expand)') : ' (hover for full name)'}`
            : `Guest name: ${guestName}`
        }
        aria-expanded={isMobile && allowMobileExpansion ? isExpanded : undefined}
        title={!isMobile && !showTooltip ? guestName : undefined}
      >
        {guestName}
      </h3>

      {/* Tooltip for desktop */}
      {shouldShowTooltip && (
        <div
          className="absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap"
          role="tooltip"
          aria-hidden="true"
        >
          {guestName}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Mobile expansion indicator */}
      {isMobile && allowMobileExpansion && isOverflowing && (
        <span 
          className="absolute -top-1 -right-1 text-xs text-coffee-600"
          aria-hidden="true"
        >
          {isExpanded ? '−' : '+'}
        </span>
      )}
    </div>
  )
}

// Convenience wrapper that acts as the default H3 component
export const GuestNameH3 = GuestNameDisplay