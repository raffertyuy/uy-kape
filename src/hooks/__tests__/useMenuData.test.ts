import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDrinkCategories, useDrinks, useCreateDrinkCategory, useUpdateDrinkCategory, useDeleteDrinkCategory } from '@/hooks/useMenuData'
import * as menuService from '@/services/menuService'

// Mock the menu service
vi.mock('@/services/menuService', () => ({
  drinkCategoriesService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  drinksService: {
    getAll: vi.fn(),
    getByCategory: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock Supabase real-time
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => Promise.resolve())
      })),
      unsubscribe: vi.fn()
    }))
  }
}))

describe('useMenuData hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDrinkCategories', () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Coffee',
        description: 'Hot coffee drinks',
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Tea',
        description: 'Hot tea drinks',
        display_order: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    it('should fetch and return drink categories', async () => {
      vi.mocked(menuService.drinkCategoriesService.getAll).mockResolvedValue(mockCategories)

      const { result } = renderHook(() => useDrinkCategories())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockCategories)
      expect(result.current.error).toBeNull()
      expect(menuService.drinkCategoriesService.getAll).toHaveBeenCalledTimes(1)
    })

    it('should handle errors when fetching categories', async () => {
      const errorMessage = 'Failed to fetch categories'
      vi.mocked(menuService.drinkCategoriesService.getAll).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDrinkCategories())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('useDrinks', () => {
    const mockDrinks = [
      {
        id: '1',
        name: 'Espresso',
        description: 'Strong coffee shot',
        category_id: 'cat1',
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    it('should fetch and return drinks', async () => {
      vi.mocked(menuService.drinksService.getAll).mockResolvedValue(mockDrinks)

      const { result } = renderHook(() => useDrinks())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockDrinks)
      expect(menuService.drinksService.getAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('useCreateDrinkCategory', () => {
    const newCategory = {
      name: 'Smoothies',
      description: 'Fruit smoothies',
      display_order: 3,
      is_active: true
    }

    const createdCategory = {
      ...newCategory,
      id: '3',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    it('should create a new category successfully', async () => {
      vi.mocked(menuService.drinkCategoriesService.create).mockResolvedValue(createdCategory)

      const { result } = renderHook(() => useCreateDrinkCategory())

      expect(result.current.state).toBe('idle')

      const promise = result.current.createCategory(newCategory)

      expect(result.current.state).toBe('loading')

      const resultCategory = await promise

      await waitFor(() => {
        expect(result.current.state).toBe('success')
      })

      expect(resultCategory).toEqual(createdCategory)
      expect(result.current.data).toEqual(createdCategory)
      expect(menuService.drinkCategoriesService.create).toHaveBeenCalledWith(newCategory)
    })

    it('should handle creation errors', async () => {
      const errorMessage = 'Name is required'
      vi.mocked(menuService.drinkCategoriesService.create).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCreateDrinkCategory())

      const promise = result.current.createCategory(newCategory)

      await expect(promise).rejects.toThrow(errorMessage)

      await waitFor(() => {
        expect(result.current.state).toBe('error')
      })

      expect(result.current.error?.message).toBe(errorMessage)
    })
  })

  describe('useUpdateDrinkCategory', () => {
    const updateData = {
      name: 'Updated Coffee',
      description: 'Updated description'
    }

    const updatedCategory = {
      id: '1',
      name: 'Updated Coffee',
      description: 'Updated description',
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T12:00:00Z'
    }

    it('should update a category successfully', async () => {
      vi.mocked(menuService.drinkCategoriesService.update).mockResolvedValue(updatedCategory)

      const { result } = renderHook(() => useUpdateDrinkCategory())

      const promise = result.current.updateCategory('1', updateData)
      const resultCategory = await promise

      await waitFor(() => {
        expect(result.current.state).toBe('success')
      })

      expect(resultCategory).toEqual(updatedCategory)
      expect(menuService.drinkCategoriesService.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should handle update errors', async () => {
      const errorMessage = 'Category not found'
      vi.mocked(menuService.drinkCategoriesService.update).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUpdateDrinkCategory())

      const promise = result.current.updateCategory('999', updateData)

      await expect(promise).rejects.toThrow(errorMessage)

      await waitFor(() => {
        expect(result.current.state).toBe('error')
      })
    })
  })

  describe('useDeleteDrinkCategory', () => {
    it('should delete a category successfully', async () => {
      vi.mocked(menuService.drinkCategoriesService.delete).mockResolvedValue()

      const { result } = renderHook(() => useDeleteDrinkCategory())

      const promise = result.current.deleteCategory('1')

      await promise

      await waitFor(() => {
        expect(result.current.state).toBe('success')
      })

      expect(menuService.drinkCategoriesService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle deletion errors', async () => {
      const errorMessage = 'Cannot delete category with existing drinks'
      vi.mocked(menuService.drinkCategoriesService.delete).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDeleteDrinkCategory())

      const promise = result.current.deleteCategory('1')

      await expect(promise).rejects.toThrow(errorMessage)

      await waitFor(() => {
        expect(result.current.state).toBe('error')
      })
    })
  })
})