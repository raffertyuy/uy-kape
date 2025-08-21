import { useState } from 'react'
import PasswordProtection from '@/components/PasswordProtection'
import { MenuManagement } from '@/pages/MenuManagement'
import { OrderDashboard } from '@/components/admin/OrderDashboard'
import { appConfig } from '@/config/app.config'
import { Logo } from '@/components/ui/Logo'

type AdminView = 'dashboard' | 'menu' | 'orders'

function BaristaModulePage() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard')

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

// Navigation component for admin views
function AdminNavigation({ activeView, onNavigate }: { 
  activeView: AdminView
  onNavigate: (_view: AdminView) => void 
}) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center px-4 text-coffee-700 hover:text-coffee-900 font-medium"
            >
              <Logo 
                size="xs" 
                className="h-5 w-5 mr-2" 
                alt="Uy, Kape!"
              />
              Dashboard
            </button>
            <div className="flex space-x-8 ml-6">
              <button
                onClick={() => onNavigate('menu')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  activeView === 'menu'
                    ? 'border-coffee-500 text-coffee-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Management
              </button>
              <button
                onClick={() => onNavigate('orders')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  activeView === 'orders'
                    ? 'border-coffee-500 text-coffee-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
                <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                  Available
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">Barista Admin</span>
          </div>
        </div>
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