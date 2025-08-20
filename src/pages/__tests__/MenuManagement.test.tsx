import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuManagement } from '@/pages/MenuManagement'
import { useDrinkCategories, useDrinks } from '@/hooks/useMenuData'
import { useMenuSubscriptions } from '@/hooks/useMenuSubscriptions'

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
  RealtimeIndicator: ({ connectionStatus }: { connectionStatus: { connected: boolean, lastUpdate: Date | null, error: string | null } }) => (
    <div data-testid="realtime-indicator">Status: {connectionStatus.connected ? 'connected' : 'disconnected'}</div>
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
    expect(screen.getByText('Manage your coffee shop menu categories, drinks, and customization options.')).toBeInTheDocument()
    
    // Check tabs are present - using button role since we're using buttons for tabs
    expect(screen.getByRole('tab', { name: /drink categories/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /drinks/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /option categories/i })).toBeInTheDocument()

    // Check real-time components
    expect(screen.getByTestId('realtime-indicator')).toBeInTheDocument()
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

    // Click the add category button - use the actual button text from the component
    const addButton = screen.getByRole('button', { name: /add new drink category/i })
    await user.click(addButton)

    // Form should appear
    expect(screen.getByTestId('drink-category-form')).toBeInTheDocument()
  })

  it('closes add category form when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<MenuManagement />)

    // Open form
    await user.click(screen.getByRole('button', { name: /add new drink category/i }))
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
    const addButton = screen.getByRole('button', { name: /add new drink/i })
    await user.click(addButton)

    // Form should appear
    expect(screen.getByTestId('drink-form')).toBeInTheDocument()
  })

  it('displays loading state when data is loading', () => {
    // Mock loading state
    vi.mocked(useDrinkCategories).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn()
    })

    render(<MenuManagement />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays data in category list', () => {
    // Make sure categories are not loading  
    vi.mocked(useDrinkCategories).mockReturnValue({
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
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })
    
    render(<MenuManagement />)

    // Should show the mocked category
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Hot coffee drinks')).toBeInTheDocument()
  })

  it('displays data in drinks list when drinks tab is active', async () => {
    const user = userEvent.setup()
    
    // Make sure drinks are not loading
    vi.mocked(useDrinks).mockReturnValue({
      data: [
        {
          id: '1',
          name: 'Espresso',
          description: 'Strong coffee shot',
          category_id: '1',
          display_order: 1,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })
    
    render(<MenuManagement />)

    // Switch to drinks tab
    await user.click(screen.getByRole('tab', { name: /drinks/i }))

    await waitFor(() => {
      // Should show the mocked drink
      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('Strong coffee shot')).toBeInTheDocument()
    })
  })

  it('shows real-time connection status', () => {
    // Mock connected state
    vi.mocked(useMenuSubscriptions).mockReturnValue({
      connectionStatus: {
        connected: true,
        lastUpdate: new Date(),
        error: null
      },
      recentChanges: [],
      conflictItems: new Set(),
      markAsConflicted: vi.fn(),
      resolveConflict: vi.fn(),
      clearRecentChanges: vi.fn()
    })
    
    render(<MenuManagement />)

    const indicator = screen.getByTestId('realtime-indicator')
    expect(indicator).toHaveTextContent('Status: connected')
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