import type { ReactElement } from 'react';
import React from 'react'
import type { RenderOptions } from '@testing-library/react';
import { render, act, waitFor, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

/**
 * Enhanced provider wrapper for testing with React 19 features
 * Includes Router context and future toast provider context
 */
interface AllTheProvidersProps {
  children: React.ReactNode
  initialEntries?: string[]
  initialIndex?: number
}

const AllTheProviders = ({ 
  children, 
  initialEntries = ['/'],
  initialIndex = 0 
}: AllTheProvidersProps) => {
  return (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      {children}
    </MemoryRouter>
  )
}

/**
 * Custom render options with enhanced providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  initialIndex?: number
}

/**
 * Enhanced custom render function for React 19 testing
 * Includes proper provider context and routing support
 */
const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialEntries, initialIndex, ...renderOptions } = options
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders 
      initialEntries={initialEntries || ['/']} 
      initialIndex={initialIndex || 0}
    >
      {children}
    </AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Enhanced utility function to wrap async operations in act()
 * Ensures React state updates are properly flushed in tests
 * Compatible with React 19's concurrent features
 */
export const actAsync = async (callback: () => Promise<void>) => {
  await act(async () => {
    await callback()
  })
}

/**
 * Utility function for synchronous act operations
 * Handles React 19's synchronous state updates
 */
export const actSync = (callback: () => void) => {
  act(() => {
    callback()
  })
}

/**
 * Enhanced helper for testing async hook operations with proper act() wrapping
 * Uses React 19 compatible timing mechanisms
 */
export const waitForNextUpdate = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })
}

/**
 * Utility for waiting for multiple updates in React 19
 * Useful for testing complex state chains
 */
export const waitForUpdates = async (count = 1) => {
  for (let i = 0; i < count; i++) {
    await waitForNextUpdate()
  }
}

/**
 * Enhanced user interaction utilities
 * Pre-configured for React 19 testing patterns
 */
export const createUserEvent = () => userEvent.setup({
  // React 19 compatible settings
  advanceTimers: vi.advanceTimersByTime,
  delay: null, // Disable built-in delays for faster tests
})

/**
 * Utility for testing form interactions with proper async handling
 */
export const fillForm = async (formData: Record<string, string>) => {
  const user = createUserEvent()
  
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i')) || 
                  screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') })
    
    await act(async () => {
      await user.clear(field)
      await user.type(field, value)
    })
  }
}

/**
 * Utility for testing button clicks with proper async handling
 */
export const clickButton = async (buttonText: string | RegExp) => {
  const user = createUserEvent()
  const button = screen.getByRole('button', { name: buttonText })
  
  await act(async () => {
    await user.click(button)
  })
}

/**
 * Enhanced waitFor with better error messages for React 19
 */
export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
) => {
  const { timeout = 5000, interval = 50 } = options
  
  return waitFor(async () => {
    const result = await condition()
    if (!result) {
      throw new Error('Condition not met within timeout')
    }
    return result
  }, { timeout, interval })
}

/**
 * Utility for testing component unmounting with proper cleanup
 */
export const renderAndUnmount = (ui: ReactElement, options?: CustomRenderOptions) => {
  const result = customRender(ui, options)
  
  return {
    ...result,
    unmountAndCleanup: () => {
      act(() => {
        result.unmount()
      })
    }
  }
}

/**
 * Mock function factory with enhanced TypeScript support
 */
export const createMockFunction = <T extends (..._args: any[]) => any>() => {
  return vi.fn() as unknown as T
}

/**
 * Enhanced error boundary for testing error scenarios
 */
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (_error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (_error: Error) => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong</div>
    }

    return this.props.children
  }
}

/**
 * Utility for testing error scenarios with error boundary
 */
export const renderWithErrorBoundary = (
  ui: ReactElement,
  onError?: (_error: Error) => void,
  options?: CustomRenderOptions
) => {
  const props: { children: ReactElement; onError?: (_error: Error) => void } = {
    children: ui
  }
  if (onError) {
    props.onError = onError
  }
  
  return customRender(
    <TestErrorBoundary {...props} />,
    options
  )
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { userEvent }

// Override render method with our enhanced version
export { customRender as render }