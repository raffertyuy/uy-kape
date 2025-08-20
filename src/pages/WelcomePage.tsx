import { Link } from 'react-router-dom'
import { APP_DESCRIPTION } from '@/config/app.config'
import { Logo } from '@/components/ui/Logo'

function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="max-w-sm sm:max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-2 sm:space-y-0 sm:space-x-3">
            <Logo 
              size="xl" 
              className="flex-shrink-0" 
              alt="Uy, Kape! Logo"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-coffee-800 text-center sm:text-left">
              Uy, Kape! ☕
            </h1>
          </div>
          <p className="text-coffee-600 text-base sm:text-lg">
            {APP_DESCRIPTION}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/order"
            className="block w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            🛍️ Order Here
          </Link>
          
          <Link
            to="/admin"
            className="block w-full bg-coffee-200 hover:bg-coffee-300 text-coffee-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            ⚙️ Barista Administration
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-coffee-500">
          <p>
            A simple, password-protected coffee ordering system for your workspace
          </p>
          <div className="mt-4 flex justify-center space-x-4 text-xs">
            <span className="bg-coffee-100 text-coffee-700 px-2 py-1 rounded">
              React + TypeScript
            </span>
            <span className="bg-coffee-100 text-coffee-700 px-2 py-1 rounded">
              Tailwind CSS
            </span>
            <span className="bg-coffee-100 text-coffee-700 px-2 py-1 rounded">
              Supabase
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage