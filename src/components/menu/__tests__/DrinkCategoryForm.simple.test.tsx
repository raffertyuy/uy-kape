import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { DrinkCategoryForm } from '@/components/menu/DrinkCategoryForm'

// Mock the hooks
vi.mock('@/hooks/useMenuData', () => ({
  useDrinkCategories: vi.fn(() => ({
    data: [],
    isLoading: false
  })),
  useCreateDrinkCategory: vi.fn(() => ({
    createCategory: vi.fn(),
    state: 'idle' as const
  })),
  useUpdateDrinkCategory: vi.fn(() => ({
    updateCategory: vi.fn(),
    state: 'idle' as const
  }))
}))

const mockOnSubmit = vi.fn()
const mockOnCancel = vi.fn()

describe('DrinkCategoryForm - Simple Tests', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(
        <DrinkCategoryForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )
    }).not.toThrow()
  })

  it('should be truthy', () => {
    expect(DrinkCategoryForm).toBeTruthy()
  })
})