import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { DrinkCard } from '../DrinkCard'
import type { Drink, DrinkWithOptionsPreview, DrinkOptionPreview } from '@/types/menu.types'

describe('DrinkCard', () => {
  const mockDrink: Drink = {
    id: '1',
    name: 'Espresso',
    description: 'A strong coffee shot',
    is_active: true,
    display_order: 1,
    category_id: 'cat1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockDrinkWithCategory = {
    ...mockDrink,
    category: {
      id: 'cat1',
      name: 'Hot Drinks',
      description: 'Hot beverages',
      is_active: true,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }

  const mockOptionsPreview: DrinkOptionPreview[] = [
    {
      id: '1',
      option_category_name: 'Size',
      default_value_name: 'Medium'
    },
    {
      id: '2',
      option_category_name: 'Temperature',
      default_value_name: 'Hot'
    },
    {
      id: '3',
      option_category_name: 'Shots',
      default_value_name: '2'
    }
  ]

  const mockDrinkWithOptionsPreview: DrinkWithOptionsPreview = {
    ...mockDrink,
    category: {
      id: 'cat1',
      name: 'Hot Drinks',
      description: 'Hot beverages',
      is_active: true,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    options_preview: mockOptionsPreview
  }

  const defaultProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onManageOptions: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders drink information in grid view', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="grid"
          {...defaultProps}
        />
      )

      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('A strong coffee shot')).toBeInTheDocument()
      expect(screen.getByText('Category: Hot Drinks')).toBeInTheDocument()
      expect(screen.getByText('Order: 1')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders drink information in list view', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="list"
          {...defaultProps}
        />
      )

      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('A strong coffee shot')).toBeInTheDocument()
      expect(screen.getByText('Category: Hot Drinks')).toBeInTheDocument()
      expect(screen.getByText('Order: 1')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('shows inactive status correctly', () => {
      const inactiveDrink = { ...mockDrinkWithCategory, is_active: false }
      render(
        <DrinkCard
          drink={inactiveDrink}
          viewMode="grid"
          {...defaultProps}
        />
      )

      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })

    it('handles missing category gracefully', () => {
      render(
        <DrinkCard
          drink={mockDrink}
          viewMode="grid"
          {...defaultProps}
        />
      )

      expect(screen.getByText('Category: Unknown')).toBeInTheDocument()
    })

    it('handles missing description gracefully', () => {
      const drinkWithoutDescription = { ...mockDrinkWithCategory, description: null }
      render(
        <DrinkCard
          drink={drinkWithoutDescription}
          viewMode="grid"
          {...defaultProps}
        />
      )

      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.queryByText('A strong coffee shot')).not.toBeInTheDocument()
    })
  })

  describe('Options Preview Integration', () => {
    it('does not show options preview when showOptionsPreview is false', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithOptionsPreview}
          viewMode="grid"
          showOptionsPreview={false}
          {...defaultProps}
        />
      )

      expect(screen.queryByText('Size: Medium')).not.toBeInTheDocument()
      expect(screen.queryByText('Temperature: Hot')).not.toBeInTheDocument()
    })

    it('does not show options preview by default', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithOptionsPreview}
          viewMode="grid"
          {...defaultProps}
        />
      )

      expect(screen.queryByText('Size: Medium')).not.toBeInTheDocument()
    })

    it('shows options preview in grid view when enabled', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithOptionsPreview}
          viewMode="grid"
          showOptionsPreview
          {...defaultProps}
        />
      )

      // Check that options preview is rendered by looking for the list role
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })

    it('shows options preview in list view when enabled', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithOptionsPreview}
          viewMode="list"
          showOptionsPreview
          {...defaultProps}
        />
      )

      expect(screen.getByText('Size:')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('Temperature:')).toBeInTheDocument()
    expect(screen.getByText('Hot')).toBeInTheDocument()
      expect(screen.getByText('Shots:')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('handles drink without options preview data gracefully', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="grid"
          showOptionsPreview
          {...defaultProps}
        />
      )

      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.queryByText('Size: Medium')).not.toBeInTheDocument()
    })

    it('handles empty options preview array', () => {
      const drinkWithEmptyOptions: DrinkWithOptionsPreview = {
        ...mockDrink,
        category: {
          id: 'cat1',
          name: 'Hot Drinks',
          description: 'Hot beverages',
          is_active: true,
          display_order: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        options_preview: []
      }

      render(
        <DrinkCard
          drink={drinkWithEmptyOptions}
          viewMode="grid"
          showOptionsPreview
          {...defaultProps}
        />
      )

      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.queryByText('Size: Medium')).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('calls onEdit when edit button is clicked', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="grid"
          {...defaultProps}
        />
      )

      fireEvent.click(screen.getByLabelText('Edit Espresso'))
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1)
    })

    it('calls onManageOptions when options button is clicked', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="grid"
          {...defaultProps}
        />
      )

      fireEvent.click(screen.getByLabelText('Manage options for Espresso'))
      expect(defaultProps.onManageOptions).toHaveBeenCalledTimes(1)
    })

    it('shows delete confirmation modal when delete button is clicked', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="grid"
          {...defaultProps}
        />
      )

      fireEvent.click(screen.getByLabelText('Delete Espresso'))
      
      expect(screen.getByText('Delete Drink')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
      // Check for the modal version specifically (not the card title)
      expect(screen.getByText(/"Espresso"/)).toBeInTheDocument()
    })

    it('calls onDelete when delete is confirmed', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="grid"
          {...defaultProps}
        />
      )

      fireEvent.click(screen.getByLabelText('Delete Espresso'))
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
      
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
    })

    it('cancels delete when cancel is clicked', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="grid"
          {...defaultProps}
        />
      )

      fireEvent.click(screen.getByLabelText('Delete Espresso'))
      fireEvent.click(screen.getByText('Cancel'))
      
      expect(defaultProps.onDelete).not.toHaveBeenCalled()
      expect(screen.queryByText('Delete Drink')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper aria labels for action buttons', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithCategory}
          viewMode="grid"
          {...defaultProps}
        />
      )

      expect(screen.getByLabelText('Edit Espresso')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Espresso')).toBeInTheDocument()
      expect(screen.getByLabelText('Manage options for Espresso')).toBeInTheDocument()
    })

    it('maintains accessibility when options preview is shown', () => {
      render(
        <DrinkCard
          drink={mockDrinkWithOptionsPreview}
          viewMode="grid"
          showOptionsPreview
          {...defaultProps}
        />
      )

      const optionsList = screen.getByRole('list')
      expect(optionsList).toHaveAttribute('aria-label', 'Drink options (3 total)')
    })
  })

  describe('Layout Variants', () => {
    it('applies different layouts for grid vs list variants', () => {
      const { rerender } = render(
        <DrinkCard
          drink={mockDrinkWithOptionsPreview}
          viewMode="grid"
          showOptionsPreview
          {...defaultProps}
        />
      )

      // Check grid layout structure - grid view includes both the custom className and grid classes
      const gridOptions = screen.getByRole('list')
      expect(gridOptions).toHaveClass('text-xs')

      rerender(
        <DrinkCard
          drink={mockDrinkWithOptionsPreview}
          viewMode="list"
          showOptionsPreview
          {...defaultProps}
        />
      )

      // Check list layout structure - list view shows options in a flex layout
      const listOptions = screen.getByRole('list')
      expect(listOptions).toHaveClass('flex')
    })
  })
})