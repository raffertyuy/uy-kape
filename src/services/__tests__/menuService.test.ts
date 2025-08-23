import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  drinkCategoriesService, 
  drinksService, 
  optionCategoriesService, 
  optionValuesService 
} from '@/services/menuService'
import { supabase } from '@/lib/supabase'

describe('menuService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('drinkCategoriesService', () => {
    const mockCategory = {
      id: '1',
      name: 'Coffee',
      description: 'Hot coffee drinks',
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    it('should get all categories', async () => {
      const mockData = [mockCategory]
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockData,
            error: null
          }))
        }))
      })) as any

      const result = await drinkCategoriesService.getAll()
      expect(result).toEqual(mockData)
    })

    it('should handle errors when getting categories', async () => {
      const mockError = { message: 'Database error' }
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: mockError
          }))
        }))
      })) as any

      await expect(drinkCategoriesService.getAll()).rejects.toThrow('Database error')
    })

    it('should create a new category', async () => {
      const newCategory = {
        name: 'Tea',
        description: 'Hot tea drinks',
        display_order: 2,
        is_active: true
      }

      vi.mocked(supabase).from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { ...newCategory, id: '2', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
              error: null
            }))
          }))
        }))
      })) as any

      const result = await drinkCategoriesService.create(newCategory)
      expect(result.name).toBe(newCategory.name)
      expect(result.id).toBe('2')
    })

    it('should update an existing category', async () => {
      const updates = { name: 'Updated Coffee', description: 'Updated description' }
      const updatedCategory = { ...mockCategory, ...updates }

      vi.mocked(supabase).from = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: updatedCategory,
                error: null
              }))
            }))
          }))
        }))
      })) as any

      const result = await drinkCategoriesService.update('1', updates)
      expect(result.name).toBe('Updated Coffee')
      expect(result.description).toBe('Updated description')
    })

    it('should delete a category', async () => {
      vi.mocked(supabase).from = vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })) as any

      await expect(drinkCategoriesService.delete('1')).resolves.not.toThrow()
    })
  })

  describe('drinksService', () => {
    const mockDrink = {
      id: '1',
      name: 'Espresso',
      description: 'Strong coffee shot',
      category_id: 'cat1',
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    it('should get all drinks', async () => {
      const mockData = [mockDrink]
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockData,
            error: null
          }))
        }))
      })) as any

      const result = await drinksService.getAll()
      expect(result).toEqual(mockData)
    })

    it('should get drinks by category', async () => {
      const mockData = [mockDrink]
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockData,
              error: null
            }))
          }))
        }))
      })) as any

      const result = await drinksService.getByCategory('cat1')
      expect(result).toEqual(mockData)
    })

    it('should create a new drink', async () => {
      const newDrink = {
        name: 'Latte',
        description: 'Coffee with milk',
        category_id: 'cat1',
        display_order: 2,
        is_active: true
      }

      vi.mocked(supabase).from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { ...newDrink, id: '2', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
              error: null
            }))
          }))
        }))
      })) as any

      const result = await drinksService.create(newDrink)
      expect(result.name).toBe(newDrink.name)
      expect(result.id).toBe('2')
    })
  })

  describe('optionCategoriesService', () => {
    const mockOptionCategory = {
      id: '1',
      name: 'Size',
      description: 'Drink sizes',
      is_required: true,
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    it('should get all option categories', async () => {
      const mockData = [mockOptionCategory]
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockData,
            error: null
          }))
        }))
      })) as any

      const result = await optionCategoriesService.getAll()
      expect(result).toEqual(mockData)
    })

    it('should create a new option category', async () => {
      const newOptionCategory = {
        name: 'Milk Type',
        description: 'Types of milk',
        is_required: false,
        display_order: 2,
        is_active: true
      }

      vi.mocked(supabase).from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { ...newOptionCategory, id: '2', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
              error: null
            }))
          }))
        }))
      })) as any

      const result = await optionCategoriesService.create(newOptionCategory)
      expect(result.name).toBe(newOptionCategory.name)
      expect(result.id).toBe('2')
    })
  })

  describe('optionValuesService', () => {
    const mockOptionValue = {
      id: '1',
      name: 'Small',
      description: '8oz',
      option_category_id: 'opt1',
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    it('should get values by category', async () => {
      const mockData = [mockOptionValue]
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockData,
              error: null
            }))
          }))
        }))
      })) as any

      const result = await optionValuesService.getByCategory('opt1')
      expect(result).toEqual(mockData)
    })

    it('should create a new option value', async () => {
      const newOptionValue = {
        name: 'Medium',
        description: '12oz',
        option_category_id: 'opt1',
        display_order: 2,
        is_active: true
      }

      vi.mocked(supabase).from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { ...newOptionValue, id: '2', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
              error: null
            }))
          }))
        }))
      })) as any

      const result = await optionValuesService.create(newOptionValue)
      expect(result.name).toBe(newOptionValue.name)
      expect(result.id).toBe('2')
    })

    it('should handle validation errors', async () => {
      const mockError = { message: 'name is required' }
      vi.mocked(supabase).from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: mockError
            }))
          }))
        }))
      })) as any

      const invalidOptionValue = {
        name: '',
        option_category_id: 'opt1',
        display_order: 1,
        is_active: true
      }

      await expect(optionValuesService.create(invalidOptionValue as any)).rejects.toThrow('name is required')
    })
  })
})