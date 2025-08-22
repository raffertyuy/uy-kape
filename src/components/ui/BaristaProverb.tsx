import { memo } from 'react'
import { getRandomBaristaProverbText, getBaristaProverbByCategory, type ProverbCategory } from '@/utils/baristaProverbs'

interface BaristaProverbProps {
  /**
   * Optional specific proverb text to display
   * If not provided, a random proverb will be selected
   */
  proverb?: string
  
  /**
   * Optional category to filter proverbs by
   * Only used if proverb prop is not provided
   */
  category?: ProverbCategory
  
  /**
   * Additional CSS classes to apply to the component
   */
  className?: string
  
  /**
   * Whether to show the "A word from your barista" header
   * @default true
   */
  showHeader?: boolean
}

/**
 * BaristaProverb displays encouraging and wise sayings about coffee and patience
 * Used to manage guest expectations during wait times and add personality to the experience
 */
export const BaristaProverb = memo<BaristaProverbProps>(
  function BaristaProverb({ 
    proverb, 
    category,
    className = '', 
    showHeader = true 
  }) {
    // Determine which proverb to display
    const displayProverb = proverb || (
      category 
        ? getBaristaProverbByCategory(category).text
        : getRandomBaristaProverbText()
    )
    
    return (
      <div className={`bg-amber-50 rounded-lg p-4 border border-amber-200 ${className}`}>
        <div className="flex items-start space-x-3">
          {/* Coffee cup icon */}
          <div className="flex-shrink-0 mt-0.5">
            <svg 
              className="w-5 h-5 text-amber-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
              <circle cx="9" cy="7" r="4" />
              <path d="M9 1v6M15 5l-6 6M9 7l6 6" />
            </svg>
          </div>
          
          {/* Content */}
          <div className="text-left flex-1 min-w-0">
            {showHeader && (
              <p className="text-sm font-medium text-amber-800 mb-1">
                A word from your barista:
              </p>
            )}
            
            <blockquote className="text-sm text-amber-700 italic leading-relaxed">
              &ldquo;{displayProverb}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    )
  }
)

/**
 * Compact version of BaristaProverb for smaller spaces
 */
export const BaristaProverbCompact = memo<Omit<BaristaProverbProps, 'showHeader'>>(
  function BaristaProverbCompact(props) {
    return (
      <BaristaProverb 
        {...props} 
        showHeader={false}
        className={`p-3 ${props.className || ''}`}
      />
    )
  }
)

export default BaristaProverb