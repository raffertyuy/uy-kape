import { useState, ReactNode } from 'react'
import { usePasswordAuth } from '@/hooks/usePasswordAuth'

interface PasswordProtectionProps {
  children: ReactNode
  requiredPassword: string
  title: string
  description: string
  role: 'guest' | 'admin'
}

function PasswordProtection({
  children,
  requiredPassword,
  title,
  description,
  role
}: PasswordProtectionProps) {
  const { isAuthenticated, authenticate } = usePasswordAuth(requiredPassword, role)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await authenticate(password)
      if (!success) {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-coffee-800 mb-2">
            {title}
          </h2>
          <p className="text-coffee-600">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-coffee-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              placeholder="Enter password"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full bg-coffee-600 hover:bg-coffee-700 disabled:bg-coffee-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Checking...' : 'Access'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-coffee-600 hover:text-coffee-800 text-sm underline"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default PasswordProtection