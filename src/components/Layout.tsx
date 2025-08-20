import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { APP_NAME } from '@/config/app.config'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isWelcomePage = location.pathname === '/'

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      {!isWelcomePage && (
        <nav className="bg-white shadow-sm border-b border-coffee-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                to="/"
                className="flex items-center text-coffee-800 hover:text-coffee-600 transition-colors"
              >
                <h1 className="text-xl font-bold">
                  {APP_NAME} ☕
                </h1>
              </Link>
              
              <div className="flex space-x-4">
                <Link
                  to="/order"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/order'
                      ? 'bg-coffee-600 text-white'
                      : 'text-coffee-700 hover:text-coffee-600 hover:bg-coffee-50'
                  }`}
                >
                  Order
                </Link>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-coffee-600 text-white'
                      : 'text-coffee-700 hover:text-coffee-600 hover:bg-coffee-50'
                  }`}
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={isWelcomePage ? '' : 'container mx-auto px-4 py-8'}>
        {children}
      </main>
    </div>
  )
}

export default Layout