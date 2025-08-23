import { cn } from '@/lib/utils'

interface QueuePositionProps {
  position: number
  total?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showAnimation?: boolean
  showTotal?: boolean
}

const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-1',
    text: 'text-xs',
    number: 'text-sm font-bold',
    icon: 'text-xs'
  },
  md: {
    container: 'px-3 py-2',
    text: 'text-sm',
    number: 'text-base font-bold',
    icon: 'text-sm'
  },
  lg: {
    container: 'px-4 py-3',
    text: 'text-base',
    number: 'text-lg font-bold',
    icon: 'text-base'
  }
} as const

/**
 * Queue position display component with update animations
 * Shows current position in queue with optional total queue size
 */
export const QueuePosition = ({
  position,
  total,
  className,
  size = 'md',
  showAnimation = true,
  showTotal = true
}: QueuePositionProps) => {
  const sizeConfig = SIZE_CONFIG[size]

  // Don't show queue position if it's 0 (order is not in queue)
  if (position <= 0) {
    return null
  }

  const displayText = showTotal && total ? `${position} of ${total}` : `#${position}`

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border',
        'bg-coffee-50 text-coffee-800 border-coffee-200',
        sizeConfig.container,
        showAnimation && 'transition-all duration-300 ease-in-out',
        className
      )}
      role="status"
      aria-label={`Queue position: ${displayText}`}
    >
      <span 
        className={cn('mr-2', sizeConfig.icon)}
        aria-hidden="true"
      >
        🏃‍♂️
      </span>
      <div className="flex flex-col">
        <span className={cn('leading-none', sizeConfig.text)}>
          Queue Position
        </span>
        <span 
          className={cn(
            'leading-none text-coffee-900',
            sizeConfig.number,
            showAnimation && 'animate-pulse'
          )}
        >
          {displayText}
        </span>
      </div>
    </div>
  )
}

// Alternative compact version for smaller spaces
export const QueuePositionCompact = ({
  position,
  total,
  className,
  showAnimation = true
}: Pick<QueuePositionProps, 'position' | 'total' | 'className' | 'showAnimation'>) => {
  if (position <= 0) {
    return null
  }

  const displayText = total ? `${position}/${total}` : `#${position}`

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
        'bg-coffee-100 text-coffee-800 border border-coffee-200',
        showAnimation && 'transition-all duration-300 ease-in-out animate-pulse',
        className
      )}
      role="status"
      aria-label={`Queue position: ${displayText}`}
    >
      <span className="mr-1" aria-hidden="true">🏃‍♂️</span>
      {displayText}
    </span>
  )
}

// Priority indicator for urgent orders
export const QueuePriorityIndicator = ({ 
  priority, 
  className 
}: { 
  priority: 'normal' | 'high' | 'urgent'
  className?: string 
}) => {
  if (priority === 'normal') {
    return <span data-testid="priority-indicator" className="sr-only">Normal Priority</span>
  }

  const config = {
    high: {
      icon: '⚡',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      label: 'High Priority'
    },
    urgent: {
      icon: '🚨',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      label: 'Urgent'
    }
  }

  const priorityConfig = config[priority]

  return (
    <span
      data-testid="priority-indicator"
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
        priorityConfig.bgColor,
        priorityConfig.textColor,
        priorityConfig.borderColor,
        'animate-pulse',
        className
      )}
      role="status"
      aria-label={priorityConfig.label}
    >
      <span className="mr-1" aria-hidden="true">
        {priorityConfig.icon}
      </span>
      {priorityConfig.label}
    </span>
  )
}
