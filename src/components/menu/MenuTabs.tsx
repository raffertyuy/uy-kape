import React, { useRef, useEffect } from 'react'

export type MenuTab = 'categories' | 'drinks' | 'options'

interface MenuTabsProps {
  activeTab: MenuTab
  onTabChange: (_tab: MenuTab) => void
  categoriesCount?: number
  drinksCount?: number
  optionCategoriesCount?: number
}

export const MenuTabs: React.FC<MenuTabsProps> = ({
  activeTab,
  onTabChange,
  categoriesCount,
  drinksCount,
  optionCategoriesCount
}) => {
  const scrollContainerRef = useRef<HTMLElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeTabRef = useRef<any>(null)

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const activeButton = activeTabRef.current
      
      // Check if the active tab is fully visible
      try {
        const containerRect = container.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        
        // Ensure we have valid rect objects (for test environments)
        if (!containerRect || !buttonRect || 
            typeof containerRect.left === 'undefined' || 
            typeof buttonRect.left === 'undefined') {
          return
        }
        
        const isVisible = 
          buttonRect.left >= containerRect.left && 
          buttonRect.right <= containerRect.right
        
        if (!isVisible) {
          activeButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          })
        }
      } catch (error) {
        // Handle test environment or browser compatibility issues
        // Silent fail in production, this is for browser measurement only
      }
    }
  }, [activeTab])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, currentTab: MenuTab) => {
    let nextTab: MenuTab | null = null
    
    switch (event.key) {
      case 'ArrowLeft':
        if (currentTab === 'drinks') nextTab = 'categories'
        else if (currentTab === 'options') nextTab = 'drinks'
        break
      case 'ArrowRight':
        if (currentTab === 'categories') nextTab = 'drinks'
        else if (currentTab === 'drinks') nextTab = 'options'
        break
      case 'Home':
        nextTab = 'categories'
        break
      case 'End':
        nextTab = 'options'
        break
      default:
        return
    }
    
    if (nextTab) {
      event.preventDefault()
      onTabChange(nextTab)
    }
  }

  const tabs = [
    {
      id: 'categories' as MenuTab,
      label: 'Drink Categories',
      count: categoriesCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
        </svg>
      )
    },
    {
      id: 'drinks' as MenuTab,
      label: 'Drinks',
      count: drinksCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'options' as MenuTab,
      label: 'Option Categories',
      count: optionCategoriesCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      )
    }
  ]

  return (
    <div className="border-b border-coffee-200">
      <nav 
        ref={scrollContainerRef}
        className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scroll-smooth" 
        aria-label="Menu management tabs" 
        role="tablist"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={activeTab === tab.id ? activeTabRef : null}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            className={`py-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'border-coffee-500 text-coffee-600'
                : 'border-transparent text-coffee-500 hover:text-coffee-700 hover:border-coffee-300'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className={activeTab === tab.id ? 'text-coffee-600' : 'text-coffee-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.id
                    ? 'bg-coffee-100 text-coffee-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}