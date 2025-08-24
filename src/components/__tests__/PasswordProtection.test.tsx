import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import { render, screen, act, userEvent } from '../../../tests/config/test-utils'

// Mock variables
let PasswordProtection: any
let mockAuthenticate: any
let mockLogout: any
let mockUsePasswordAuth: any

describe('PasswordProtection - Basic Functionality', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    mockAuthenticate = vi.fn()
    mockLogout = vi.fn()

    vi.doMock('@/hooks/usePasswordAuth', () => ({
      usePasswordAuth: vi.fn(() => ({
        isAuthenticated: false,
        role: undefined,
        authenticate: mockAuthenticate,
        logout: mockLogout
      }))
    }))

    // Import component and mocked hook after mocking
    const componentModule = await import('../PasswordProtection')
    PasswordProtection = componentModule.default

    const hookModule = await import('@/hooks/usePasswordAuth')
    mockUsePasswordAuth = vi.mocked(hookModule.usePasswordAuth)
  })

  afterAll(() => {
    vi.doUnmock('@/hooks/usePasswordAuth')
  })

  // Mock window.history.back
  const mockHistoryBack = vi.fn()
  Object.defineProperty(window, 'history', {
    value: { back: mockHistoryBack },
    writable: true,
  })
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
    // Temporarily suppress the act() environment warning for this test
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation((message: string, ...args: any[]) => {
      if (typeof message === 'string' && message.includes('The current testing environment is not configured to support act')) {
        return // Suppress this specific warning
      }
      // For any other warnings, call the original console.warn
      console.warn.call(console, message, ...args)
    })

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
    
    // Restore console.warn
    consoleWarnSpy.mockRestore()
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