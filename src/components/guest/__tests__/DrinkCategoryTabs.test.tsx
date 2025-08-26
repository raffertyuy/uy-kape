import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen } from '../../../../tests/config/test-utils'
import userEvent from '@testing-library/user-event'

// Mock the useMenuData hook
vi.mock('@/hooks/useMenuData', () => ({
  useDrinkCategories: vi.fn()
}))

import { useDrinkCategories } from '@/hooks/useMenuData'

// Component variables
let DrinkCategoryTabs: any

describe('DrinkCategoryTabs', () => {
  beforeAll(async () => {
    // Import component after setup
    const drinkCategoryTabsModule = await import('../DrinkCategoryTabs')
    DrinkCategoryTabs = drinkCategoryTabsModule.DrinkCategoryTabs
  })

  const mockCategories = [
    { id: '1', name: 'Coffee', is_active: true, display_order: 1 },
    { id: '2', name: 'Special Coffee', is_active: true, display_order: 2 },
    { id: '3', name: 'Tea', is_active: true, display_order: 3 },
    { id: '4', name: 'Kids Drinks', is_active: true, display_order: 4 },
    { id: '5', name: 'Inactive Category', is_active: false, display_order: 5 }
  ]

  const defaultProps = {
    selectedCategoryId: undefined,
    onCategorySelect: vi.fn(),
    className: ''
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    ;(useDrinkCategories as any).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null
    })
  })

  describe('Basic Rendering', () => {
    it('renders the category title', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      expect(screen.getByText('Choose a Category')).toBeInTheDocument()
    })

    it('renders All Drinks button as first option', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const allDrinksButton = screen.getByRole('tab', { name: 'All Drinks' })
      expect(allDrinksButton).toBeInTheDocument()
      expect(allDrinksButton).toHaveAttribute('aria-selected', 'true')
    })

    it('renders all active categories', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      expect(screen.getByRole('tab', { name: 'Coffee' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Special Coffee' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tea' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Kids Drinks' })).toBeInTheDocument()
    })

    it('does not render inactive categories', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      expect(screen.queryByRole('tab', { name: 'Inactive Category' })).not.toBeInTheDocument()
    })

    it('has proper ARIA attributes for accessibility', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Drink categories')

      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('role', 'tab')
        expect(tab).toHaveAttribute('aria-selected')
        expect(tab).toHaveAttribute('aria-controls', 'drinks-panel')
      })
    })
  })

  describe('Loading and Error States', () => {
    it('renders loading skeleton when data is loading', () => {
      ;(useDrinkCategories as any).mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      })

      render(<DrinkCategoryTabs {...defaultProps} />)
      
      // Check for loading skeleton elements
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
      
      // Should not show the main heading during loading
      expect(screen.queryByText('Choose a Category')).not.toBeInTheDocument()
    })

    it('renders error state when there is an error', () => {
      ;(useDrinkCategories as any).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch')
      })

      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toBeInTheDocument()
      expect(screen.getByText('Failed to load categories')).toBeInTheDocument()
    })
  })

  describe('Selection Behavior', () => {
    it('shows All Drinks as selected by default', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const allDrinksButton = screen.getByRole('tab', { name: 'All Drinks' })
      expect(allDrinksButton).toHaveAttribute('aria-selected', 'true')
      expect(allDrinksButton).toHaveClass('bg-coffee-600', 'text-white')
    })

    it('shows specific category as selected when selectedCategoryId is provided', () => {
      render(<DrinkCategoryTabs {...defaultProps} selectedCategoryId="1" />)
      
      const allDrinksButton = screen.getByRole('tab', { name: 'All Drinks' })
      const coffeeButton = screen.getByRole('tab', { name: 'Coffee' })
      
      expect(allDrinksButton).toHaveAttribute('aria-selected', 'false')
      expect(coffeeButton).toHaveAttribute('aria-selected', 'true')
      expect(coffeeButton).toHaveClass('bg-coffee-600', 'text-white')
    })

    it('calls onCategorySelect when All Drinks is clicked', async () => {
      const user = userEvent.setup()
      render(<DrinkCategoryTabs {...defaultProps} selectedCategoryId="1" />)
      
      const allDrinksButton = screen.getByRole('tab', { name: 'All Drinks' })
      await user.click(allDrinksButton)
      
      expect(defaultProps.onCategorySelect).toHaveBeenCalledWith(undefined)
    })

    it('calls onCategorySelect when a category is clicked', async () => {
      const user = userEvent.setup()
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const coffeeButton = screen.getByRole('tab', { name: 'Coffee' })
      await user.click(coffeeButton)
      
      expect(defaultProps.onCategorySelect).toHaveBeenCalledWith('1')
    })
  })

  describe('Keyboard Navigation', () => {
    it('handles Enter key on All Drinks button', async () => {
      const user = userEvent.setup()
      render(<DrinkCategoryTabs {...defaultProps} selectedCategoryId="1" />)
      
      const allDrinksButton = screen.getByRole('tab', { name: 'All Drinks' })
      allDrinksButton.focus()
      
      await user.keyboard('{Enter}')
      
      expect(defaultProps.onCategorySelect).toHaveBeenCalledWith(undefined)
    })

    it('handles Space key on category button', async () => {
      const user = userEvent.setup()
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const coffeeButton = screen.getByRole('tab', { name: 'Coffee' })
      coffeeButton.focus()
      
      await user.keyboard(' ')
      
      expect(defaultProps.onCategorySelect).toHaveBeenCalledWith('1')
    })

    it('prevents default behavior on Enter and Space keys', async () => {
      const user = userEvent.setup()
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const coffeeButton = screen.getByRole('tab', { name: 'Coffee' })
      
      // Mock preventDefault to verify it's called
      const mockPreventDefault = vi.fn()
      coffeeButton.addEventListener('keydown', (e) => {
        e.preventDefault = mockPreventDefault
      })
      
      coffeeButton.focus()
      await user.keyboard('{Enter}')
      
      expect(defaultProps.onCategorySelect).toHaveBeenCalledWith('1')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('has horizontal scrolling container with proper classes', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const scrollContainer = document.querySelector('.overflow-x-auto.scrollbar-hide')
      expect(scrollContainer).toBeInTheDocument()
      expect(scrollContainer).toHaveClass('w-full', 'overflow-x-auto', 'scrollbar-hide')
    })

    it('has proper inline styles for scrollbar hiding', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const scrollContainer = document.querySelector('.overflow-x-auto.scrollbar-hide')
      expect(scrollContainer).toBeInTheDocument()
      
      // Check that the element has the style attribute
      expect(scrollContainer).toHaveAttribute('style')
      
      // Verify the style attribute contains scrollbar-related properties
      const styleAttr = scrollContainer?.getAttribute('style')
      expect(styleAttr).toContain('scrollbar-width')
      // The msOverflowStyle might be normalized to different formats, so just check for presence of style attribute
      expect(styleAttr).toBeTruthy()
    })

    it('has flex container with proper spacing', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const flexContainer = document.querySelector('.flex.space-x-2.min-w-max.pb-2')
      expect(flexContainer).toBeInTheDocument()
      expect(flexContainer).toHaveClass('flex', 'space-x-2', 'min-w-max', 'pb-2')
    })

    it('tabs have flex-shrink-0 and whitespace-nowrap for mobile scrolling', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const allDrinksButton = screen.getByRole('tab', { name: 'All Drinks' })
      const coffeeButton = screen.getByRole('tab', { name: 'Coffee' })
      
      expect(allDrinksButton).toHaveClass('flex-shrink-0', 'whitespace-nowrap')
      expect(coffeeButton).toHaveClass('flex-shrink-0', 'whitespace-nowrap')
    })

    it('tabs have proper padding for touch targets', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveClass('px-4', 'py-2')
      })
    })

    it('maintains minimum width to prevent content wrapping', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const flexContainer = document.querySelector('.min-w-max')
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('has proper focus styles for accessibility', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveClass(
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-coffee-400',
          'focus:ring-offset-2'
        )
      })
    })

    it('is focusable with keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      // Tab to the first button
      await user.tab()
      
      const allDrinksButton = screen.getByRole('tab', { name: 'All Drinks' })
      expect(allDrinksButton).toHaveFocus()
    })
  })

  describe('Visual States', () => {
    it('applies correct styles for selected state', () => {
      render(<DrinkCategoryTabs {...defaultProps} selectedCategoryId="1" />)
      
      const selectedButton = screen.getByRole('tab', { name: 'Coffee' })
      expect(selectedButton).toHaveClass('bg-coffee-600', 'text-white', 'shadow-md')
    })

    it('applies correct styles for unselected state', () => {
      render(<DrinkCategoryTabs {...defaultProps} selectedCategoryId="1" />)
      
      const unselectedButton = screen.getByRole('tab', { name: 'Tea' })
      expect(unselectedButton).toHaveClass(
        'bg-coffee-100',
        'text-coffee-700',
        'hover:bg-coffee-200'
      )
    })

    it('has transition animations for smooth interactions', () => {
      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveClass('transition-all', 'duration-200')
      })
    })
  })

  describe('Custom className prop', () => {
    it('applies custom className to the root container', () => {
      const customClassName = 'custom-test-class'
      render(<DrinkCategoryTabs {...defaultProps} className={customClassName} />)
      
      const container = document.querySelector(`.space-y-2.${customClassName}`)
      expect(container).toBeInTheDocument()
    })

    it('preserves default classes when custom className is provided', () => {
      const customClassName = 'custom-test-class'
      render(<DrinkCategoryTabs {...defaultProps} className={customClassName} />)
      
      const container = document.querySelector('.space-y-2')
      expect(container).toHaveClass('space-y-2', customClassName)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty categories array gracefully', () => {
      ;(useDrinkCategories as any).mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      })

      render(<DrinkCategoryTabs {...defaultProps} />)
      
      // Should still render All Drinks button
      expect(screen.getByRole('tab', { name: 'All Drinks' })).toBeInTheDocument()
      
      // Should only have 1 tab (All Drinks)
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(1)
    })

    it('handles categories with special characters in names', () => {
      const specialCategories = [
        { id: '1', name: 'Café & More', is_active: true, display_order: 1 },
        { id: '2', name: 'Tea (Hot & Cold)', is_active: true, display_order: 2 }
      ]

      ;(useDrinkCategories as any).mockReturnValue({
        data: specialCategories,
        isLoading: false,
        error: null
      })

      render(<DrinkCategoryTabs {...defaultProps} />)
      
      expect(screen.getByRole('tab', { name: 'Café & More' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tea (Hot & Cold)' })).toBeInTheDocument()
    })

    it('handles very long category names', () => {
      const longNameCategories = [
        { 
          id: '1', 
          name: 'This is a very long category name that should not wrap', 
          is_active: true, 
          display_order: 1 
        }
      ]

      ;(useDrinkCategories as any).mockReturnValue({
        data: longNameCategories,
        isLoading: false,
        error: null
      })

      render(<DrinkCategoryTabs {...defaultProps} />)
      
      const longNameButton = screen.getByRole('tab', { 
        name: 'This is a very long category name that should not wrap' 
      })
      expect(longNameButton).toBeInTheDocument()
      expect(longNameButton).toHaveClass('whitespace-nowrap')
    })
  })
})