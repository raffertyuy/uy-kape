import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConditionalPasswordProtection from '../ConditionalPasswordProtection'

// Mock the PasswordProtection component
vi.mock('@/components/PasswordProtection', () => ({
  default: vi.fn(),
}))

// Get the mocked component
import PasswordProtection from '@/components/PasswordProtection'
const mockPasswordProtection = vi.mocked(PasswordProtection)

describe('ConditionalPasswordProtection', () => {
  const defaultProps = {
    requiredPassword: 'testpassword',
    title: 'Test Access',
    description: 'Test description',
    role: 'guest' as const,
  }

  const testChildren = <div data-testid="protected-content">Protected Content</div>

  beforeEach(() => {
    mockPasswordProtection.mockClear()
    // Configure the mock to render the test UI
    mockPasswordProtection.mockImplementation(({ children, ...props }) => (
      <div data-testid="password-protection" data-props={JSON.stringify(props)}>
        {children}
      </div>
    ))
  })

  it('should render children directly when bypassPassword is true', () => {
    render(
      <ConditionalPasswordProtection
        {...defaultProps}
        bypassPassword
      >
        {testChildren}
      </ConditionalPasswordProtection>
    )

    // Should render children directly without password protection
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.queryByTestId('password-protection')).not.toBeInTheDocument()
    expect(mockPasswordProtection).not.toHaveBeenCalled()
  })

  it('should render PasswordProtection when bypassPassword is false', () => {
    render(
      <ConditionalPasswordProtection
        {...defaultProps}
        bypassPassword={false}
      >
        {testChildren}
      </ConditionalPasswordProtection>
    )

    // Should render PasswordProtection component
    expect(screen.getByTestId('password-protection')).toBeInTheDocument()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    
    // Verify PasswordProtection was called with correct props
    expect(mockPasswordProtection).toHaveBeenCalledWith(
      expect.objectContaining({
        requiredPassword: 'testpassword',
        title: 'Test Access',
        description: 'Test description',
        role: 'guest',
        children: testChildren,
      }),
      expect.any(Object)
    )
  })

  it('should render PasswordProtection when bypassPassword is undefined (default)', () => {
    render(
      <ConditionalPasswordProtection {...defaultProps}>
        {testChildren}
      </ConditionalPasswordProtection>
    )

    // Should render PasswordProtection component (secure default)
    expect(screen.getByTestId('password-protection')).toBeInTheDocument()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(mockPasswordProtection).toHaveBeenCalled()
  })

  it('should pass all props correctly to PasswordProtection when bypass is disabled', () => {
    const extraProps = {
      ...defaultProps,
      bypassPassword: false,
      customProp: 'test-value', // Extra prop to verify it's passed through
    }

    render(
      <ConditionalPasswordProtection {...extraProps}>
        {testChildren}
      </ConditionalPasswordProtection>
    )

    // Verify all props except bypassPassword and children are passed to PasswordProtection
    expect(mockPasswordProtection).toHaveBeenCalledWith(
      expect.objectContaining({
        requiredPassword: 'testpassword',
        title: 'Test Access',
        description: 'Test description',
        role: 'guest',
        customProp: 'test-value',
        children: testChildren,
      }),
      expect.any(Object)
    )

    // Verify bypassPassword is not passed to PasswordProtection
    const calledProps = mockPasswordProtection.mock.calls[0][0]
    expect(calledProps).not.toHaveProperty('bypassPassword')
  })

  it('should handle different role types correctly', () => {
    render(
      <ConditionalPasswordProtection
        {...defaultProps}
        // eslint-disable-next-line jsx-a11y/aria-role
        role="admin"
        bypassPassword={false}
      >
        {testChildren}
      </ConditionalPasswordProtection>
    )

    expect(mockPasswordProtection).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'admin',
      }),
      expect.any(Object)
    )
  })

  it('should render different children correctly when bypassed', () => {
    const complexChildren = (
      <div>
        <h1 data-testid="title">Test Title</h1>
        <p data-testid="content">Test Content</p>
        <button data-testid="button">Test Button</button>
      </div>
    )

    render(
      <ConditionalPasswordProtection
        {...defaultProps}
        bypassPassword
      >
        {complexChildren}
      </ConditionalPasswordProtection>
    )

    // All children should be rendered directly
    expect(screen.getByTestId('title')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByTestId('button')).toBeInTheDocument()
    expect(screen.queryByTestId('password-protection')).not.toBeInTheDocument()
  })

  it('should maintain component behavior consistency across bypass states', () => {
    const { rerender } = render(
      <ConditionalPasswordProtection
        {...defaultProps}
        bypassPassword={false}
      >
        {testChildren}
      </ConditionalPasswordProtection>
    )

    // Initially should show password protection
    expect(screen.getByTestId('password-protection')).toBeInTheDocument()

    // Re-render with bypass enabled
    rerender(
      <ConditionalPasswordProtection
        {...defaultProps}
        bypassPassword
      >
        {testChildren}
      </ConditionalPasswordProtection>
    )

    // Should now show content directly
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.queryByTestId('password-protection')).not.toBeInTheDocument()
  })
})