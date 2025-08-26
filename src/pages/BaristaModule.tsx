import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PasswordProtection from '@/components/PasswordProtection'
import { MenuManagement } from '@/pages/MenuManagement'
import { OrderDashboard } from '@/components/admin/OrderDashboard'
import { appConfig } from '@/config/app.config'
import { Logo } from '@/components/ui/Logo'

type AdminView = 'dashboard' | 'menu' | 'orders'

function BaristaModulePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewParam = searchParams.get('view') as AdminView | null
  const activeView: AdminView = viewParam && ['dashboard', 'menu', 'orders'].includes(viewParam) ? viewParam : 'dashboard'

  const setActiveView = (view: AdminView) => {
    if (view === 'dashboard') {
      setSearchParams({}) // Clear parameters for dashboard
    } else {
      setSearchParams({ view })
    }
  }

  const renderContent = () => {
    switch (activeView) {
      case 'menu':
        return <MenuManagement />
      case 'orders':
        return <OrderDashboard />
      default:
        return <AdminDashboard onNavigate={setActiveView} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {activeView !== 'dashboard' && (
        <AdminNavigation 
          activeView={activeView} 
          onNavigate={setActiveView}
        />
      )}
      {renderContent()}
    </div>
  )
}

// Admin Dashboard (main landing page)
function AdminDashboard({ onNavigate }: { onNavigate: (_view: AdminView) => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Logo size="md" className="mr-3" alt="Uy, Kape! Logo" />
          <h2 className="text-3xl font-bold text-coffee-800">
            Barista Administration Dashboard
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => onNavigate('orders')}
            className="text-center py-8 px-6 border-2 border-coffee-200 bg-coffee-50 rounded-lg hover:border-coffee-400 hover:bg-coffee-100 transition-colors group"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-coffee-700 mb-2 group-hover:text-coffee-800">
              Order Management
            </h3>
            <p className="text-coffee-600 text-sm">
              View and manage incoming orders, update order status, and handle queue.
            </p>
            <div className="mt-4 text-coffee-700 font-medium bg-coffee-200 px-3 py-1 rounded-full text-xs">
              Available Now
            </div>
          </button>
          
          <button
            onClick={() => onNavigate('menu')}
            className="text-center py-8 px-6 border-2 border-coffee-200 bg-coffee-50 rounded-lg hover:border-coffee-400 hover:bg-coffee-100 transition-colors group"
          >
            <div className="text-4xl mb-4">☕</div>
            <h3 className="text-lg font-semibold text-coffee-700 mb-2 group-hover:text-coffee-800">
              Menu Management
            </h3>
            <p className="text-coffee-600 text-sm">
              Add, edit, and remove drinks from the menu. Configure drink options and categories.
            </p>
            <div className="mt-4 text-coffee-700 font-medium bg-coffee-200 px-3 py-1 rounded-full text-xs">
              Available Now
            </div>
          </button>
        </div>
        
        <div className="mt-8 p-6 bg-coffee-50 rounded-lg">
          <h4 className="font-semibold text-coffee-800 mb-2">
            System Status:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-coffee-600">Menu System</div>
              <div className="text-xs text-green-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-coffee-600">Order System</div>
              <div className="text-xs text-green-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">🔄</div>
              <div className="text-sm text-coffee-600">Real-time Updates</div>
              <div className="text-xs text-blue-600">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Navigation button component for desktop
function NavigationButton({ activeView, view, onNavigate, children }: { 
  activeView: AdminView
  view: AdminView
  onNavigate: (_view: AdminView) => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={() => onNavigate(view)}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
        activeView === view
          ? 'border-coffee-500 text-coffee-900'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

// Mobile navigation button component
function MobileNavigationButton({ activeView, view, onNavigate, children, onMenuClose }: { 
  activeView: AdminView
  view: AdminView
  onNavigate: (_view: AdminView) => void
  children: React.ReactNode
  onMenuClose: () => void
}) {
  const handleClick = () => {
    onNavigate(view)
    onMenuClose()
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
        activeView === view
          ? 'bg-coffee-100 text-coffee-900'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

// Hamburger icon component
function HamburgerIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

// Navigation component for admin views
function AdminNavigation({ activeView, onNavigate }: { 
  activeView: AdminView
  onNavigate: (_view: AdminView) => void 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo/Dashboard + Mobile menu button */}
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center px-1 sm:px-3 py-2 text-coffee-700 hover:text-coffee-900 font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
            >
              <Logo 
                size="xs" 
                className="h-5 w-5 mr-1 sm:mr-2 flex-shrink-0" 
                alt="Uy, Kape!"
              />
              <span className="hidden sm:inline truncate">Uy, Kape!</span>
            </button>
            
            {/* Mobile menu button */}
            <button
              className="ml-1 sm:hidden p-2 rounded-md text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <HamburgerIcon />
            </button>
            
            {/* Desktop navigation items */}
            <div className="hidden sm:flex sm:space-x-4 lg:space-x-8 sm:ml-4 lg:ml-6">
              <NavigationButton activeView={activeView} view="orders" onNavigate={onNavigate}>
                Orders
                <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                  Available
                </span>
              </NavigationButton>
              <NavigationButton activeView={activeView} view="menu" onNavigate={onNavigate}>
                Menu Management
              </NavigationButton>
            </div>
          </div>
          
          {/* Right side - Admin indicator */}
          <div className="flex items-center flex-shrink-0">
            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Barista Admin</span>
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-3 pt-3 pb-4 space-y-2">
              <MobileNavigationButton 
                activeView={activeView} 
                view="orders" 
                onNavigate={onNavigate}
                onMenuClose={closeMobileMenu}
              >
                Orders
                <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                  Available
                </span>
              </MobileNavigationButton>
              <MobileNavigationButton 
                activeView={activeView} 
                view="menu" 
                onNavigate={onNavigate}
                onMenuClose={closeMobileMenu}
              >
                Menu Management
              </MobileNavigationButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function ProtectedBaristaModule() {
  return (
    <PasswordProtection
      requiredPassword={appConfig.adminPassword}
      title="Barista Administration"
      description="Enter the admin password to access the barista dashboard"
      role="admin" // eslint-disable-line jsx-a11y/aria-role
    >
      <BaristaModulePage />
    </PasswordProtection>
  )
}

export default ProtectedBaristaModule