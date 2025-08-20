import React, { useState } from 'react'
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
  const [activeTab, setActiveTab] = useState<MenuTab>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<MenuFilters>({})

  // Data hooks
  const { data: categories, isLoading: loadingCategories } = useDrinkCategories()
  const { data: drinks, isLoading: loadingDrinks } = useDrinks()
  const { data: optionCategories, isLoading: loadingOptions } = useOptionCategories()

  // Real-time features
  const { 
    connectionStatus, 
    recentChanges, 
    clearRecentChanges 
  } = useMenuSubscriptions()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (newFilters: MenuFilters) => {
    setFilters(newFilters)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo size="md" className="mr-4" alt="Uy, Kape!" />
              <div>
                <h1 className="text-3xl font-bold text-coffee-900">Menu Management</h1>
                <p className="text-coffee-600 mt-2">
                  Manage your coffee shop menu categories, drinks, and customization options.
                </p>
              </div>
            </div>
            <RealtimeIndicator 
              connectionStatus={connectionStatus}
              className="bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="px-6 pt-6">
            <MenuTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              categoriesCount={categories?.length}
              drinksCount={drinks?.length}
              optionCategoriesCount={optionCategories?.length}
            />
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
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
          <div className="p-6" role="tabpanel" aria-labelledby={`${activeTab}-tab`} id={`${activeTab}-panel`}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600" />
                <span className="ml-2 text-coffee-600">Loading...</span>
              </div>
            ) : (
              <>
                {activeTab === 'categories' && (
                  <DrinkCategoryManagement />
                )}

                {activeTab === 'drinks' && (
                  <DrinkManagement />
                )}

                {activeTab === 'options' && (
                  <OptionManagement />
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