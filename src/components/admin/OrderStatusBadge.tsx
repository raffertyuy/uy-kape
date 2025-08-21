import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/utils/orderStatus'
import type { OrderStatus } from '@/types/order.types'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const SIZE_CONFIG = {
  sm: {
    padding: 'px-2 py-1',
    text: 'text-xs',
    iconSize: 'text-xs'
  },
  md: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    iconSize: 'text-sm'
  },
  lg: {
    padding: 'px-4 py-2',
    text: 'text-base',
    iconSize: 'text-base'
  }
} as const

/**
 * Status indicator component with color coding and optional icons
 * Provides consistent visual representation of order status across the application
 */
export const OrderStatusBadge = ({ 
  status, 
  className, 
  size = 'md', 
  showIcon = true 
}: OrderStatusBadgeProps) => {
  const statusConfig = STATUS_CONFIG[status]
  const sizeConfig = SIZE_CONFIG[size]

  if (!statusConfig) {
    console.warn(`Unknown order status: ${status}`)
    return (
      <span className={cn(
        'inline-flex items-center rounded-full border',
        'bg-gray-100 text-gray-800 border-gray-200',
        'dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
        sizeConfig.padding,
        sizeConfig.text,
        className
      )}>
        <span className="font-medium">Unknown</span>
      </span>
    )
  }

  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        statusConfig.bgColor,
        statusConfig.textColor,
        statusConfig.borderColor,
        statusConfig.darkBgColor,
        statusConfig.darkTextColor,
        statusConfig.darkBorderColor,
        sizeConfig.padding,
        sizeConfig.text,
        className
      )}
      role="status"
      aria-label={`Order status: ${statusConfig.label}`}
    >
      {showIcon && (
        <span 
          className={cn('mr-1.5', sizeConfig.iconSize)}
          aria-hidden="true"
        >
          {statusConfig.icon}
        </span>
      )}
      <span>{statusConfig.label}</span>
    </span>
  )
}