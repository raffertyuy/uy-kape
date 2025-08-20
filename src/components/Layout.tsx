import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isWelcomePage = location.pathname === '/'

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      {!isWelcomePage && (
        <nav className="bg-white shadow-sm border-b border-coffee-200" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                to="/"
                className="flex items-center text-coffee-800 hover:text-coffee-600 transition-colors coffee-focus rounded-md"
                aria-label="Uy, Kape! Home"
              >
                <Logo 
                  size="sm" 
                  className="mr-2" 
                  alt=""
                />
                <h1 className="text-xl font-bold">
                  Uy, Kape! ☕
                </h1>
              </Link>
              
              <div className="flex space-x-4" role="menubar" aria-label="Navigation menu">
                <Link
                  to="/order"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors coffee-focus ${
                    location.pathname === '/order'
                      ? 'bg-coffee-600 text-white'
                      : 'text-coffee-700 hover:text-coffee-600 hover:bg-coffee-50'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/order' ? 'page' : undefined}
                >
                  Order
                </Link>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors coffee-focus ${
                    location.pathname === '/admin'
                      ? 'bg-coffee-600 text-white'
                      : 'text-coffee-700 hover:text-coffee-600 hover:bg-coffee-50'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/admin' ? 'page' : undefined}
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={isWelcomePage ? '' : 'container mx-auto px-4 py-8'} role="main">
        {children}
      </main>
    </div>
  )
}

export default Layout