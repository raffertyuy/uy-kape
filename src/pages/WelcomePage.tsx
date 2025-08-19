import { Link } from 'react-router-dom'
import { APP_NAME, APP_DESCRIPTION } from '@/config/app.config'

function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-coffee-800 mb-2">
            {APP_NAME} ☕
          </h1>
          <p className="text-coffee-600 text-lg">
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