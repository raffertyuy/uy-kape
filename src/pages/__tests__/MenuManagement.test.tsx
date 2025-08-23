import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { render, screen } from '../../../tests/config/test-utils'
import { MenuManagement } from '@/pages/MenuManagement'

describe('MenuManagement - Basic Rendering', () => {
  beforeAll(() => {
    // Mock Logo component for asset loading
    vi.doMock('@/components/ui/Logo', () => ({
      Logo: ({ className, alt, ...props }: any) => (
        <div 
          className={className} 
          aria-label={alt} 
          data-testid="logo"
          {...props}
        >
          Logo
        </div>
      )
    }))

    // Simplified mocks scoped to this test suite only
    vi.doMock('@/hooks/useMenuData', () => ({
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

    vi.doMock('@/hooks/useMenuSubscriptions', () => ({
      useMenuSubscriptions: vi.fn(() => ({
        connectionStatus: { 
          connected: true, 
          lastUpdate: null, 
          error: null 
        },
        recentChanges: [],
        clearRecentChanges: vi.fn()
      }))
    }))

    // Mock components with minimal implementations
    vi.doMock('@/components/menu/MenuNotifications', () => ({
      MenuNotifications: () => <div data-testid="menu-notifications" />
    }))

    vi.doMock('@/components/menu/ChangeNotification', () => ({
      ChangeNotification: () => <div data-testid="change-notification" />
    }))

    vi.doMock('@/components/menu/DrinkCategoryForm', () => ({
      DrinkCategoryForm: () => <div data-testid="drink-category-form" />
    }))

    vi.doMock('@/components/menu/DrinkForm', () => ({
      DrinkForm: () => <div data-testid="drink-form" />
    }))
  })

  afterAll(() => {
    // Clean up mocks after this test suite
    vi.doUnmock('@/components/ui/Logo')
    vi.doUnmock('@/hooks/useMenuData')
    vi.doUnmock('@/hooks/useMenuSubscriptions')
    vi.doUnmock('@/components/menu/MenuNotifications')
    vi.doUnmock('@/components/menu/ChangeNotification')
    vi.doUnmock('@/components/menu/ChangeNotification')
    vi.doUnmock('@/components/menu/DrinkCategoryForm')
    vi.doUnmock('@/components/menu/DrinkForm')
  })
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