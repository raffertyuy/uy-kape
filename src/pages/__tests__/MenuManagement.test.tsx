import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuManagement } from '@/pages/MenuManagement'

// Mock the hooks and components
vi.mock('@/hooks/useMenuData', () => ({
  useDrinkCategories: vi.fn(() => ({
    data: [
      {
        id: '1',
        name: 'Coffee',
        description: 'Hot coffee drinks',
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    isLoading: false
  })),
  useDrinks: vi.fn(() => ({
    data: [
      {
        id: '1',
        name: 'Espresso',
        description: 'Strong coffee shot',
        price: 2.50,
        category_id: '1',
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    isLoading: false
  })),
  useOptionCategories: vi.fn(() => ({
    data: [],
    isLoading: false
  })),
  useOptionValues: vi.fn(() => ({
    data: [],
    isLoading: false
  })),
  useDrinkOptions: vi.fn(() => ({
    data: [],
    isLoading: false
  })),
  // Add mutation hooks
  useCreateDrinkCategory: vi.fn(() => ({
    state: 'idle',
    createCategory: vi.fn()
  })),
  useUpdateDrinkCategory: vi.fn(() => ({
    state: 'idle',
    updateCategory: vi.fn()
  })),
  useDeleteDrinkCategory: vi.fn(() => ({
    state: 'idle',
    deleteCategory: vi.fn()
  })),
  useCreateDrink: vi.fn(() => ({
    state: 'idle',
    createDrink: vi.fn()
  })),
  useUpdateDrink: vi.fn(() => ({
    state: 'idle',
    updateDrink: vi.fn()
  })),
  useDeleteDrink: vi.fn(() => ({
    state: 'idle',
    deleteDrink: vi.fn()
  })),
  useCreateOptionCategory: vi.fn(() => ({
    state: 'idle',
    createCategory: vi.fn()
  })),
  useUpdateOptionCategory: vi.fn(() => ({
    state: 'idle',
    updateCategory: vi.fn()
  })),
  useDeleteOptionCategory: vi.fn(() => ({
    state: 'idle',
    deleteCategory: vi.fn()
  })),
  useCreateOptionValue: vi.fn(() => ({
    state: 'idle',
    createValue: vi.fn()
  })),
  useUpdateOptionValue: vi.fn(() => ({
    state: 'idle',
    updateValue: vi.fn()
  })),
  useDeleteOptionValue: vi.fn(() => ({
    state: 'idle',
    deleteValue: vi.fn()
  }))
}))

vi.mock('@/hooks/useMenuSubscriptions', () => ({
  useMenuSubscriptions: vi.fn(() => ({
    connectionStatus: 'connected' as const,
    hasChanges: false,
    changes: []
  }))
}))

vi.mock('@/hooks/useErrorHandling', () => ({
  useErrorHandling: vi.fn(() => ({
    errors: [],
    showError: vi.fn(),
    clearError: vi.fn(),
    clearAllErrors: vi.fn()
  }))
}))

// Mock notification components
vi.mock('@/components/menu/MenuNotifications', () => ({
  MenuNotifications: () => <div data-testid="menu-notifications">Notifications</div>
}))

vi.mock('@/components/menu/RealtimeIndicator', () => ({
  RealtimeIndicator: ({ status }: { status: string }) => (
    <div data-testid="realtime-indicator">Status: {status}</div>
  )
}))

vi.mock('@/components/menu/ChangeNotification', () => ({
  ChangeNotification: () => <div data-testid="change-notification">Changes detected</div>
}))

// Mock form components
vi.mock('@/components/menu/DrinkCategoryForm', () => ({
  DrinkCategoryForm: ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="drink-category-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

vi.mock('@/components/menu/DrinkForm', () => ({
  DrinkForm: ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="drink-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

describe('MenuManagement Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the menu management page correctly', async () => {
    render(<MenuManagement />)

    // Check main elements are present
    expect(screen.getByText('Menu Management')).toBeInTheDocument()
    expect(screen.getByText('Manage your café menu items, categories, and options')).toBeInTheDocument()
    
    // Check tabs are present
    expect(screen.getByRole('tab', { name: /drink categories/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /drinks/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /option categories/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /option values/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /drink options/i })).toBeInTheDocument()

    // Check real-time components
    expect(screen.getByTestId('realtime-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('menu-notifications')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup()
    render(<MenuManagement />)

    // Should start with Drink Categories tab
    expect(screen.getByRole('tab', { name: /drink categories/i })).toHaveAttribute('aria-selected', 'true')

    // Switch to Drinks tab
    await user.click(screen.getByRole('tab', { name: /drinks/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /drinks/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: /drink categories/i })).toHaveAttribute('aria-selected', 'false')
    })

    // Switch to Option Categories tab
    await user.click(screen.getByRole('tab', { name: /option categories/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /option categories/i })).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('shows add category form when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<MenuManagement />)

    // Click the add category button
    const addButton = screen.getByRole('button', { name: /add category/i })
    await user.click(addButton)

    // Form should appear
    expect(screen.getByTestId('drink-category-form')).toBeInTheDocument()
  })

  it('closes add category form when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<MenuManagement />)

    // Open form
    await user.click(screen.getByRole('button', { name: /add category/i }))
    expect(screen.getByTestId('drink-category-form')).toBeInTheDocument()

    // Close form
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    
    await waitFor(() => {
      expect(screen.queryByTestId('drink-category-form')).not.toBeInTheDocument()
    })
  })

  it('shows add drink form when in drinks tab', async () => {
    const user = userEvent.setup()
    render(<MenuManagement />)

    // Switch to drinks tab
    await user.click(screen.getByRole('tab', { name: /drinks/i }))
    
    // Click add drink button
    const addButton = screen.getByRole('button', { name: /add drink/i })
    await user.click(addButton)

    // Form should appear
    expect(screen.getByTestId('drink-form')).toBeInTheDocument()
  })

  it('displays loading state when data is loading', () => {
    // Mock loading state
    const { useDrinkCategories } = require('@/hooks/useMenuData')
    useDrinkCategories.mockReturnValue({
      data: [],
      isLoading: true
    })

    render(<MenuManagement />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays data in category list', () => {
    render(<MenuManagement />)

    // Should show the mocked category
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Hot coffee drinks')).toBeInTheDocument()
  })

  it('displays data in drinks list when drinks tab is active', async () => {
    const user = userEvent.setup()
    render(<MenuManagement />)

    // Switch to drinks tab
    await user.click(screen.getByRole('tab', { name: /drinks/i }))

    await waitFor(() => {
      // Should show the mocked drink
      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('Strong coffee shot')).toBeInTheDocument()
      expect(screen.getByText('$2.50')).toBeInTheDocument()
    })
  })

  it('has proper keyboard navigation for tabs', async () => {
    const user = userEvent.setup()
    render(<MenuManagement />)

    const categoriesTab = screen.getByRole('tab', { name: /drink categories/i })
    const drinksTab = screen.getByRole('tab', { name: /drinks/i })

    // Focus categories tab
    categoriesTab.focus()
    expect(categoriesTab).toHaveFocus()

    // Use arrow key to navigate to drinks tab
    await user.keyboard('{ArrowRight}')
    expect(drinksTab).toHaveFocus()

    // Enter to activate
    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(drinksTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('shows real-time connection status', () => {
    render(<MenuManagement />)

    const indicator = screen.getByTestId('realtime-indicator')
    expect(indicator).toHaveTextContent('Status: connected')
  })

  it('handles errors gracefully', () => {
    // Mock error state
    const { useErrorHandling } = require('@/hooks/useErrorHandling')
    useErrorHandling.mockReturnValue({
      errors: [
        { id: '1', type: 'network', message: 'Failed to load categories' }
      ],
      showError: vi.fn(),
      clearError: vi.fn(),
      clearAllErrors: vi.fn()
    })

    render(<MenuManagement />)

    // Error should be displayed through MenuNotifications component
    expect(screen.getByTestId('menu-notifications')).toBeInTheDocument()
  })

  it('provides proper accessibility attributes', () => {
    render(<MenuManagement />)

    // Check main heading
    const heading = screen.getByRole('heading', { name: /menu management/i })
    expect(heading).toBeInTheDocument()

    // Check tab list
    const tabList = screen.getByRole('tablist')
    expect(tabList).toBeInTheDocument()

    // Check all tabs have proper attributes
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected')
      expect(tab).toHaveAttribute('aria-controls')
    })

    // Check tab panels
    const tabPanel = screen.getByRole('tabpanel')
    expect(tabPanel).toBeInTheDocument()
    expect(tabPanel).toHaveAttribute('aria-labelledby')
  })
})