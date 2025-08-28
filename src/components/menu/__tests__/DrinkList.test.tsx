import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen } from '../../../../tests/config/test-utils'
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
      preparation_time_minutes: 3,
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
      preparation_time_minutes: null,
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
      preparation_time_minutes: 0,
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
      preparation_time_minutes: 2,
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
      preparation_time_minutes: 7,
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

    it('does not render search input (handled by parent)', () => {
      render(<DrinkList {...defaultProps} />)

      // DrinkList should not have search input - it's handled by parent MenuManagement
      expect(screen.queryByRole('textbox', { name: /search drinks/i })).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Search Drinks')).not.toBeInTheDocument()
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
      await user.selectOptions(categoryFilter, 'Kids Drinks')

      // Should call onCategoryFilter with the selected category name
      expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith('Kids Drinks')
    })

    it('shows only drinks from selected category when selectedCategoryName prop is provided', () => {
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryName="Kids Drinks"
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
          selectedCategoryName="Kids Drinks"
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
          selectedCategoryName="Kids Drinks"
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
          selectedCategoryName="Kids Drinks"
        />
      )

      const removeButton = screen.getByRole('button', { name: /remove category filter/i })
      await user.click(removeButton)

      expect(defaultProps.onCategoryFilter).toHaveBeenCalledWith(undefined)
    })
  })

  describe('Search Filtering', () => {
    it('filters drinks by search query prop', () => {
      render(<DrinkList {...defaultProps} searchQuery="milo" />)

      // Should only show drinks matching the search query
      expect(screen.getByText('Milo')).toBeInTheDocument()
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument()
      expect(screen.queryByText('Babyccino')).not.toBeInTheDocument()
      expect(screen.queryByText('Affogato')).not.toBeInTheDocument()
    })

    it('filters drinks by description search in searchQuery prop', () => {
      render(<DrinkList {...defaultProps} searchQuery="coffee" />)

      // Should match drinks with "coffee" in description
      expect(screen.getByText('Espresso')).toBeInTheDocument() // "Strong coffee shot"
      expect(screen.getByText('Cappuccino')).toBeInTheDocument() // "Coffee with steamed milk"
      expect(screen.queryByText('Milo')).not.toBeInTheDocument()
      expect(screen.queryByText('Babyccino')).not.toBeInTheDocument()
    })

    it('is case insensitive with searchQuery prop', () => {
      render(<DrinkList {...defaultProps} searchQuery="MILO" />)

      // Should match regardless of case
      expect(screen.getByText('Milo')).toBeInTheDocument()
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
    })

    it('shows all drinks when searchQuery prop is empty', () => {
      render(<DrinkList {...defaultProps} searchQuery="" />)

      // Should show all drinks
      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('Cappuccino')).toBeInTheDocument()
      expect(screen.getByText('Milo')).toBeInTheDocument()
      expect(screen.getByText('Babyccino')).toBeInTheDocument()
      expect(screen.getByText('Affogato')).toBeInTheDocument()
    })

    it('handles whitespace in searchQuery prop', () => {
      render(<DrinkList {...defaultProps} searchQuery="  milo  " />)

      // Should trim whitespace and match
      expect(screen.getByText('Milo')).toBeInTheDocument()
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
    })
  })

  describe('Combined Filtering', () => {
    it('applies both category and search filters together', () => {
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryName="Premium Coffee"
          searchQuery="espresso"
        />
      )

      // Should only show Espresso (matches both category and search)
      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument() // Same category but doesn't match search
      expect(screen.queryByText('Milo')).not.toBeInTheDocument() // Different category
    })

    it('shows category filter indicator when only category filter is active', () => {
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryName="Premium Coffee"
        />
      )

      // Should show category filter
      expect(screen.getByText('Category: Premium Coffee')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty drinks array', () => {
      render(<DrinkList {...defaultProps} drinks={[]} />)

      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      // Should still render the filter controls
      expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument()
    })

    it('handles drinks without descriptions', () => {
      const drinksWithoutDescription = mockDrinks.map((drink: Drink) => ({
        ...drink,
        description: null
      }))

      render(<DrinkList {...defaultProps} drinks={drinksWithoutDescription} />)

      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('Milo')).toBeInTheDocument()
    })

    it('handles category filter with no matching drinks', () => {
      render(
        <DrinkList 
          {...defaultProps} 
          selectedCategoryName="Empty Category"
        />
      )

      // Should not show any drinks
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      expect(screen.queryByText('Milo')).not.toBeInTheDocument()
    })

    it('handles search with no matching results', () => {
      render(<DrinkList {...defaultProps} searchQuery="nonexistent" />)

      // Should not show any drinks
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      expect(screen.queryByText('Milo')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('displays loading state when isLoading is true', () => {
      render(<DrinkList {...defaultProps} isLoading />)

      // Should show loading UI with skeleton cards
      expect(screen.getByText('Drinks')).toBeInTheDocument()
    })
  })
})