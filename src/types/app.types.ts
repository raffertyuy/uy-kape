import type { Database } from './database.types'

// Application-specific types that extend or transform database types
export type DrinkOption = {
  label: string
  type: 'select' | 'checkbox' | 'text'
  options?: string[]
  required?: boolean
}

export type DrinkWithOptions = Database['public']['Tables']['drinks']['Row'] & {
  parsedOptions: Record<string, DrinkOption>
}

export type OrderWithDetails = Database['public']['Tables']['orders']['Row'] & {
  queuePosition?: number
  estimatedTime?: string
}

export type OrderStatus = Database['public']['Enums']['order_status']

export interface PasswordAuthState {
  isAuthenticated: boolean
  role?: 'guest' | 'admin' | undefined
}

export interface AppConfig {
  guestPassword: string
  adminPassword: string
  waitTimePerOrder: number
}

// Form types
export interface OrderFormData {
  customerName: string
  selectedDrink: string
  options: Record<string, string | boolean | string[]>
}

export interface DrinkFormData {
  name: string
  options: Record<string, DrinkOption>
}