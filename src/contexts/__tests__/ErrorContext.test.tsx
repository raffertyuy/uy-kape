import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { screen, act } from '@testing-library/react'
import { render } from '../../../tests/config/test-utils'
import '@testing-library/jest-dom/vitest'

// Component variables
let ErrorContextProvider: any
let useGlobalError: any

describe('ErrorContext', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('../../utils/globalErrorHandler', () => ({
      handleGlobalError: vi.fn((error, context) => ({
        id: `error-${Date.now()}-${Math.random()}`,
        code: error?.code || 'ERROR',
        message: 'Test error message',
        details: { context },
        timestamp: new Date(),
        action: context
      }))
    }))

    // Import components after mocking
    const contextModule = await import('../ErrorContext')
    ErrorContextProvider = contextModule.ErrorContextProvider

    const hookModule = await import('../../hooks/useGlobalError')
    useGlobalError = hookModule.useGlobalError
  })

  afterAll(() => {
    vi.doUnmock('../../utils/globalErrorHandler')
  })

  // Test component that uses the error context
  const TestComponent = () => {
  const { errors, addError, clearError } = useGlobalError()
  const typedErrors = errors as (typeof errors[0] & { id: string })[]

  return (
    <div>
      <button
        onClick={() => addError(new Error('Test error'), 'test_context')}
        data-testid="report-error"
      >
        Report Error
      </button>
      <button
        onClick={() => clearError(typedErrors[0]?.id)}
        data-testid="clear-error"
        disabled={errors.length === 0}
      >
        Clear Error
      </button>
      <div data-testid="error-count">{errors.length}</div>
      {typedErrors.map((error) => (
        <div key={error.id} data-testid="error-item">
          {error.message}
        </div>
      ))}
    </div>
  )
}

// Test component for error management
const ErrorManagementTestComponent = () => {
  const { errors, addError, clearAllErrors, hasErrors, getLatestError } = useGlobalError()

  return (
    <div>
      <button
        onClick={() => addError(new Error('Multiple error'), 'test_context')}
        data-testid="add-error"
      >
        Add Error
      </button>
      <button
        onClick={clearAllErrors}
        data-testid="clear-all"
      >
        Clear All
      </button>
      <div data-testid="has-errors">{hasErrors.toString()}</div>
      <div data-testid="latest-error">{getLatestError()?.message || 'none'}</div>
      <div data-testid="error-count">{errors.length}</div>
    </div>
  )
}
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should provide error context to children', () => {
    render(
      <ErrorContextProvider>
        <TestComponent />
      </ErrorContextProvider>
    )

    expect(screen.getByTestId('error-count')).toHaveTextContent('0')
    expect(screen.getByTestId('clear-error')).toBeDisabled()
  })

  it('should handle error reporting', () => {
    render(
      <ErrorContextProvider>
        <TestComponent />
      </ErrorContextProvider>
    )

    act(() => {
      screen.getByTestId('report-error').click()
    })

    expect(screen.getByTestId('error-count')).toHaveTextContent('1')
    expect(screen.getByTestId('error-item')).toHaveTextContent('Test error')
    expect(screen.getByTestId('clear-error')).not.toBeDisabled()
  })

  it('should handle error clearing', () => {
    render(
      <ErrorContextProvider>
        <TestComponent />
      </ErrorContextProvider>
    )

    // First report an error
    act(() => {
      screen.getByTestId('report-error').click()
    })

    expect(screen.getByTestId('error-count')).toHaveTextContent('1')

    // Then clear it
    act(() => {
      screen.getByTestId('clear-error').click()
    })

    expect(screen.getByTestId('error-count')).toHaveTextContent('0')
    expect(screen.getByTestId('clear-error')).toBeDisabled()
  })

  it('should handle multiple errors', () => {
    render(
      <ErrorContextProvider>
        <TestComponent />
      </ErrorContextProvider>
    )

    // Report multiple errors
    act(() => {
      screen.getByTestId('report-error').click()
      screen.getByTestId('report-error').click()
      screen.getByTestId('report-error').click()
    })

    expect(screen.getByTestId('error-count')).toHaveTextContent('3')
    expect(screen.getAllByTestId('error-item')).toHaveLength(3)
  })

  it('should handle error management operations', () => {
    render(
      <ErrorContextProvider>
        <ErrorManagementTestComponent />
      </ErrorContextProvider>
    )

    expect(screen.getByTestId('has-errors')).toHaveTextContent('false')
    expect(screen.getByTestId('latest-error')).toHaveTextContent('none')

    // Add an error
    act(() => {
      screen.getByTestId('add-error').click()
    })

    expect(screen.getByTestId('has-errors')).toHaveTextContent('true')
    expect(screen.getByTestId('latest-error')).toHaveTextContent('Multiple error')
    expect(screen.getByTestId('error-count')).toHaveTextContent('1')

    // Clear all errors
    act(() => {
      screen.getByTestId('clear-all').click()
    })

    expect(screen.getByTestId('has-errors')).toHaveTextContent('false')
    expect(screen.getByTestId('latest-error')).toHaveTextContent('none')
    expect(screen.getByTestId('error-count')).toHaveTextContent('0')
  })

  it('should respect maxErrors limit', () => {
    render(
      <ErrorContextProvider maxErrors={2}>
        <ErrorManagementTestComponent />
      </ErrorContextProvider>
    )

    // Add more errors than the limit
    act(() => {
      screen.getByTestId('add-error').click()
      screen.getByTestId('add-error').click()
      screen.getByTestId('add-error').click()
      screen.getByTestId('add-error').click()
    })

    // Should only keep the last 2 errors
    expect(screen.getByTestId('error-count')).toHaveTextContent('2')
  })

  it('should throw error when useGlobalError is used outside provider', () => {
    // Create a component that uses the hook outside of provider
    const TestComponentOutsideProvider = () => {
      const { errors } = useGlobalError()
      return <div data-testid="error-count">{errors.length}</div>
    }

    // Suppress console.error for this test since React will log the error
    const originalError = console.error
    console.error = vi.fn()

    // Import the base render function directly from @testing-library/react
    // to avoid the custom render that includes ErrorContextProvider
    const { render: baseRender } = require('@testing-library/react')

    // Test that rendering the component without provider throws an error
    expect(() => {
      baseRender(<TestComponentOutsideProvider />)
    }).toThrow('useGlobalError must be used within an ErrorContextProvider')

    // Restore console.error
    console.error = originalError
  })

  it('should handle clearing non-existent errors gracefully', () => {
    render(
      <ErrorContextProvider>
        <ErrorManagementTestComponent />
      </ErrorContextProvider>
    )

    // This should not throw an error or cause issues
    act(() => {
      screen.getByTestId('clear-all').click()
    })

    expect(screen.getByTestId('error-count')).toHaveTextContent('0')
  })
})