import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, waitFor } from '../../../../tests/config/test-utils'
import userEvent from '@testing-library/user-event'
import type { Drink, DrinkCategory } from '@/types/menu.types'

// Component variables
let DrinkList: any

describe('DrinkList', () => {
  beforeAll(async () => {
    // Import component after setup
    const drinkListModule = await import('../DrinkList')
    DrinkList = drinkListModule.DrinkList
  })

  const mockCategories: DrinkCategory[] = [
    {
      id: 'premium-coffee',
      name: 'Premium Coffee',
      description: 'High-quality coffee drinks',
      is_active: true,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'kids-drinks',
      name: 'Kids Drinks',
      description: 'Drinks for children',
      is_active: true,
      display_order: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'special-drinks',
      name: 'Special Drinks',
      description: 'Specialty beverages',
      is_active: true,
      display_order: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  const mockDrinks: Drink[] = [
    {
      id: 'espresso',
      name: 'Espresso',
      description: 'Strong coffee shot',
      is_active: true,
      display_order: 1,
      category_id: 'premium-coffee',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'cappuccino',
      name: 'Cappuccino',
      description: 'Coffee with steamed milk and foam',
      is_active: true,
      display_order: 2,
      category_id: 'premium-coffee',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'milo',
      name: 'Milo',
      description: 'Chocolate malt drink',
      is_active: true,
      display_order: 3,
      category_id: 'kids-drinks',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'babyccino',
      name: 'Babyccino',
      description: 'Frothed milk drink for children',
      is_active: true,
      display_order: 4,
      category_id: 'kids-drinks',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'affogato',
      name: 'Affogato',
      description: 'Ice cream with espresso shot',
      is_active: true,
      display_order: 5,
      category_id: 'special-drinks',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
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
    isLoading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders all drinks when no filters are applied', () => {
      render(<DrinkList {...defaultProps} />)

      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('Cappuccino')).toBeInTheDocument()
      expect(screen.getByText('Milo')).toBeInTheDocument()
      expect(screen.getByText('Babyccino')).toBeInTheDocument()
      expect(screen.getByText('Affogato')).toBeInTheDocument()
    })

    it('renders category filter dropdown with all categories', () => {
      render(<DrinkList {...defaultProps} />)

      const categoryFilter = screen.getByRole('combobox', { name: /filter by category/i })
      expect(categoryFilter).toBeInTheDocument()

      // Check that all categories are in the dropdown
      expect(screen.getByRole('option', { name: 'All Categories' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Premium Coffee' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Kids Drinks' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Special Drinks' })).toBeInTheDocument()
    })

    it('renders search input', () => {
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', 'Search by name or description...')
    })

    it('renders view mode toggle buttons', () => {
      render(<DrinkList {...defaultProps} />)

      expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument()
    })

    it('renders add drink button', () => {
      render(<DrinkList {...defaultProps} />)

      expect(screen.getByRole('button', { name: /add new drink/i })).toBeInTheDocument()
    })
  })

  describe('Category Filtering', () => {
    it('filters drinks by selected category', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const categoryFilter = screen.getByRole('combobox', { name: /filter by category/i })
      
      // Select Kids Drinks category
      await user.selectOptions(categoryFilter, 'kids-drinks')

      // Should call onCategoryFilter with the selected category ID
      expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith('kids-drinks')
    })

    it('shows only drinks from selected category when selectedCategoryId prop is provided', () => {
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryId="kids-drinks"
        />
      )

      // Should only show Kids Drinks
      expect(screen.getByText('Milo')).toBeInTheDocument()
      expect(screen.getByText('Babyccino')).toBeInTheDocument()

      // Should not show drinks from other categories
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument()
      expect(screen.queryByText('Affogato')).not.toBeInTheDocument()
    })

    it('shows all drinks when "All Categories" is selected', async () => {
      const user = userEvent.setup()
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryId="kids-drinks"
        />
      )

      const categoryFilter = screen.getByRole('combobox', { name: /filter by category/i })
      
      // Select "All Categories"
      await user.selectOptions(categoryFilter, '')

      // Should call onCategoryFilter with undefined to clear filter
      expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith(undefined)
    })

    it('displays active category filter indicator', () => {
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryId="kids-drinks"
        />
      )

      expect(screen.getByText('Category: Kids Drinks')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /remove category filter/i })).toBeInTheDocument()
    })

    it('clears category filter when remove button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryId="kids-drinks"
        />
      )

      const removeButton = screen.getByRole('button', { name: /remove category filter/i })
      await user.click(removeButton)

      expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith(undefined)
    })
  })

  describe('Search Filtering', () => {
    it('filters drinks by search query', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      
      // Type "milo" in search
      await user.type(searchInput, 'milo')

      // Wait for filtering to occur
      await waitFor(() => {
        expect(screen.getByText('Milo')).toBeInTheDocument()
        expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
        expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument()
        expect(screen.queryByText('Babyccino')).not.toBeInTheDocument()
        expect(screen.queryByText('Affogato')).not.toBeInTheDocument()
      })
    })

    it('filters drinks by description search', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      
      // Search for "coffee" - should match drinks with "coffee" in description
      await user.type(searchInput, 'coffee')

      await waitFor(() => {
        expect(screen.getByText('Espresso')).toBeInTheDocument() // "Strong coffee shot"
        expect(screen.getByText('Cappuccino')).toBeInTheDocument() // "Coffee with steamed milk"
        expect(screen.queryByText('Milo')).not.toBeInTheDocument()
        expect(screen.queryByText('Babyccino')).not.toBeInTheDocument()
      })
    })

    it('is case insensitive', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      
      // Search with different cases
      await user.type(searchInput, 'MILO')

      await waitFor(() => {
        expect(screen.getByText('Milo')).toBeInTheDocument()
        expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      })
    })

    it('displays active search filter indicator', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      await user.type(searchInput, 'milo')

      await waitFor(() => {
        expect(screen.getByText('Search: "milo"')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
      })
    })

    it('clears search filter when remove button is clicked', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      await user.type(searchInput, 'milo')

      await waitFor(() => {
        expect(screen.getByText('Search: "milo"')).toBeInTheDocument()
      })

      const removeButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(removeButton)

      await waitFor(() => {
        expect(searchInput).toHaveValue('')
        expect(screen.queryByText('Search: "milo"')).not.toBeInTheDocument()
      })
    })
  })

  describe('Combined Filtering', () => {
    it('applies both category and search filters together', async () => {
      const user = userEvent.setup()
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryId="premium-coffee"
        />
      )

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      await user.type(searchInput, 'espresso')

      await waitFor(() => {
        // Should only show Espresso (matches both category and search)
        expect(screen.getByText('Espresso')).toBeInTheDocument()
        expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument() // Same category but doesn't match search
        expect(screen.queryByText('Milo')).not.toBeInTheDocument() // Different category
      })
    })

    it('shows "Clear all filters" button when both filters are active', async () => {
      const user = userEvent.setup()
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryId="premium-coffee"
        />
      )

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      await user.type(searchInput, 'coffee')

      await waitFor(() => {
        expect(screen.getByText('Category: Premium Coffee')).toBeInTheDocument()
        expect(screen.getByText('Search: "coffee"')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument()
      })
    })

    it('clears all filters when "Clear all filters" button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryId="premium-coffee"
        />
      )

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      await user.type(searchInput, 'coffee')

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument()
      })

      const clearAllButton = screen.getByRole('button', { name: /clear all filters/i })
      await user.click(clearAllButton)

      await waitFor(() => {
        expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith(undefined)
        expect(searchInput).toHaveValue('')
        expect(screen.queryByText('Search: "coffee"')).not.toBeInTheDocument()
      })
    })

    it('does not show "Clear all filters" when only one filter is active', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      await user.type(searchInput, 'milo')

      await waitFor(() => {
        expect(screen.getByText('Search: "milo"')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for filter indicators', () => {
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryId="kids-drinks"
        />
      )

      const removeButton = screen.getByRole('button', { name: /remove category filter/i })
      expect(removeButton).toHaveAttribute('aria-label', 'Remove category filter')
    })

    it('has proper labels for form controls', () => {
      render(<DrinkList {...defaultProps} />)

      expect(screen.getByLabelText('Filter by Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Search Drinks')).toBeInTheDocument()
    })
  })

  describe('View Mode Toggle', () => {
    it('toggles between grid and list view modes', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const gridButton = screen.getByRole('button', { name: /grid view/i })
      const listButton = screen.getByRole('button', { name: /list view/i })

      // Default should be grid view (check by CSS classes)
      expect(gridButton).toHaveClass('bg-coffee-100', 'text-coffee-700')
      expect(listButton).toHaveClass('bg-white', 'text-coffee-500')

      // Switch to list view
      await user.click(listButton)

      expect(gridButton).toHaveClass('bg-white', 'text-coffee-500')
      expect(listButton).toHaveClass('bg-coffee-100', 'text-coffee-700')

      // Switch back to grid view
      await user.click(gridButton)

      expect(gridButton).toHaveClass('bg-coffee-100', 'text-coffee-700')
      expect(listButton).toHaveClass('bg-white', 'text-coffee-500')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty drinks array', () => {
      render(<DrinkList {...defaultProps} drinks={[]} />)

      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      // Should still render the filter controls
      expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /search drinks/i })).toBeInTheDocument()
    })

    it('handles drinks without descriptions', () => {
      const drinksWithoutDescription = mockDrinks.map(drink => ({
        ...drink,
        description: null
      }))

      render(<DrinkList {...defaultProps} drinks={drinksWithoutDescription} />)

      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('Milo')).toBeInTheDocument()
    })

    it('handles search with no matching results', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      await user.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
        expect(screen.queryByText('Milo')).not.toBeInTheDocument()
        expect(screen.getByText('Search: "nonexistent"')).toBeInTheDocument()
      })
    })

    it('handles category filter with no matching drinks', () => {
      const emptyCategoryProps = {
        ...defaultProps,
        selectedCategoryId: 'empty-category'
      }

      render(<DrinkList {...emptyCategoryProps} />)

      // Should not show any drinks
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      expect(screen.queryByText('Milo')).not.toBeInTheDocument()
    })

    it('handles whitespace-only search queries', async () => {
      const user = userEvent.setup()
      render(<DrinkList {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', { name: /search drinks/i })
      await user.type(searchInput, '   ')

      await waitFor(() => {
        // Should show all drinks since whitespace-only search is ignored
        expect(screen.getByText('Espresso')).toBeInTheDocument()
        expect(screen.getByText('Milo')).toBeInTheDocument()
        expect(screen.queryByText('Search:')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('displays loading state when isLoading is true', () => {
      render(<DrinkList {...defaultProps} isLoading />)

      // Should show loading UI with skeleton cards instead of normal controls
      expect(screen.getByText('Drinks')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add Drink' })).toBeDisabled()
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })
})