import { describe, it, expect } from 'vitest'
import { 
  appConfig, 
  APP_NAME, 
  APP_DESCRIPTION, 
  ORDER_STATUS_LABELS, 
  DEFAULT_DRINK_OPTIONS 
} from '../app.config'

describe('App Configuration', () => {
  describe('appConfig', () => {
    it('should load passwords correctly (either from env or defaults)', () => {
      // Test that passwords are loaded and are non-empty strings
      expect(typeof appConfig.guestPassword).toBe('string')
      expect(typeof appConfig.adminPassword).toBe('string')
      expect(appConfig.guestPassword.length).toBeGreaterThan(0)
      expect(appConfig.adminPassword.length).toBeGreaterThan(0)
    })

    it('should have required password properties', () => {
      expect(appConfig).toHaveProperty('guestPassword')
      expect(appConfig).toHaveProperty('adminPassword')
      expect(typeof appConfig.guestPassword).toBe('string')
      expect(typeof appConfig.adminPassword).toBe('string')
    })

    it('should have non-empty password values', () => {
      expect(appConfig.guestPassword.length).toBeGreaterThan(0)
      expect(appConfig.adminPassword.length).toBeGreaterThan(0)
    })
  })

  describe('Application Constants', () => {
    it('should export correct APP_NAME', () => {
      expect(APP_NAME).toBe('Uy, Kape!')
      expect(typeof APP_NAME).toBe('string')
    })

    it('should export correct APP_DESCRIPTION', () => {
      expect(APP_DESCRIPTION).toBe('Your friend\'s coffee ordering system')
      expect(typeof APP_DESCRIPTION).toBe('string')
    })

    it('should export correct ORDER_STATUS_LABELS', () => {
      expect(ORDER_STATUS_LABELS).toEqual({
        pending: 'Pending',
        preparing: 'Preparing',
        ready: 'Ready',
        completed: 'Completed',
        cancelled: 'Cancelled',
      })

      // Ensure all values are strings
      Object.values(ORDER_STATUS_LABELS).forEach(label => {
        expect(typeof label).toBe('string')
      })
    })

    it('should have all required order status labels', () => {
      const expectedStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled']
      expectedStatuses.forEach(status => {
        expect(ORDER_STATUS_LABELS).toHaveProperty(status)
      })
    })
  })

  describe('DEFAULT_DRINK_OPTIONS', () => {
    it('should have all required drink option categories', () => {
      expect(DEFAULT_DRINK_OPTIONS).toHaveProperty('size')
      expect(DEFAULT_DRINK_OPTIONS).toHaveProperty('milk')
      expect(DEFAULT_DRINK_OPTIONS).toHaveProperty('sugar')
      expect(DEFAULT_DRINK_OPTIONS).toHaveProperty('hot')
    })

    it('should have correctly structured size option', () => {
      const sizeOption = DEFAULT_DRINK_OPTIONS.size
      expect(sizeOption.label).toBe('Size')
      expect(sizeOption.type).toBe('select')
      expect(sizeOption.options).toEqual(['Small', 'Medium', 'Large'])
      expect(sizeOption.required).toBe(true)
    })

    it('should have correctly structured milk option', () => {
      const milkOption = DEFAULT_DRINK_OPTIONS.milk
      expect(milkOption.label).toBe('Milk')
      expect(milkOption.type).toBe('select')
      expect(milkOption.options).toEqual(['None', 'Regular', 'Oat', 'Almond', 'Soy'])
      expect(milkOption.required).toBe(false)
    })

    it('should have correctly structured sugar option', () => {
      const sugarOption = DEFAULT_DRINK_OPTIONS.sugar
      expect(sugarOption.label).toBe('Sugar')
      expect(sugarOption.type).toBe('select')
      expect(sugarOption.options).toEqual(['None', '1 tsp', '2 tsp', '3 tsp'])
      expect(sugarOption.required).toBe(false)
    })

    it('should have correctly structured hot option', () => {
      const hotOption = DEFAULT_DRINK_OPTIONS.hot
      expect(hotOption.label).toBe('Temperature')
      expect(hotOption.type).toBe('checkbox')
      expect(hotOption.required).toBe(false)
      // checkbox type should not have options property
      expect('options' in hotOption).toBe(false)
    })

    it('should have consistent option structure', () => {
      Object.values(DEFAULT_DRINK_OPTIONS).forEach(option => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('type')
        expect(option).toHaveProperty('required')
        expect(typeof option.label).toBe('string')
        expect(['select', 'checkbox', 'text']).toContain(option.type)
        expect(typeof option.required).toBe('boolean')
      })
    })
  })
})