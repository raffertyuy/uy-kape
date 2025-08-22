import { describe, it, expect } from 'vitest'
import type { 
  DrinkOption, 
  PasswordAuthState, 
  AppConfig, 
  OrderFormData, 
  DrinkFormData 
} from '../app.types'

describe('App Types', () => {
  describe('DrinkOption interface', () => {
    it('should have correct required properties', () => {
      const selectOption: DrinkOption = {
        label: 'Test Label',
        type: 'select',
        options: ['Option 1', 'Option 2'],
        required: true,
      }

      expect(selectOption.label).toBe('Test Label')
      expect(selectOption.type).toBe('select')
      expect(selectOption.options).toEqual(['Option 1', 'Option 2'])
      expect(selectOption.required).toBe(true)
    })

    it('should support all valid types', () => {
      const selectOption: DrinkOption = { label: 'Select', type: 'select' }
      const checkboxOption: DrinkOption = { label: 'Checkbox', type: 'checkbox' }
      const textOption: DrinkOption = { label: 'Text', type: 'text' }

      expect(selectOption.type).toBe('select')
      expect(checkboxOption.type).toBe('checkbox')
      expect(textOption.type).toBe('text')
    })

    it('should allow optional properties', () => {
      const minimalOption: DrinkOption = {
        label: 'Minimal',
        type: 'text',
      }

      // These properties should be optional
      expect(minimalOption.options).toBeUndefined()
      expect(minimalOption.required).toBeUndefined()
    })
  })

  describe('PasswordAuthState interface', () => {
    it('should have correct authentication states', () => {
      const unauthenticated: PasswordAuthState = {
        isAuthenticated: false,
      }

      const guestAuthenticated: PasswordAuthState = {
        isAuthenticated: true,
        role: 'guest',
      }

      const adminAuthenticated: PasswordAuthState = {
        isAuthenticated: true,
        role: 'admin',
      }

      expect(unauthenticated.isAuthenticated).toBe(false)
      expect(unauthenticated.role).toBeUndefined()

      expect(guestAuthenticated.isAuthenticated).toBe(true)
      expect(guestAuthenticated.role).toBe('guest')

      expect(adminAuthenticated.isAuthenticated).toBe(true)
      expect(adminAuthenticated.role).toBe('admin')
    })

    it('should allow undefined role when unauthenticated', () => {
      const authState: PasswordAuthState = {
        isAuthenticated: false,
        role: undefined,
      }

      expect(authState.isAuthenticated).toBe(false)
      expect(authState.role).toBeUndefined()
    })
  })

  describe('AppConfig interface', () => {
    it('should have required password properties', () => {
      const config: AppConfig = {
        guestPassword: 'guest123',
        adminPassword: 'admin456',
        waitTimePerOrder: 4,
      }

      expect(config.guestPassword).toBe('guest123')
      expect(config.adminPassword).toBe('admin456')
      expect(typeof config.guestPassword).toBe('string')
      expect(typeof config.adminPassword).toBe('string')
    })
  })

  describe('OrderFormData interface', () => {
    it('should have correct structure for order form', () => {
      const orderData: OrderFormData = {
        customerName: 'John Doe',
        selectedDrink: 'espresso',
        options: {
          size: 'Large',
          milk: 'Oat',
          hot: true,
        },
      }

      expect(orderData.customerName).toBe('John Doe')
      expect(orderData.selectedDrink).toBe('espresso')
      expect(orderData.options.size).toBe('Large')
      expect(orderData.options.milk).toBe('Oat')
      expect(orderData.options.hot).toBe(true)
    })

    it('should support various option types in options field', () => {
      const orderData: OrderFormData = {
        customerName: 'Jane Doe',
        selectedDrink: 'latte',
        options: {
          stringOption: 'String value',
          booleanOption: false,
          arrayOption: ['item1', 'item2'],
        },
      }

      expect(typeof orderData.options.stringOption).toBe('string')
      expect(typeof orderData.options.booleanOption).toBe('boolean')
      expect(Array.isArray(orderData.options.arrayOption)).toBe(true)
    })
  })

  describe('DrinkFormData interface', () => {
    it('should have correct structure for drink form', () => {
      const drinkData: DrinkFormData = {
        name: 'Cappuccino',
        options: {
          size: {
            label: 'Size',
            type: 'select',
            options: ['Small', 'Medium', 'Large'],
            required: true,
          },
          extra: {
            label: 'Extra shot',
            type: 'checkbox',
            required: false,
          },
        },
      }

      expect(drinkData.name).toBe('Cappuccino')
      expect(drinkData.options.size.label).toBe('Size')
      expect(drinkData.options.size.type).toBe('select')
      expect(drinkData.options.extra.type).toBe('checkbox')
    })

    it('should support empty options object', () => {
      const simpleDrink: DrinkFormData = {
        name: 'Black Coffee',
        options: {},
      }

      expect(simpleDrink.name).toBe('Black Coffee')
      expect(Object.keys(simpleDrink.options)).toHaveLength(0)
    })
  })

  describe('Type compatibility', () => {
    it('should allow DrinkOption to be used in DrinkFormData', () => {
      const sizeOption: DrinkOption = {
        label: 'Size',
        type: 'select',
        options: ['Small', 'Large'],
        required: true,
      }

      const drinkForm: DrinkFormData = {
        name: 'Test Drink',
        options: {
          size: sizeOption,
        },
      }

      expect(drinkForm.options.size).toEqual(sizeOption)
    })

    it('should maintain type safety for option types', () => {
      // This test ensures that TypeScript enforces the correct types
      const validOption: DrinkOption = {
        label: 'Valid',
        type: 'select', // Only 'select', 'checkbox', 'text' are allowed
      }

      expect(['select', 'checkbox', 'text']).toContain(validOption.type)
    })
  })
})