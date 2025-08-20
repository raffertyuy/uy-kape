import type { ReactNode } from 'react';
import { useState } from 'react'
import { usePasswordAuth } from '@/hooks/usePasswordAuth'
import { Logo } from '@/components/ui/Logo'

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

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
          <div className="flex items-center justify-center mb-4">
            <Logo size="lg" className="mr-3" alt="" />
            <h1 className="text-2xl font-bold text-coffee-800">Uy, Kape!</h1>
          </div>
          <h2 className="text-xl font-semibold text-coffee-700 mb-2" id="password-form-title">
            {title}
          </h2>
          <p className="text-coffee-600" id="password-form-description">
            {description}
          </p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          aria-labelledby="password-form-title"
          aria-describedby="password-form-description"
        >
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
              onChange={handlePasswordChange}
              className="coffee-input w-full"
              placeholder="Enter password"
              required
              autoComplete="current-password"
              aria-describedby={error ? 'password-error' : undefined}
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>

          {error && (
            <div 
              id="password-error"
              className="text-red-600 text-sm text-center" 
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="coffee-button-primary w-full disabled:bg-coffee-300 disabled:cursor-not-allowed"
            aria-describedby={isLoading ? 'loading-status' : undefined}
          >
            {isLoading ? 'Checking...' : 'Access'}
          </button>
          
          {isLoading && (
            <div id="loading-status" className="sr-only" aria-live="polite">
              Verifying password, please wait
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-coffee-600 hover:text-coffee-800 text-sm underline coffee-focus"
            aria-label="Go back to previous page"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default PasswordProtection