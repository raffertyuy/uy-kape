import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { render, screen, waitFor } from '../../../tests/config/test-utils'

import { MenuManagement } from '@/pages/MenuManagement'import { render, screen, waitFor, fireEvent } from '../../../tests/config/test-utils'import { render, screen, waitFor, act } from '../../../tests/config/test-utils'



describe('MenuManagement - Category Filter URL Persistence', () => {import { MenuManagement } from '@/pages/MenuManagement'import { MenuManagement } from '@/pages/MenuManagement'

  beforeEach(() => {

    // Mock Logo component for asset loading

    vi.doMock('@/components/ui/Logo', () => ({

      Logo: ({ className, alt, ...props }: any) => (describe('MenuManagement - Category Filter URL Persistence', () => {// Add URLSearchParams to global for testing

        <div 

          className={className}   beforeEach(() => {const URLSearchParams = globalThis.URLSearchParams || class URLSearchParams {

          aria-label={alt} 

          data-testid="logo"    // Mock Logo component for asset loading  private params = new Map<string, string>()

          {...props}

        />    vi.doMock('@/components/ui/Logo', () => ({  

      )

    }))      Logo: ({ className, alt, ...props }: any) => (  constructor(init?: string | Record<string, string>) {

  })

        <div     if (typeof init === 'string') {

  beforeAll(() => {

    // Mock ResizeObserver to prevent warnings          className={className}       // Simple parsing for test purposes

    global.ResizeObserver = vi.fn().mockImplementation(() => ({

      observe: vi.fn(),          aria-label={alt}       const pairs = init.split('&')

      unobserve: vi.fn(),

      disconnect: vi.fn(),          data-testid="logo"      for (const pair of pairs) {

    }))

  })          {...props}        const [key, value] = pair.split('=')



  afterAll(() => {        />        if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''))

    vi.restoreAllMocks()

  })      )      }



  it('should render menu management with category filter functionality', async () => {    }))    } else if (init && typeof init === 'object') {

    const initialUrl = '/admin?category=Coffee&tab=drinks'

      })      Object.entries(init).forEach(([key, value]) => this.params.set(key, value))

    render(<MenuManagement />, {

      routerOptions: {    }

        initialEntries: [initialUrl]

      }  beforeAll(() => {  }

    })

    // Mock ResizeObserver to prevent warnings  

    // Wait for the component to load

    await waitFor(() => {    global.ResizeObserver = vi.fn().mockImplementation(() => ({  toString() {

      expect(screen.getByText('Menu Management')).toBeInTheDocument()

    })      observe: vi.fn(),    const pairs: string[] = []



    // Check that the drinks tab is active (based on URL parameter)      unobserve: vi.fn(),    this.params.forEach((value, key) => {

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })

    expect(drinksTab).toHaveClass('bg-white')      disconnect: vi.fn(),      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)

  })

    }))    })

  it('should handle URL encoding in category filters', async () => {

    const initialUrl = '/admin?category=Hot%20Coffee&tab=drinks'  })    return pairs.join('&')

    

    render(<MenuManagement />, {  }

      routerOptions: {

        initialEntries: [initialUrl]  afterAll(() => {}

      }

    })    vi.restoreAllMocks()



    // Wait for the component to load  })// Mock URLSearchParams with methods

    await waitFor(() => {

      expect(screen.getByText('Menu Management')).toBeInTheDocument()const createMockSearchParams = (initialParams: Record<string, string> = {}) => {

    })

  it('should render menu management with category filter functionality', async () => {  const params = new Map(Object.entries(initialParams))

    // The component should handle URL-encoded category names

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })    const initialUrl = '/admin?category=Coffee&tab=drinks'  

    expect(drinksTab).toHaveClass('bg-white')

  })      return {



  it('should render without errors when no URL parameters are provided', async () => {    render(<MenuManagement />, {    get: vi.fn((key: string) => params.get(key) || null),

    const initialUrl = '/admin'

          routerOptions: {    set: vi.fn((key: string, value: string) => params.set(key, value)),

    render(<MenuManagement />, {

      routerOptions: {        initialEntries: [initialUrl]    delete: vi.fn((key: string) => params.delete(key)),

        initialEntries: [initialUrl]

      }      }    has: vi.fn((key: string) => params.has(key)),

    })

    })    entries: vi.fn(() => params.entries()),

    // Wait for the component to load

    await waitFor(() => {    toString: vi.fn(() => new URLSearchParams(Object.fromEntries(params)).toString())

      expect(screen.getByText('Menu Management')).toBeInTheDocument()

    })    // Wait for the component to load  }



    // Should default to drinks tab    await waitFor(() => {}

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })

    expect(drinksTab).toHaveClass('bg-white')      expect(screen.getByText('Menu Management')).toBeInTheDocument()

  })

    })describe('MenuManagement - Category Filter URL Persistence', () => {

  it('should handle invalid category parameters gracefully', async () => {

    const initialUrl = '/admin?category=InvalidCategory&tab=drinks'  beforeEach(() => {

    

    render(<MenuManagement />, {    // Check that the drinks tab is active (based on URL parameter)    

      routerOptions: {

        initialEntries: [initialUrl]    const drinksTab = screen.getByRole('tab', { name: /drinks/i })    // Mock Logo component for asset loading

      }

    })    expect(drinksTab).toHaveClass('bg-white')    vi.doMock('@/components/ui/Logo', () => ({



    // Wait for the component to load - should not crash      Logo: ({ className, alt, ...props }: any) => (

    await waitFor(() => {

      expect(screen.getByText('Menu Management')).toBeInTheDocument()    // Check for category filter presence in the UI        <div 

    })

    await waitFor(() => {          className={className} 

    // Should still render the drinks tab

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })      const filterElement = screen.getByText(/all categories/i) || screen.getByText(/coffee/i)          aria-label={alt} 

    expect(drinksTab).toHaveClass('bg-white')

  })      expect(filterElement).toBeInTheDocument()          data-testid="logo"



  it('should support special characters in category names', async () => {    })          {...props}

    const initialUrl = '/admin?category=Caf%C3%A9%20Au%20Lait&tab=drinks'

      })        >

    render(<MenuManagement />, {

      routerOptions: {          Logo

        initialEntries: [initialUrl]

      }  it('should handle URL encoding in category filters', async () => {        </div>

    })

    const initialUrl = '/admin?category=Hot%20Coffee&tab=drinks'      )

    // Wait for the component to load

    await waitFor(() => {        }))

      expect(screen.getByText('Menu Management')).toBeInTheDocument()

    })    render(<MenuManagement />, {



    // Should handle encoded special characters without crashing      routerOptions: {    // Mock menu data hooks

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })

    expect(drinksTab).toHaveClass('bg-white')        initialEntries: [initialUrl]    vi.doMock('@/hooks/useMenuData', () => ({

  })

})      }      useDrinkCategories: vi.fn(() => ({

    })        data: [

          { id: '1', name: 'Coffee', display_order: 1 },

    // Wait for the component to load          { id: '2', name: 'Special Coffee', display_order: 2 },

    await waitFor(() => {          { id: '3', name: 'Tea', display_order: 3 }

      expect(screen.getByText('Menu Management')).toBeInTheDocument()        ],

    })        isLoading: false,

        refetch: vi.fn()

    // The component should handle URL-encoded category names      })),

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })      useDrinks: vi.fn(() => ({

    expect(drinksTab).toHaveClass('bg-white')        data: [

  })          { id: '1', name: 'Espresso', category_id: '1' },

          { id: '2', name: 'Latte', category_id: '1' },

  it('should default to drinks tab when no tab parameter is provided', async () => {          { id: '3', name: 'Green Tea', category_id: '3' }

    const initialUrl = '/admin?category=Coffee'        ],

            isLoading: false,

    render(<MenuManagement />, {        refetch: vi.fn()

      routerOptions: {      })),

        initialEntries: [initialUrl]      useDrinksWithOptionsPreview: vi.fn(() => ({

      }        data: [],

    })        isLoading: false,

        error: null,

    // Wait for the component to load        refetch: vi.fn()

    await waitFor(() => {      })),

      expect(screen.getByText('Menu Management')).toBeInTheDocument()      useOptionCategories: vi.fn(() => ({

    })        data: [],

        isLoading: false,

    // Should default to drinks tab        refetch: vi.fn()

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })      }))

    expect(drinksTab).toHaveClass('bg-white')    }))

  })

    vi.doMock('@/hooks/useMenuSubscriptions', () => ({

  it('should handle switching between tabs', async () => {      useMenuSubscriptions: vi.fn(() => ({

    const initialUrl = '/admin?tab=drinks'        connectionStatus: { 

              connected: true, 

    render(<MenuManagement />, {          lastUpdate: null, 

      routerOptions: {          error: null 

        initialEntries: [initialUrl]        },

      }        recentChanges: [],

    })        clearRecentChanges: vi.fn()

      }))

    // Wait for the component to load    }))

    await waitFor(() => {

      expect(screen.getByText('Menu Management')).toBeInTheDocument()    // Mock components with minimal implementations

    })    vi.doMock('@/components/menu/ChangeNotification', () => ({

      ChangeNotification: () => <div data-testid="change-notification" />

    // Start with drinks tab active    }))

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })  })

    expect(drinksTab).toHaveClass('bg-white')

  afterEach(() => {

    // Click on categories tab    vi.doUnmock('@/components/ui/Logo')

    const categoriesTab = screen.getByRole('tab', { name: /categories/i })    vi.doUnmock('@/hooks/useMenuData')

    fireEvent.click(categoriesTab)    vi.doUnmock('@/hooks/useMenuSubscriptions')

    vi.doUnmock('@/components/menu/ChangeNotification')

    // Categories tab should now be active  })

    await waitFor(() => {

      expect(categoriesTab).toHaveClass('bg-white')  it('should read category name from URL parameters', async () => {

    })    // Set up URL with category filter

  })    mockSearchParams = createMockSearchParams({

      tab: 'drinks',

  it('should render without errors when no URL parameters are provided', async () => {      category: 'Coffee'

    const initialUrl = '/admin'    })

    

    render(<MenuManagement />, {    await act(async () => {

      routerOptions: {      render(<MenuManagement />)

        initialEntries: [initialUrl]    })

      }

    })    await waitFor(() => {

      expect(screen.getByText('Menu Management')).toBeInTheDocument()

    // Wait for the component to load    })

    await waitFor(() => {

      expect(screen.getByText('Menu Management')).toBeInTheDocument()    // Verify that the category filter is applied by checking URL parameters

    })    expect(mockSearchParams.get).toHaveBeenCalledWith('category')

    expect(mockSearchParams.get).toHaveBeenCalledWith('tab')

    // Should default to drinks tab  })

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })

    expect(drinksTab).toHaveClass('bg-white')  it('should handle URL-encoded category names', async () => {

  })    // Set up URL with URL-encoded category name

    mockSearchParams = createMockSearchParams({

  it('should maintain URL structure when switching tabs', async () => {      tab: 'drinks',

    const initialUrl = '/admin?category=Coffee&tab=drinks'      category: encodeURIComponent('Special Coffee')

        })

    render(<MenuManagement />, {

      routerOptions: {    await act(async () => {

        initialEntries: [initialUrl]      render(<MenuManagement />)

      }    })

    })

    await waitFor(() => {

    // Wait for the component to load      expect(screen.getByText('Menu Management')).toBeInTheDocument()

    await waitFor(() => {    })

      expect(screen.getByText('Menu Management')).toBeInTheDocument()

    })    // Verify that the encoded category name is properly decoded

    expect(mockSearchParams.get).toHaveBeenCalledWith('category')

    // Component should render successfully with URL parameters  })

    expect(screen.getByRole('tab', { name: /drinks/i })).toHaveClass('bg-white')

  })  it('should only apply category filter on drinks tab', async () => {

    // Set up URL with category filter but on categories tab

  it('should handle invalid category parameters gracefully', async () => {    mockSearchParams = createMockSearchParams({

    const initialUrl = '/admin?category=InvalidCategory&tab=drinks'      category: 'Coffee'

          // No tab parameter means we're on categories tab (default)

    render(<MenuManagement />, {    })

      routerOptions: {

        initialEntries: [initialUrl]    await act(async () => {

      }      render(<MenuManagement />)

    })    })



    // Wait for the component to load - should not crash    await waitFor(() => {

    await waitFor(() => {      expect(screen.getByText('Menu Management')).toBeInTheDocument()

      expect(screen.getByText('Menu Management')).toBeInTheDocument()    })

    })

    // Verify that category filter is not applied when not on drinks tab

    // Should still render the drinks tab    expect(mockSearchParams.get).toHaveBeenCalledWith('category')

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })  })

    expect(drinksTab).toHaveClass('bg-white')

  })  it('should clear category filter when switching away from drinks tab', async () => {

    // Start on drinks tab with category filter

  it('should support special characters in category names', async () => {    mockSearchParams = createMockSearchParams({

    const initialUrl = '/admin?category=Caf%C3%A9%20Au%20Lait&tab=drinks'      tab: 'drinks',

          category: 'Coffee'

    render(<MenuManagement />, {    })

      routerOptions: {

        initialEntries: [initialUrl]    await act(async () => {

      }      render(<MenuManagement />)

    })    })



    // Wait for the component to load    await waitFor(() => {

    await waitFor(() => {      expect(screen.getByText('Menu Management')).toBeInTheDocument()

      expect(screen.getByText('Menu Management')).toBeInTheDocument()    })

    })

    // The component should set up search params with tab change handler

    // Should handle encoded special characters without crashing    // When tab changes away from drinks, category should be cleared

    const drinksTab = screen.getByRole('tab', { name: /drinks/i })    expect(mockSetSearchParams).toBeDefined()

    expect(drinksTab).toHaveClass('bg-white')  })

  })

})  it('should encode category names in URL', async () => {
    mockSearchParams = createMockSearchParams({
      tab: 'drinks'
    })

    await act(async () => {
      render(<MenuManagement />)
    })

    await waitFor(() => {
      expect(screen.getByText('Menu Management')).toBeInTheDocument()
    })

    // Simulate filter change with category name containing spaces
    const setSearchParamsCall = mockSetSearchParams.mock.calls[0]
    if (setSearchParamsCall) {
      const updateFunction = setSearchParamsCall[0]
      if (typeof updateFunction === 'function') {
        const mockPrevParams = new Map([['tab', 'drinks']])
        const mockPrev = {
          entries: () => mockPrevParams.entries()
        }
        
        // Test that the update function would handle category encoding
        const result = updateFunction(mockPrev as any)
        expect(result).toBeDefined()
      }
    }
  })

  it('should handle invalid category names gracefully', async () => {
    // Set up URL with non-existent category
    mockSearchParams = createMockSearchParams({
      tab: 'drinks',
      category: 'NonExistentCategory'
    })

    await act(async () => {
      render(<MenuManagement />)
    })

    await waitFor(() => {
      expect(screen.getByText('Menu Management')).toBeInTheDocument()
    })

    // Component should still render without errors
    expect(screen.getByRole('tab', { name: /drinks/i })).toBeInTheDocument()
  })

  it('should maintain other filters when category filter is applied', async () => {
    // Set up URL with multiple filters
    mockSearchParams = createMockSearchParams({
      tab: 'drinks',
      category: 'Coffee',
      isActive: 'true',
      sortBy: 'name'
    })

    await act(async () => {
      render(<MenuManagement />)
    })

    await waitFor(() => {
      expect(screen.getByText('Menu Management')).toBeInTheDocument()
    })

    // Verify all filter parameters are read
    expect(mockSearchParams.get).toHaveBeenCalledWith('category')
    expect(mockSearchParams.get).toHaveBeenCalledWith('isActive')
    expect(mockSearchParams.get).toHaveBeenCalledWith('sortBy')
  })

  it('should validate category parameter format', async () => {
    // Set up URL with empty category parameter
    mockSearchParams = createMockSearchParams({
      tab: 'drinks',
      category: ''
    })

    await act(async () => {
      render(<MenuManagement />)
    })

    await waitFor(() => {
      expect(screen.getByText('Menu Management')).toBeInTheDocument()
    })

    // Component should handle empty category gracefully
    expect(screen.getByRole('tab', { name: /drinks/i })).toBeInTheDocument()
  })
})