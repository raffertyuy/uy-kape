import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MenuManagement } from '@/pages/MenuManagement'

// Simplified mocks to reduce memory usage
vi.mock('@/hooks/useMenuData', () => ({
  useDrinkCategories: vi.fn(() => ({
    data: [],
    isLoading: false
  })),
  useDrinks: vi.fn(() => ({
    data: [],
    isLoading: false
  })),
  useDrinksWithOptionsPreview: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn()
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
    connectionStatus: 'connected',
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

// Mock components with minimal implementations
vi.mock('@/components/menu/MenuNotifications', () => ({
  MenuNotifications: () => <div data-testid="menu-notifications" />
}))

vi.mock('@/components/menu/RealtimeIndicator', () => ({
  RealtimeIndicator: () => <div data-testid="realtime-indicator" />
}))

vi.mock('@/components/menu/ChangeNotification', () => ({
  ChangeNotification: () => <div data-testid="change-notification" />
}))

vi.mock('@/components/menu/DrinkCategoryForm', () => ({
  DrinkCategoryForm: () => <div data-testid="drink-category-form" />
}))

vi.mock('@/components/menu/DrinkForm', () => ({
  DrinkForm: () => <div data-testid="drink-form" />
}))

describe('MenuManagement - Basic Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the menu management page correctly', () => {
    render(<MenuManagement />)

    // Check main elements are present
    expect(screen.getByText('Menu Management')).toBeInTheDocument()
    expect(screen.getByText('Manage your coffee shop menu categories, drinks, and customization options.')).toBeInTheDocument()
    
    // Check tabs are present
    expect(screen.getByRole('tab', { name: /drink categories/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /drinks/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /option categories/i })).toBeInTheDocument()

    // Check real-time indicator
    expect(screen.getByTestId('realtime-indicator')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
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