import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-coffee-lg p-8 text-center">
        <div className="mb-6">
          <Logo 
            size="xl" 
            className="mx-auto opacity-80 mb-4" 
            alt="Uy, Kape!"
          />
          <h1 className="text-3xl font-bold text-coffee-800">
            Uy, Kape!
          </h1>
        </div>
        
        <div className="mb-8">
          <div className="text-6xl mb-4">☕</div>
          <h2 className="text-2xl font-bold text-coffee-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-coffee-600">
            Looks like this page went for a coffee break. Let's get you back to where the action is!
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            🏠 Back to Home
          </Link>
          
          <Link
            to="/order"
            className="block w-full bg-coffee-200 hover:bg-coffee-300 text-coffee-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            ☕ Order Coffee
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-coffee-500">
          <p>Error Code: 404</p>
        </div>
      </div>
    </div>
  )
}