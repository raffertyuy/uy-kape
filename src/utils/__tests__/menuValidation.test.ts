import { describe, it, expect } from 'vitest'
import {
  validateDrinkCategory,
  validateDrink,
  validateOptionCategory,
  validateOptionValue,
  validationRules
} from '@/utils/menuValidation'
import type {
  CreateDrinkCategoryDto,
  CreateDrinkDto,
  CreateOptionCategoryDto,
  CreateOptionValueDto
} from '@/types/menu.types'

describe('Menu Validation Utilities', () => {
  describe('validateDrinkCategory', () => {
    it('validates a valid drink category', () => {
      const validCategory: CreateDrinkCategoryDto = {
        name: 'Coffee',
        description: 'Hot coffee drinks',
        display_order: 1,
        is_active: true
      }

      const result = validateDrinkCategory(validCategory)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('validates required name field', () => {
      const invalidCategory: CreateDrinkCategoryDto = {
        name: '',
        description: 'Test description',
        display_order: 1,
        is_active: true
      }

      const result = validateDrinkCategory(invalidCategory)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    it('allows null description', () => {
      const validCategory: CreateDrinkCategoryDto = {
        name: 'Test Category',
        description: null,
        display_order: 1,
        is_active: true
      }

      const result = validateDrinkCategory(validCategory)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })
  })

  describe('validateDrink', () => {
    it('validates a valid drink', () => {
      const validDrink: CreateDrinkDto = {
        name: 'Espresso',
        description: 'Strong coffee shot',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        display_order: 1,
        is_active: true
      }

      const result = validateDrink(validDrink)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('validates required name field', () => {
      const invalidDrink: CreateDrinkDto = {
        name: '',
        description: 'Test description',
        category_id: 'cat-1',
        display_order: 1,
        is_active: true
      }

      const result = validateDrink(invalidDrink)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    it('validates required category_id', () => {
      const invalidDrink: CreateDrinkDto = {
        name: 'Test Drink',
        description: 'Test description',
        category_id: '',
        display_order: 1,
        is_active: true
      }

      const result = validateDrink(invalidDrink)
      expect(result.isValid).toBe(false)
      expect(result.errors.category_id).toBeDefined()
    })
  })

  describe('validateOptionCategory', () => {
    it('validates a valid option category', () => {
      const validOptionCategory: CreateOptionCategoryDto = {
        name: 'Size',
        description: 'Drink sizes',
        is_required: true,
        display_order: 1
      }

      const result = validateOptionCategory(validOptionCategory)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('validates required name field', () => {
      const invalidOptionCategory: CreateOptionCategoryDto = {
        name: '',
        description: 'Drink sizes',
        is_required: true,
        display_order: 1
      }

      const result = validateOptionCategory(invalidOptionCategory)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })
  })

  describe('validateOptionValue', () => {
    it('validates a valid option value', () => {
      const validOptionValue: CreateOptionValueDto = {
        option_category_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Large',
        description: 'Large size',
        display_order: 1,
        is_active: true
      }

      const result = validateOptionValue(validOptionValue)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('validates required option_category_id', () => {
      const invalidOptionValue: CreateOptionValueDto = {
        option_category_id: '',
        name: 'Large',
        description: 'Large size',
        display_order: 1,
        is_active: true
      }

      const result = validateOptionValue(invalidOptionValue)
      expect(result.isValid).toBe(false)
      expect(result.errors.option_category_id).toBeDefined()
    })

    it('validates required name field', () => {
      const invalidOptionValue: CreateOptionValueDto = {
        option_category_id: 'opt-cat-1',
        name: '',
        description: 'Large size',
        display_order: 1,
        is_active: true
      }

      const result = validateOptionValue(invalidOptionValue)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })
  })

  describe('validationRules', () => {
    describe('required', () => {
      it('returns error for empty string', () => {
        const result = validationRules.required('')
        expect(result).toBe('This field is required')
      })

      it('returns error for null', () => {
        const result = validationRules.required(null)
        expect(result).toBe('This field is required')
      })

      it('returns error for undefined', () => {
        const result = validationRules.required(undefined)
        expect(result).toBe('This field is required')
      })

      it('returns null for valid value', () => {
        const result = validationRules.required('test')
        expect(result).toBe(null)
      })
    })

    describe('minLength', () => {
      it('returns error for string too short', () => {
        const validator = validationRules.minLength(3)
        const result = validator('ab')
        expect(result).toBe('Must be at least 3 characters long')
      })

      it('returns null for string of correct length', () => {
        const validator = validationRules.minLength(3)
        const result = validator('abc')
        expect(result).toBe(null)
      })

      it('returns null for longer string', () => {
        const validator = validationRules.minLength(3)
        const result = validator('abcdef')
        expect(result).toBe(null)
      })
    })

    describe('maxLength', () => {
      it('returns error for string too long', () => {
        const validator = validationRules.maxLength(5)
        const result = validator('abcdef')
        expect(result).toBe('Must be at most 5 characters long')
      })

      it('returns null for string of correct length', () => {
        const validator = validationRules.maxLength(5)
        const result = validator('abcde')
        expect(result).toBe(null)
      })

      it('returns null for shorter string', () => {
        const validator = validationRules.maxLength(5)
        const result = validator('abc')
        expect(result).toBe(null)
      })
    })

    describe('positiveInteger', () => {
      it('returns error for negative number', () => {
        const result = validationRules.positiveInteger(-1)
        expect(result).toBe('Must be a positive integer')
      })

      it('returns error for non-integer', () => {
        const result = validationRules.positiveInteger(1.5)
        expect(result).toBe('Must be a positive integer')
      })

      it('returns null for positive integer', () => {
        const result = validationRules.positiveInteger(5)
        expect(result).toBe(null)
      })

      it('returns null for zero', () => {
        const result = validationRules.positiveInteger(0)
        expect(result).toBe(null)
      })
    })

    describe('validDisplayOrder', () => {
      it('returns error for negative number', () => {
        const result = validationRules.validDisplayOrder(-1)
        expect(result).toBe('Display order must be between 0 and 999')
      })

      it('returns error for number too large', () => {
        const result = validationRules.validDisplayOrder(1000)
        expect(result).toBe('Display order must be between 0 and 999')
      })

      it('returns null for valid number', () => {
        const result = validationRules.validDisplayOrder(5)
        expect(result).toBe(null)
      })
    })
  })
})