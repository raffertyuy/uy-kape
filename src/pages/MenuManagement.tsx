import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { MenuTabs, type MenuTab } from '@/components/menu/MenuTabs'
import { MenuSearch, type MenuFilters } from '@/components/menu/MenuSearch'
import { RealtimeIndicator } from '@/components/menu/RealtimeIndicator'
import { ChangeNotification } from '@/components/menu/ChangeNotification'
import { DrinkCategoryManagement } from '@/components/menu/DrinkCategoryManagement'
import { DrinkManagement } from '@/components/menu/DrinkManagement'
import { OptionManagement } from '@/components/menu/OptionManagement'
import { Logo } from '@/components/ui/Logo'
import { 
  useDrinkCategories, 
  useDrinks, 
  useOptionCategories 
} from '@/hooks/useMenuData'
import { useMenuSubscriptions } from '@/hooks/useMenuSubscriptions'

export const MenuManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get tab from URL parameters with validation
  const tabParam = searchParams.get('tab') as MenuTab | null
  const activeTab: MenuTab = tabParam && ['categories', 'drinks', 'options'].includes(tabParam) ? tabParam : 'categories'
  
  // URL parameter-based filters state with validation
  const categoryParam = searchParams.get('category')
  const isActiveParam = searchParams.get('isActive')
  const sortByParam = searchParams.get('sortBy') as 'name' | 'created_at' | 'display_order' | null
  const sortOrderParam = searchParams.get('sortOrder') as 'asc' | 'desc' | null
  
  const filters: MenuFilters = {
    // Only include category filter if we're on the drinks tab
    ...(categoryParam && activeTab === 'drinks' && { categoryName: categoryParam }),
    ...(isActiveParam && { isActive: isActiveParam === 'true' }),
    ...(sortByParam && ['name', 'created_at', 'display_order'].includes(sortByParam) && { sortBy: sortByParam }),
    ...(sortOrderParam && ['asc', 'desc'].includes(sortOrderParam) && { sortOrder: sortOrderParam })
  }
  
  // URL parameter-based search query state
  const searchQuery = searchParams.get('search') || ''

  // URL parameter-based tab setter with cleanup
  const handleTabChange = (tab: MenuTab) => {
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev.entries())
      
      // Set or clear tab parameter
      if (tab === 'categories') {
        delete params.tab // Default tab, no parameter needed
      } else {
        params.tab = tab
      }
      
      // Clear tab-specific filters when switching tabs
      if (tab !== 'drinks') {
        // Category filter only applies to drinks tab
        delete params.category
      }
      
      return params
    })
  }

  // Data hooks
  const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = useDrinkCategories()
  const { data: drinks, isLoading: loadingDrinks, refetch: refetchDrinks } = useDrinks()
  const { data: optionCategories, isLoading: loadingOptions, refetch: refetchOptions } = useOptionCategories()

  // Handle data changes from child components
  const handleDataChange = () => {
    refetchCategories()
    refetchDrinks()
    refetchOptions()
  }

  // Real-time features
  const { 
    connectionStatus, 
    recentChanges, 
    clearRecentChanges 
  } = useMenuSubscriptions()

  const handleSearch = (query: string) => {
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev.entries())
      if (query.trim()) {
        params.search = query.trim()
      } else {
        delete params.search // Remove parameter if search is empty
      }
      return params
    })
  }

  const handleFilter = (newFilters: MenuFilters) => {
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev.entries())
      
      // Remove all filter parameters first
      delete params.category
      delete params.isActive
      delete params.sortBy
      delete params.sortOrder
      
      // Add new filter parameters if they exist and are valid for current tab
      if (newFilters.categoryName && activeTab === 'drinks') {
        params.category = newFilters.categoryName
      }
      if (newFilters.isActive !== undefined) {
        params.isActive = newFilters.isActive.toString()
      }
      if (newFilters.sortBy && ['name', 'created_at', 'display_order'].includes(newFilters.sortBy)) {
        params.sortBy = newFilters.sortBy
      }
      if (newFilters.sortOrder && ['asc', 'desc'].includes(newFilters.sortOrder)) {
        params.sortOrder = newFilters.sortOrder
      }
      
      return params
    })
  }

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'categories':
        return 'Search drink categories...'
      case 'drinks':
        return 'Search drinks...'
      case 'options':
        return 'Search option categories...'
      default:
        return 'Search...'
    }
  }

  const isLoading = loadingCategories || loadingDrinks || loadingOptions

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-start sm:items-center">
              <Logo size="md" className="mr-3 sm:mr-4 flex-shrink-0" alt="Uy, Kape!" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-coffee-900 truncate">Menu Management</h1>
                <p className="text-coffee-600 mt-1 sm:mt-2 text-sm sm:text-base">
                  Manage your coffee shop menu categories, drinks, and customization options.
                </p>
              </div>
            </div>
            <RealtimeIndicator 
              connectionStatus={connectionStatus}
              className="bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm flex-shrink-0 self-start sm:self-auto"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="px-6 pt-6">
            <MenuTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              categoriesCount={categories?.length}
              drinksCount={drinks?.length}
              optionCategoriesCount={optionCategories?.length}
            />
          </div>

          {/* Search and Filters */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <MenuSearch
              searchQuery={searchQuery}
              activeFilters={filters}
              onSearch={handleSearch}
              onFilter={handleFilter}
              showCategoryFilter={activeTab === 'drinks'}
              categories={categories?.map(cat => ({ id: cat.id, name: cat.name })) || []}
              placeholder={getSearchPlaceholder()}
            />
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6" role="tabpanel" aria-labelledby={`${activeTab}-tab`} id={`${activeTab}-panel`}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600" />
                <span className="ml-2 text-coffee-600">Loading...</span>
              </div>
            ) : (
              <>
                {activeTab === 'categories' && (
                  <DrinkCategoryManagement 
                    onDataChange={handleDataChange} 
                    searchQuery={searchQuery}
                    filters={filters}
                  />
                )}

                {activeTab === 'drinks' && (
                  <DrinkManagement 
                    onDataChange={handleDataChange} 
                    filters={filters}
                    onFilter={handleFilter}
                    searchQuery={searchQuery}
                  />
                )}

                {activeTab === 'options' && (
                  <OptionManagement 
                    onDataChange={handleDataChange} 
                    searchQuery={searchQuery}
                    filters={filters}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-coffee-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {categories?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-coffee-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Drinks</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {drinks?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-coffee-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Option Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {optionCategories?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time change notifications */}
      <ChangeNotification
        changes={recentChanges}
        onClearChanges={clearRecentChanges}
      />
    </div>
  )
}