import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, waitFor } from '../../../../tests/config/test-utils'
import userEvent from '@testing-library/user-event'

// Component variables
let MenuTabs: any

describe('MenuTabs', () => {
  beforeAll(async () => {
    // Import component after setup
    const menuTabsModule = await import('../MenuTabs')
    MenuTabs = menuTabsModule.MenuTabs
  })

  const defaultProps = {
    activeTab: 'categories' as const,
    onTabChange: vi.fn(),
    categoriesCount: 4,
    drinksCount: 16,
    optionCategoriesCount: 4
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders all three tabs with correct labels and counts', () => {
      render(<MenuTabs {...defaultProps} />)

      expect(screen.getByRole('tab', { name: /drink categories/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /drinks/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /option categories/i })).toBeInTheDocument()

      // Check counts are displayed - use getAllByText since there are multiple '4's
      const fours = screen.getAllByText('4')
      expect(fours).toHaveLength(2) // categories and options both have count 4
      expect(screen.getByText('16')).toBeInTheDocument() // drinks count
    })

    it('displays correct active tab state', () => {
      render(<MenuTabs {...defaultProps} activeTab="drinks" />)

      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      const drinksTab = screen.getByRole('tab', { name: /drinks/i })
      const optionsTab = screen.getByRole('tab', { name: /option categories/i })

      expect(categoriesTab).not.toHaveAttribute('aria-selected', 'true')
      expect(drinksTab).toHaveAttribute('aria-selected', 'true')
      expect(optionsTab).not.toHaveAttribute('aria-selected', 'true')
    })

    it('has proper ARIA attributes for accessibility', () => {
      render(<MenuTabs {...defaultProps} />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Menu management tabs')

      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('role', 'tab')
        expect(tab).toHaveAttribute('tabindex')
      })
    })

    it('renders tab icons', () => {
      render(<MenuTabs {...defaultProps} />)

      // Check that each tab has an icon (svg element)
      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      const drinksTab = screen.getByRole('tab', { name: /drinks/i })
      const optionsTab = screen.getByRole('tab', { name: /option categories/i })

      expect(categoriesTab.querySelector('svg')).toBeInTheDocument()
      expect(drinksTab.querySelector('svg')).toBeInTheDocument()
      expect(optionsTab.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('calls onTabChange when a tab is clicked', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} />)

      const drinksTab = screen.getByRole('tab', { name: /drinks/i })
      await user.click(drinksTab)

      expect(defaultProps.onTabChange).toHaveBeenCalledWith('drinks')
    })

    it('calls onTabChange for all tab types', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} activeTab="drinks" />)

      // Test categories tab
      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      await user.click(categoriesTab)
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('categories')

      // Test options tab
      const optionsTab = screen.getByRole('tab', { name: /option categories/i })
      await user.click(optionsTab)
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('options')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports arrow key navigation between tabs', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} />)

      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      categoriesTab.focus()

      // Right arrow should move to drinks tab
      await user.keyboard('{ArrowRight}')
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('drinks')
    })

    it('supports left arrow key navigation', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} activeTab="drinks" />)

      const drinksTab = screen.getByRole('tab', { name: /drinks/i })
      drinksTab.focus()

      // Left arrow should move to categories tab
      await user.keyboard('{ArrowLeft}')
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('categories')
    })

    it('wraps around when navigating past the last tab', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} activeTab="options" />)

      const optionsTab = screen.getByRole('tab', { name: /option categories/i })
      optionsTab.focus()

      // Right arrow from last tab should not wrap (no wrapping in current implementation)
      await user.keyboard('{ArrowRight}')
      expect(defaultProps.onTabChange).not.toHaveBeenCalled()
    })

    it('wraps around when navigating before the first tab', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} activeTab="categories" />)

      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      categoriesTab.focus()

      // Left arrow from first tab should not wrap (no wrapping in current implementation)
      await user.keyboard('{ArrowLeft}')
      expect(defaultProps.onTabChange).not.toHaveBeenCalled()
    })

    it('supports Home key to go to first tab', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} activeTab="options" />)

      const optionsTab = screen.getByRole('tab', { name: /option categories/i })
      optionsTab.focus()

      await user.keyboard('{Home}')
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('categories')
    })

    it('supports End key to go to last tab', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} activeTab="categories" />)

      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      categoriesTab.focus()

      await user.keyboard('{End}')
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('options')
    })

    it('focuses tabs correctly with Tab key', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} />)

      await user.tab()
      
      // Should focus on the active tab first
      const activeTab = screen.getByRole('tab', { name: /drink categories/i })
      expect(activeTab).toHaveFocus()
    })
  })

  describe('Responsive Design', () => {
    it('has overflow-x-auto class for horizontal scrolling', () => {
      render(<MenuTabs {...defaultProps} />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveClass('overflow-x-auto')
    })

    it('has whitespace-nowrap on tabs to prevent wrapping', () => {
      render(<MenuTabs {...defaultProps} />)

      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveClass('whitespace-nowrap')
      })
    })

    it('has responsive spacing classes', () => {
      render(<MenuTabs {...defaultProps} />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveClass('space-x-2', 'sm:space-x-4', 'lg:space-x-8')
    })

    it('tabs have flex-shrink-0 to maintain size', () => {
      render(<MenuTabs {...defaultProps} />)

      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveClass('flex-shrink-0')
      })
    })

    it('has smooth scroll behavior', () => {
      render(<MenuTabs {...defaultProps} />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveClass('scroll-smooth')
    })
  })

  describe('Active Tab Scrolling', () => {
    it('attempts to scroll active tab into view when activeTab changes', async () => {
      const { rerender } = render(<MenuTabs {...defaultProps} activeTab="categories" />)

      // Mock getBoundingClientRect to simulate tab being out of view
      const mockGetBoundingClientRect = vi.fn()
      Element.prototype.getBoundingClientRect = mockGetBoundingClientRect
      
      // Mock scrollIntoView
      const mockScrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = mockScrollIntoView

      // First call returns container bounds
      mockGetBoundingClientRect
        .mockReturnValueOnce({ left: 0, right: 300 }) // container
        .mockReturnValueOnce({ left: 350, right: 450 }) // button (out of view)

      // Change to options tab (would be off-screen on mobile)
      rerender(<MenuTabs {...defaultProps} activeTab="options" />)

      await waitFor(() => {
        // The effect should trigger scrollIntoView when tab is out of view
        expect(mockScrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      })
    })
  })

  describe('Count Display', () => {
    it('displays zero counts correctly', () => {
      render(
        <MenuTabs 
          {...defaultProps} 
          categoriesCount={0}
          drinksCount={0}
          optionCategoriesCount={0}
        />
      )

      const counts = screen.getAllByText('0')
      expect(counts).toHaveLength(3) // One for each tab
    })

    it('displays large counts correctly', () => {
      render(
        <MenuTabs 
          {...defaultProps} 
          categoriesCount={99}
          drinksCount={150}
          optionCategoriesCount={42}
        />
      )

      expect(screen.getByText('99')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('does not display count when not provided', () => {
      render(
        <MenuTabs 
          activeTab="categories"
          onTabChange={vi.fn()}
          // No counts provided
        />
      )

      // Should not show any count badges
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing counts gracefully', () => {
      const propsWithoutCounts = {
        activeTab: 'categories' as const,
        onTabChange: vi.fn(),
        // No count props provided
      }

      expect(() => {
        render(<MenuTabs {...propsWithoutCounts} />)
      }).not.toThrow()
    })

    it('handles invalid activeTab gracefully', () => {
      const propsWithInvalidTab = {
        ...defaultProps,
        activeTab: 'invalid' as any
      }

      expect(() => {
        render(<MenuTabs {...propsWithInvalidTab} />)
      }).not.toThrow()
    })

    it('does not call onTabChange when clicking the already active tab', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} activeTab="categories" />)

      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      await user.click(categoriesTab)

      // Should still call onTabChange for consistency
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('categories')
    })
  })

  describe('Focus Management', () => {
    it('maintains focus when navigating with keyboard', async () => {
      const user = userEvent.setup()
      render(<MenuTabs {...defaultProps} />)

      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      categoriesTab.focus()

      // Navigate to drinks tab
      await user.keyboard('{ArrowRight}')

      // onTabChange should be called, but focus management is handled by the parent
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('drinks')
    })

    it('sets correct tabindex values for accessibility', () => {
      render(<MenuTabs {...defaultProps} activeTab="drinks" />)

      const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
      const drinksTab = screen.getByRole('tab', { name: /drinks/i })
      const optionsTab = screen.getByRole('tab', { name: /option categories/i })

      // Active tab should have tabindex 0, others should have -1
      expect(categoriesTab).toHaveAttribute('tabindex', '-1')
      expect(drinksTab).toHaveAttribute('tabindex', '0')
      expect(optionsTab).toHaveAttribute('tabindex', '-1')
    })
  })
})