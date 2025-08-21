import type { Tables, TablesInsert, TablesUpdate } from './database.types'

// Core database interfaces matching the schema
export interface DrinkCategory extends Tables<'drink_categories'> {}

export interface Drink extends Tables<'drinks'> {
  category?: DrinkCategory | null // For joined queries
}

export interface OptionCategory extends Tables<'option_categories'> {}

export interface OptionValue extends Tables<'option_values'> {
  category?: OptionCategory | null // For joined queries
}

export interface DrinkOption extends Tables<'drink_options'> {
  drink?: Drink | null
  option_category?: OptionCategory | null
  default_value?: OptionValue | null
}

// Form interfaces for create/update operations
export interface CreateDrinkCategoryDto extends TablesInsert<'drink_categories'> {}
export interface UpdateDrinkCategoryDto extends TablesUpdate<'drink_categories'> {}

export interface CreateDrinkDto extends TablesInsert<'drinks'> {}
export interface UpdateDrinkDto extends TablesUpdate<'drinks'> {}

export interface CreateOptionCategoryDto extends TablesInsert<'option_categories'> {}
export interface UpdateOptionCategoryDto extends TablesUpdate<'option_categories'> {}

export interface CreateOptionValueDto extends TablesInsert<'option_values'> {}
export interface UpdateOptionValueDto extends TablesUpdate<'option_values'> {}

export interface CreateDrinkOptionDto extends TablesInsert<'drink_options'> {}
export interface UpdateDrinkOptionDto extends TablesUpdate<'drink_options'> {}

// Complex UI types - more flexible with optional properties
export interface DrinkWithOptionsAndCategory extends Drink {
  category: DrinkCategory
  drink_options: Array<{
    id: string
    drink_id: string
    option_category_id: string
    default_option_value_id: string | null
    created_at: string | null
    option_category: OptionCategory
    default_value?: OptionValue | null
  }>
}

export interface OptionCategoryWithValues extends OptionCategory {
  option_values: OptionValue[]
}

// Options preview interfaces for enhanced drink cards
export interface DrinkOptionPreview {
  id: string
  option_category_name: string
  default_value_name: string | null
  is_required?: boolean
}

export interface DrinkWithOptionsPreview extends Drink {
  category?: DrinkCategory | null
  options_preview: DrinkOptionPreview[]
}

// Filter and search types
export interface MenuFilters {
  category?: string
  isActive?: boolean
  search?: string
}

// Validation result types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Error types for menu operations
export type MenuOperationError = 
  | { type: 'network'; message: string }
  | { type: 'validation'; field: string; message: string }
  | { type: 'database'; message: string }
  | { type: 'unknown'; message: string }

// Loading states for menu operations
export type MenuLoadingState = 'idle' | 'loading' | 'success' | 'error'

// Menu operation result type
export interface MenuOperationResult<T = unknown> {
  state: MenuLoadingState
  data?: T
  error?: MenuOperationError
}

// Drag and drop types for reordering
export interface DragDropResult {
  sourceIndex: number
  destinationIndex: number
  type: 'category' | 'drink' | 'option-category' | 'option-value'
}

// Bulk operation types
export interface BulkOperationResult {
  successCount: number
  errorCount: number
  errors: Array<{ id: string; error: string }>
}

// Tab navigation types for menu management
export type MenuTab = 'categories' | 'drinks' | 'options'

// Real-time subscription status
export interface SubscriptionStatus {
  isConnected: boolean
  lastUpdate?: Date
  error?: string
}