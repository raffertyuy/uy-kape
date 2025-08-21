import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
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
  value: { back: mockHistoryBack },
  writable: true,
})

describe('PasswordProtection - Basic Functionality', () => {
  const defaultProps = {
    requiredPassword: 'test123',
    title: 'Test Access',
    description: 'Enter password to continue',
    role: 'guest' as const,
    children: <div data-testid="protected-content">Protected Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePasswordAuth.mockReturnValue({
      isAuthenticated: false,
      role: undefined,
      authenticate: mockAuthenticate,
      logout: mockLogout
    })
  })

  it('should render password form when not authenticated', () => {
    render(<PasswordProtection {...defaultProps} />)

    expect(screen.getByText('Test Access')).toBeInTheDocument()
    expect(screen.getByText('Enter password to continue')).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /access/i })).toBeInTheDocument()
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
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument()
  })

  it('should update password input value', async () => {
    const user = userEvent.setup()
    render(<PasswordProtection {...defaultProps} />)

    const passwordInput = screen.getByLabelText(/password/i)
    
    await act(async () => {
      await user.type(passwordInput, 'testPassword')
    })

    expect(passwordInput).toHaveValue('testPassword')
  })

  it('should handle form submission correctly', async () => {
    const user = userEvent.setup()
    mockAuthenticate.mockResolvedValue(true)
    
    render(<PasswordProtection {...defaultProps} />)

    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /access/i })

    await act(async () => {
      await user.type(passwordInput, 'test123')
      await user.click(submitButton)
    })

    expect(mockAuthenticate).toHaveBeenCalledWith('test123')
  })

  it('should have proper accessibility attributes', () => {
    render(<PasswordProtection {...defaultProps} />)

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')

    const submitButton = screen.getByRole('button', { name: /access/i })
    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})