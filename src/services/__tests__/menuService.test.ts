import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  drinkCategoriesService,
  drinksService, 
  optionCategoriesService,
  optionValuesService
} from '../menuService'

// Mock the Supabase client to simulate connection failure (forcing mock data usage)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: undefined // This will cause testSupabaseConnection to fail
      }))
    }))
  }
}))

describe('menuService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('drinkCategoriesService', () => {
    it('should get all categories (using mock data)', async () => {
      const result = await drinkCategoriesService.getAll()
      
      // Verify the structure and content of mock data
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      
      // Check that first category has expected structure
      const firstCategory = result[0]
      expect(firstCategory).toHaveProperty('id')
      expect(firstCategory).toHaveProperty('name')
      expect(firstCategory).toHaveProperty('description')
      expect(firstCategory).toHaveProperty('display_order')
      expect(firstCategory).toHaveProperty('is_active')
      expect(firstCategory).toHaveProperty('created_at')
      expect(firstCategory).toHaveProperty('updated_at')
      
      // Verify specific content matches mock data
      expect(firstCategory.name).toBe('Coffee')
      expect(firstCategory.description).toBe('Espresso-based and black coffee drinks')
    })

    it('should create a new category', async () => {
      const newCategory = {
        name: 'New Category',
        description: 'A new test category',
        display_order: 5,
        is_active: true
      }

      const result = await drinkCategoriesService.create(newCategory)
      
      // Verify result structure
      expect(result).toHaveProperty('id')
      expect(result.name).toBe(newCategory.name)
      expect(result.description).toBe(newCategory.description)
      expect(result.display_order).toBe(newCategory.display_order)
      expect(result.is_active).toBe(newCategory.is_active)
      expect(result).toHaveProperty('created_at')
      expect(result).toHaveProperty('updated_at')
      
      // Verify ID is generated (string type for mock service)
      expect(typeof result.id).toBe('string')
      expect(result.id.length).toBeGreaterThan(0)
    })

    it('should update an existing category', async () => {
      const updateData = {
        name: 'Updated Coffee',
        description: 'Updated description'
      }

      const result = await drinkCategoriesService.update('1', updateData)
      
      // Verify updated fields
      expect(result.name).toBe(updateData.name)
      expect(result.description).toBe(updateData.description)
      expect(result.id).toBe('1')
    })

    it('should handle delete category with existing drinks', async () => {
      // Try to delete category '1' which has drinks
      await expect(drinkCategoriesService.delete('1')).rejects.toThrow('Cannot delete category with existing drinks')
    })
  })

  describe('drinksService', () => {
    it('should get all drinks (using mock data)', async () => {
      const result = await drinksService.getAll()
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      
      // Check structure of first drink
      const firstDrink = result[0]
      expect(firstDrink).toHaveProperty('id')
      expect(firstDrink).toHaveProperty('name')
      expect(firstDrink).toHaveProperty('description')
      expect(firstDrink).toHaveProperty('category_id')
      expect(firstDrink).toHaveProperty('display_order')
      expect(firstDrink).toHaveProperty('is_active')
    })

    it('should get drinks by category', async () => {
      const result = await drinksService.getByCategory('1')
      
      expect(Array.isArray(result)).toBe(true)
      // Should return drinks filtered by category
      result.forEach(drink => {
        expect(drink.category_id).toBe('1')
      })
    })

    it('should create a new drink', async () => {
      const newDrink = {
        name: 'Test Drink',
        description: 'A test drink',
        category_id: '1',
        display_order: 10,
        is_active: true
      }

      const result = await drinksService.create(newDrink)
      
      // Verify result structure
      expect(result).toHaveProperty('id')
      expect(result.name).toBe(newDrink.name)
      expect(result.description).toBe(newDrink.description)
      expect(result.category_id).toBe(newDrink.category_id)
      expect(typeof result.id).toBe('string')
    })
  })

  describe('optionCategoriesService', () => {
    it('should get all option categories (using mock data)', async () => {
      const result = await optionCategoriesService.getAll()
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      
      // Check structure
      const firstOption = result[0]
      expect(firstOption).toHaveProperty('id')
      expect(firstOption).toHaveProperty('name')
      expect(firstOption).toHaveProperty('description')
      expect(firstOption).toHaveProperty('is_required')
      expect(firstOption).toHaveProperty('display_order')
    })

    it('should create a new option category', async () => {
      const newOptionCategory = {
        name: 'Test Option',
        description: 'A test option category',
        is_required: false,
        display_order: 5
      }

      const result = await optionCategoriesService.create(newOptionCategory)
      
      expect(result.name).toBe(newOptionCategory.name)
      expect(result.description).toBe(newOptionCategory.description)
      expect(result.is_required).toBe(newOptionCategory.is_required)
      expect(typeof result.id).toBe('string')
    })
  })

  describe('optionValuesService', () => {
    it('should get values by category', async () => {
      const result = await optionValuesService.getByCategory('opt1')
      
      expect(Array.isArray(result)).toBe(true)
      // All values should belong to the specified category
      result.forEach(value => {
        expect(value.option_category_id).toBe('opt1')
      })
    })

    it('should create a new option value', async () => {
      const newOptionValue = {
        name: 'Test Value',
        description: 'A test option value',
        option_category_id: 'opt1',
        display_order: 3,
        is_active: true
      }

      const result = await optionValuesService.create(newOptionValue)
      
      expect(result.name).toBe(newOptionValue.name)
      expect(result.option_category_id).toBe(newOptionValue.option_category_id)
      expect(typeof result.id).toBe('string')
    })

    it('should handle validation - empty name should be allowed in mock service', async () => {
      // Note: Mock service doesn't enforce validation like the real service would
      const invalidOptionValue = {
        name: '',
        description: null,
        option_category_id: 'opt1',
        display_order: 1,
        is_active: true
      }

      // Mock service allows this (no validation), so it should succeed
      const result = await optionValuesService.create(invalidOptionValue)
      expect(result).toHaveProperty('id')
      expect(result.name).toBe('')
    })
  })
})