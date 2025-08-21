import type { OrderStatus } from '@/types/order.types'

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    darkBgColor: 'dark:bg-yellow-900/20',
    darkTextColor: 'dark:text-yellow-400',
    darkBorderColor: 'dark:border-yellow-800'
  },
  ready: {
    label: 'Ready',
    icon: '✅',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    darkBgColor: 'dark:bg-green-900/20',
    darkTextColor: 'dark:text-green-400',
    darkBorderColor: 'dark:border-green-800'
  },
  completed: {
    label: 'Completed',
    icon: '🎉',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    darkBgColor: 'dark:bg-blue-900/20',
    darkTextColor: 'dark:text-blue-400',
    darkBorderColor: 'dark:border-blue-800'
  },
  cancelled: {
    label: 'Cancelled',
    icon: '❌',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    darkBgColor: 'dark:bg-red-900/20',
    darkTextColor: 'dark:text-red-400',
    darkBorderColor: 'dark:border-red-800'
  }
} as const

// Helper function to get status color class
export const getStatusColorClass = (status: OrderStatus, variant: 'bg' | 'text' | 'border' = 'bg') => {
  const config = STATUS_CONFIG[status]
  if (!config) return ''

  switch (variant) {
    case 'bg':
      return config.bgColor
    case 'text':
      return config.textColor
    case 'border':
      return config.borderColor
    default:
      return config.bgColor
  }
}

// Helper function to check if status is actionable
export const isStatusActionable = (status: OrderStatus): boolean => {
  return status === 'pending' || status === 'ready'
}

// Helper function to get next possible statuses
export const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case 'pending':
      return ['ready', 'cancelled']
    case 'ready':
      return ['completed', 'cancelled']
    case 'completed':
    case 'cancelled':
    default:
      return []
  }
}