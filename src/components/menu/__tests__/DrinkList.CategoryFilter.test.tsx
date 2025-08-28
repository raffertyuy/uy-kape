import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../../../tests/config/test-utils'
import { DrinkList } from '@/components/menu/DrinkList'
import type { Drink, DrinkCategory } from '@/types/menu.types'

describe('DrinkList - Category Name Filter', () => {
  const mockCategories: DrinkCategory[] = [
    { 
      id: '1', 
      name: 'Coffee', 
      display_order: 1, 
      is_active: true, 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z',
      description: 'Espresso-based drinks'
    },
    { 
      id: '2', 
      name: 'Special Coffee', 
      display_order: 2, 
      is_active: true, 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z',
      description: 'Premium coffee drinks'
    },
    { 
      id: '3', 
      name: 'Tea', 
      display_order: 3, 
      is_active: true, 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z',
      description: 'Hot and cold tea beverages'
    }
  ]

  const mockDrinks: Drink[] = [
    { 
      id: '1', 
      name: 'Espresso', 
      category_id: '1', 
      display_order: 1, 
      is_active: true, 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z',
      description: 'Pure espresso shot',
      preparation_time_minutes: 3
    },
    { 
      id: '2', 
      name: 'Latte', 
      category_id: '1', 
      display_order: 2, 
      is_active: true, 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z',
      description: 'Espresso with steamed milk',
      preparation_time_minutes: 5
    },
    { 
      id: '3', 
      name: 'Green Tea', 
      category_id: '3', 
      display_order: 1, 
      is_active: true, 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z',
      description: 'Traditional green tea',
      preparation_time_minutes: 3
    },
    { 
      id: '4', 
      name: 'Affogato', 
      category_id: '2', 
      display_order: 1, 
      is_active: true, 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z',
      description: 'Ice cream with espresso shot',
      preparation_time_minutes: 7
    }
  ]

  const defaultProps = {
    drinks: mockDrinks,
    categories: mockCategories,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onManageOptions: vi.fn(),
    onCategoryFilter: vi.fn(),
    showOptionsPreview: false,
    isLoading: false,
    onDataChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter drinks by category name', () => {
    render(
      <DrinkList 
        {...defaultProps} 
        selectedCategoryName="Coffee"
      />
    )

    // Should show only drinks from Coffee category
    expect(screen.getByText('Espresso')).toBeInTheDocument()
    expect(screen.getByText('Latte')).toBeInTheDocument()
    
    // Should not show drinks from other categories
    expect(screen.queryByText('Green Tea')).not.toBeInTheDocument()
    expect(screen.queryByText('Affogato')).not.toBeInTheDocument()
  })

  it('should show all drinks when no category filter is applied', () => {
    render(<DrinkList {...defaultProps} />)

    // Should show all drinks
    expect(screen.getByText('Espresso')).toBeInTheDocument()
    expect(screen.getByText('Latte')).toBeInTheDocument()
    expect(screen.getByText('Green Tea')).toBeInTheDocument()
    expect(screen.getByText('Affogato')).toBeInTheDocument()
  })

  it('should filter drinks by Special Coffee category', () => {
    render(
      <DrinkList 
        {...defaultProps} 
        selectedCategoryName="Special Coffee"
      />
    )

    // Should show only drinks from Special Coffee category
    expect(screen.getByText('Affogato')).toBeInTheDocument()
    
    // Should not show drinks from other categories
    expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
    expect(screen.queryByText('Latte')).not.toBeInTheDocument()
    expect(screen.queryByText('Green Tea')).not.toBeInTheDocument()
  })

  it('should handle non-existent category gracefully', () => {
    render(
      <DrinkList 
        {...defaultProps} 
        selectedCategoryName="NonExistentCategory"
      />
    )

    // Should show no drinks
    expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
    expect(screen.queryByText('Latte')).not.toBeInTheDocument()
    expect(screen.queryByText('Green Tea')).not.toBeInTheDocument()
    expect(screen.queryByText('Affogato')).not.toBeInTheDocument()

    // Should show "No drinks found" message
    expect(screen.getByText('No drinks found')).toBeInTheDocument()
  })

  it('should populate category dropdown with category names', () => {
    render(<DrinkList {...defaultProps} />)

    // Find the category filter dropdown
    const categorySelect = screen.getByLabelText('Filter by Category')
    expect(categorySelect).toBeInTheDocument()

    // Check that options contain category names
    expect(screen.getByRole('option', { name: 'All Categories' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Coffee' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Special Coffee' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Tea' })).toBeInTheDocument()
  })

  it('should call onCategoryFilter with category name when selection changes', () => {
    render(<DrinkList {...defaultProps} />)

    const categorySelect = screen.getByLabelText('Filter by Category')
    
    // Change selection to Coffee
    fireEvent.change(categorySelect, { target: { value: 'Coffee' } })
    
    expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith('Coffee')
  })

  it('should call onCategoryFilter with undefined when "All Categories" is selected', () => {
    render(
      <DrinkList 
        {...defaultProps} 
        selectedCategoryName="Coffee"
      />
    )

    const categorySelect = screen.getByLabelText('Filter by Category')
    
    // Change selection back to All Categories
    fireEvent.change(categorySelect, { target: { value: '' } })
    
    expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith(undefined)
  })

  it('should show correct category name in active filter display', () => {
    render(
      <DrinkList 
        {...defaultProps} 
        selectedCategoryName="Special Coffee"
      />
    )

    // Should display the category name in active filters
    expect(screen.getByText('Active filters:')).toBeInTheDocument()
    expect(screen.getByText('Category: Special Coffee')).toBeInTheDocument()
  })

  it('should call onCategoryFilter when clearing category filter', () => {
    render(
      <DrinkList 
        {...defaultProps} 
        selectedCategoryName="Coffee"
      />
    )

    // Find and click the clear category filter button
    const clearButton = screen.getByLabelText('Remove category filter')
    fireEvent.click(clearButton)
    
    expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith(undefined)
  })

  it('should combine category filter with search query', () => {
    render(
      <DrinkList 
        {...defaultProps} 
        selectedCategoryName="Coffee"
        searchQuery="Latte"
      />
    )

    // Should show only Latte (from Coffee category matching search)
    expect(screen.getByText('Latte')).toBeInTheDocument()
    expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
  })

  it('should handle case sensitivity in category names', () => {
    render(
      <DrinkList 
        {...defaultProps} 
        selectedCategoryName="coffee" // lowercase
      />
    )

    // Should not match because category filtering is case-sensitive
    expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
    expect(screen.queryByText('Latte')).not.toBeInTheDocument()
    expect(screen.getByText('No drinks found')).toBeInTheDocument()
  })
})