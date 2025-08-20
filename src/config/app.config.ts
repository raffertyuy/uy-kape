import type { AppConfig } from '@/types/app.types'

export const appConfig: AppConfig = {
  guestPassword: import.meta.env.VITE_GUEST_PASSWORD || 'guest123',
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || 'admin456',
}

// Application constants
export const APP_NAME = 'Uy, Kape!'
export const APP_DESCRIPTION = 'Your friend\'s coffee ordering system'

// Order status display names
export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const

// Default drink options template
export const DEFAULT_DRINK_OPTIONS = {
  size: {
    label: 'Size',
    type: 'select' as const,
    options: ['Small', 'Medium', 'Large'],
    required: true,
  },
  milk: {
    label: 'Milk',
    type: 'select' as const,
    options: ['None', 'Regular', 'Oat', 'Almond', 'Soy'],
    required: false,
  },
  sugar: {
    label: 'Sugar',
    type: 'select' as const,
    options: ['None', '1 tsp', '2 tsp', '3 tsp'],
    required: false,
  },
  hot: {
    label: 'Temperature',
    type: 'checkbox' as const,
    required: false,
  },
}