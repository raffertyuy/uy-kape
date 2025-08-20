import type { 
  CreateDrinkCategoryDto, 
  CreateDrinkDto, 
  CreateOptionCategoryDto, 
  CreateOptionValueDto 
} from '@/types/menu.types'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings?: Record<string, string>
}

export interface ValidationRule<T> {
  field: keyof T
  validate: (_value: any, _data: T) => string | null
  message?: string
}

// Common validation functions
export const validationRules = {
  required: (value: any): string | null => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required'
    }
    return null
  },

  minLength: (min: number) => (value: string): string | null => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`
    }
    return null
  },

  maxLength: (max: number) => (value: string): string | null => {
    if (value && value.length > max) {
      return `Must not exceed ${max} characters`
    }
    return null
  },

  positiveInteger: (value: number): string | null => {
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
      return 'Must be a positive integer'
    }
    return null
  },

  validDisplayOrder: (value: number): string | null => {
    if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 999)) {
      return 'Display order must be between 0 and 999'
    }
    return null
  },

  validId: (value: string): string | null => {
    if (value && !/^[a-f0-9-]{36}$/.test(value)) {
      return 'Invalid ID format'
    }
    return null
  }
}

// Validation function factory
export function createValidator<T>(rules: ValidationRule<T>[]) {
  return (data: T): ValidationResult => {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}

    for (const rule of rules) {
      const value = data[rule.field]
      const error = rule.validate(value, data)
      
      if (error) {
        errors[rule.field as string] = error
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      ...(Object.keys(warnings).length > 0 && { warnings })
    }
  }
}

// Drink Category Validation
const drinkCategoryRules: ValidationRule<CreateDrinkCategoryDto>[] = [
  {
    field: 'name',
    validate: (value) => validationRules.required(value) || validationRules.minLength(2)(value) || validationRules.maxLength(50)(value)
  },
  {
    field: 'description',
    validate: (value) => value ? validationRules.maxLength(200)(value) : null
  },
  {
    field: 'display_order',
    validate: (value) => validationRules.validDisplayOrder(value)
  }
]

export const validateDrinkCategory = createValidator(drinkCategoryRules)

// Drink Validation
const drinkRules: ValidationRule<CreateDrinkDto>[] = [
  {
    field: 'name',
    validate: (value) => validationRules.required(value) || validationRules.minLength(2)(value) || validationRules.maxLength(100)(value)
  },
  {
    field: 'description',
    validate: (value) => value ? validationRules.maxLength(300)(value) : null
  },
  {
    field: 'category_id',
    validate: (value) => validationRules.required(value) || validationRules.validId(value)
  },
  {
    field: 'display_order',
    validate: (value) => validationRules.validDisplayOrder(value)
  }
]

export const validateDrink = createValidator(drinkRules)

// Option Category Validation
const optionCategoryRules: ValidationRule<CreateOptionCategoryDto>[] = [
  {
    field: 'name',
    validate: (value) => validationRules.required(value) || validationRules.minLength(2)(value) || validationRules.maxLength(50)(value)
  },
  {
    field: 'description',
    validate: (value) => value ? validationRules.maxLength(200)(value) : null
  },
  {
    field: 'display_order',
    validate: (value) => validationRules.validDisplayOrder(value)
  }
]

export const validateOptionCategory = createValidator(optionCategoryRules)

// Option Value Validation
const optionValueRules: ValidationRule<CreateOptionValueDto>[] = [
  {
    field: 'name',
    validate: (value) => validationRules.required(value) || validationRules.minLength(1)(value) || validationRules.maxLength(50)(value)
  },
  {
    field: 'option_category_id',
    validate: (value) => validationRules.required(value) || validationRules.validId(value)
  },
  {
    field: 'display_order',
    validate: (value) => validationRules.validDisplayOrder(value)
  }
]

export const validateOptionValue = createValidator(optionValueRules)

// Business Logic Validation
export const businessValidation = {
  /**
   * Check if a category name is unique within the workspace
   */
  async validateUniqueCategoryName(
    name: string, 
    excludeId?: string,
    existingCategories: Array<{ id: string; name: string }> = []
  ): Promise<string | null> {
    const duplicate = existingCategories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId
    )
    
    return duplicate ? 'A category with this name already exists' : null
  },

  /**
   * Check if a drink name is unique within a category
   */
  async validateUniqueDrinkName(
    name: string, 
    categoryId: string,
    excludeId?: string,
    existingDrinks: Array<{ id: string; name: string; category_id: string }> = []
  ): Promise<string | null> {
    const duplicate = existingDrinks.find(drink => 
      drink.name.toLowerCase() === name.toLowerCase() && 
      drink.category_id === categoryId && 
      drink.id !== excludeId
    )
    
    return duplicate ? 'A drink with this name already exists in this category' : null
  },

  /**
   * Check if an option value is unique within a category
   */
  async validateUniqueOptionValue(
    name: string, 
    categoryId: string,
    excludeId?: string,
    existingValues: Array<{ id: string; name: string; option_category_id: string }> = []
  ): Promise<string | null> {
    const duplicate = existingValues.find(option => 
      option.name.toLowerCase() === name.toLowerCase() && 
      option.option_category_id === categoryId && 
      option.id !== excludeId
    )
    
    return duplicate ? 'This option value already exists in this category' : null
  },

  /**
   * Validate display order conflicts
   */
  validateDisplayOrderConflicts(
    newOrder: number,
    existingItems: Array<{ id: string; display_order: number }>,
    excludeId?: string
  ): string | null {
    const conflict = existingItems.find(item => 
      item.display_order === newOrder && item.id !== excludeId
    )
    
    return conflict ? 'Another item already uses this display order' : null
  }
}

// Form validation helpers
export const formValidation = {
  /**
   * Validate form data with business rules
   */
  async validateWithBusinessRules<T>(
    data: T,
    validator: (_data: T) => ValidationResult,
    businessRules: Array<() => Promise<string | null>> = []
  ): Promise<ValidationResult> {
    // Run basic validation
    const result = validator(data)
    
    if (!result.isValid) {
      return result
    }

    // Run business rules
    const businessErrors: Record<string, string> = {}
    
    for (const rule of businessRules) {
      try {
        const error = await rule()
        if (error) {
          businessErrors.business = error
        }
      } catch (err) {
        businessErrors.business = 'Validation failed due to server error'
      }
    }

    return {
      isValid: Object.keys(businessErrors).length === 0,
      errors: { ...result.errors, ...businessErrors },
      ...(result.warnings && { warnings: result.warnings })
    }
  },

  /**
   * Get first error message from validation result
   */
  getFirstError(result: ValidationResult): string | null {
    const errors = Object.values(result.errors)
    return errors.length > 0 ? errors[0] : null
  },

  /**
   * Check if specific field has error
   */
  hasFieldError(result: ValidationResult, field: string): boolean {
    return field in result.errors
  },

  /**
   * Get error for specific field
   */
  getFieldError(result: ValidationResult, field: string): string | undefined {
    return result.errors[field]
  }
}