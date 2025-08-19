import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import PasswordProtection from '../PasswordProtection'

// Mock the password auth hook
const mockAuthenticate = vi.fn()
const mockLogout = vi.fn()

vi.mock('@/hooks/usePasswordAuth', () => ({
  usePasswordAuth: vi.fn(() => ({
    isAuthenticated: false,
    role: undefined,
    authenticate: mockAuthenticate,
    logout: mockLogout
  }))
}))

// Get the mocked function for testing
import { usePasswordAuth } from '@/hooks/usePasswordAuth'
const mockUsePasswordAuth = vi.mocked(usePasswordAuth)

// Mock window.history.back
const mockHistoryBack = vi.fn()
Object.defineProperty(window, 'history', {
  value: {
    back: mockHistoryBack,
  },
  writable: true,
})

describe('PasswordProtection', () => {
  const defaultProps = {
    requiredPassword: 'test123',
    title: 'Test Access',
    description: 'Enter password to continue',
    role: 'guest' as const,
    children: <div data-testid="protected-content">Protected Content</div>,
  }

  const mockAuthenticate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePasswordAuth.mockReturnValue({
      isAuthenticated: false,
      role: undefined,
      authenticate: mockAuthenticate,
      logout: mockLogout
    })
  })

  describe('Rendering', () => {
    it('should render password form when not authenticated', () => {
      render(<PasswordProtection {...defaultProps} />)

      expect(screen.getByText('Test Access')).toBeInTheDocument()
      expect(screen.getByText('Enter password to continue')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Access' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '← Back' })).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should render children when authenticated', () => {
      mockUsePasswordAuth.mockReturnValue({
        isAuthenticated: true,
        role: 'guest',
        authenticate: mockAuthenticate,
        logout: mockLogout
      })

      render(<PasswordProtection {...defaultProps} />)

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByText('Test Access')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    })

    it('should render with custom title and description', () => {
      const customProps = {
        ...defaultProps,
        title: 'Admin Panel',
        description: 'Administrator access required',
      }

      render(<PasswordProtection {...customProps} />)

      expect(screen.getByText('Admin Panel')).toBeInTheDocument()
      expect(screen.getByText('Administrator access required')).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
      // Skip autoFocus test in JSDOM as it doesn't fully support this
      
      const form = passwordInput.closest('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Form Interaction', () => {
    it('should update password input value', async () => {
      const user = userEvent.setup()
      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'mypassword')

      expect(passwordInput).toHaveValue('mypassword')
    })

    it('should disable submit button when password is empty', () => {
      render(<PasswordProtection {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: 'Access' })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when password is entered', async () => {
      const user = userEvent.setup()
      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Access' })

      await user.type(passwordInput, 'test')
      expect(submitButton).toBeEnabled()
    })

    it('should disable submit button for whitespace-only password', async () => {
      const user = userEvent.setup()
      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Access' })

      await user.type(passwordInput, '   ')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission correctly', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue(true)

      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Access' })

      await user.type(passwordInput, 'correct123')
      await user.click(submitButton)

      expect(mockAuthenticate).toHaveBeenCalledWith('correct123')
    })

    it('should show loading state during authentication', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))

      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Access' })

      await user.type(passwordInput, 'test123')
      await user.click(submitButton)

      expect(screen.getByText('Checking...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      await waitFor(() => {
        expect(screen.queryByText('Checking...')).not.toBeInTheDocument()
      })
    })

    it('should show error on wrong password', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue(false)

      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Access' })

      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument()
      })

      // Password field should be cleared
      expect(passwordInput).toHaveValue('')
    })

    it('should clear password field after unsuccessful authentication', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue(false)

      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(screen.getByRole('button', { name: 'Access' }))

      await waitFor(() => {
        expect(passwordInput).toHaveValue('')
      })
    })

    it('should handle authentication errors gracefully', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockRejectedValue(new Error('Network error'))

      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'test123')
      await user.click(screen.getByRole('button', { name: 'Access' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument()
      })
    })

    it('should submit form on Enter key press', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue(true)

      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'test123')
      await user.keyboard('{Enter}')

      expect(mockAuthenticate).toHaveBeenCalledWith('test123')
    })
  })

  describe('Navigation', () => {
    it('should call history.back() when back button is clicked', async () => {
      const user = userEvent.setup()
      render(<PasswordProtection {...defaultProps} />)

      const backButton = screen.getByRole('button', { name: '← Back' })
      await user.click(backButton)

      expect(mockHistoryBack).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should clear error message when typing new password', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')

      // First attempt - wrong password
      await user.type(passwordInput, 'wrong')
      await user.click(screen.getByRole('button', { name: 'Access' }))

      await waitFor(() => {
        expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument()
      })

      // Start typing new password - error should clear
      await user.type(passwordInput, 'new')

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should have proper ARIA attributes for error messages', async () => {
      const user = userEvent.setup()
      
      // Configure mock to ensure authentication fails
      mockAuthenticate.mockReset()
      mockAuthenticate.mockResolvedValue(false)

      render(<PasswordProtection {...defaultProps} />)

      // Enter a password and submit
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Access' })
      
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      // Wait for error message to appear
      await waitFor(() => {
        const errorMessage = screen.getByText('Incorrect password. Please try again.')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveAttribute('role', 'alert')
      }, { timeout: 3000 })
    })
  })

  describe('Hook Integration', () => {
    it('should call usePasswordAuth with correct parameters', () => {
      render(<PasswordProtection {...defaultProps} />)

      // The hook should have been called once during render
      expect(mockUsePasswordAuth).toHaveBeenCalledWith('test123', 'guest')
    })

    it('should call usePasswordAuth with admin role', () => {
      const adminProps = { ...defaultProps, role: 'admin' as const }
      render(<PasswordProtection {...adminProps} />)

      expect(mockUsePasswordAuth).toHaveBeenCalledWith('test123', 'admin')
    })
  })

  describe('Loading State', () => {
    it('should disable form elements during loading', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))

      render(<PasswordProtection {...defaultProps} />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Access' })

      await user.type(passwordInput, 'test123')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Checking...')

      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Access')
      })
    })
  })
})