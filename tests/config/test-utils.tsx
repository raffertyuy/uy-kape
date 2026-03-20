import type { ReactElement } from 'react';
import React from 'react'
import type { RenderOptions } from '@testing-library/react';
import { render, renderHook as rtlRenderHook, act, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { ErrorContextProvider } from '../../src/contexts/ErrorContext'
import { HackedModeProvider } from '../../src/contexts/HackedModeContext'
import { ToastProvider } from '../../src/hooks/useToast'

/**
 * Enhanced provider wrapper for testing with React 19 features
 * Includes Router context, ErrorContext, and future toast provider context
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
    <HackedModeProvider>
      <ErrorContextProvider>
        <ToastProvider>
          <MemoryRouter 
            initialEntries={initialEntries} 
            initialIndex={initialIndex}
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            {children}
          </MemoryRouter>
        </ToastProvider>
      </ErrorContextProvider>
    </HackedModeProvider>
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
 * Enhanced user interaction utilities
 * Pre-configured for React 19 testing patterns
 */
export const createUserEvent = () => userEvent.setup({
  // React 19 compatible settings - simplified for memory efficiency
  delay: null, // Disable built-in delays for faster tests
})

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

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { userEvent }

// Override render with our enhanced version (wraps in AllTheProviders)
export { customRender as render }

// Override renderHook with our enhanced version (wraps in AllTheProviders)
const customRenderHook = <Result, Props>(
  callback: (_initialProps: Props) => Result,
  options?: Parameters<typeof rtlRenderHook<Result, Props>>[1] & {
    initialEntries?: string[]
    initialIndex?: number
  }
) => {
  const { initialEntries, initialIndex, wrapper: CustomWrapper, ...rtlOptions } = (options ?? {}) as {
    initialEntries?: string[]
    initialIndex?: number
    wrapper?: React.ComponentType<{ children: React.ReactNode }>
    [key: string]: unknown
  }
  const WrapperWithProviders = ({ children }: { children: React.ReactNode }) =>
    CustomWrapper
      ? React.createElement(CustomWrapper, null, children)
      : React.createElement(AllTheProviders, {
          ...(initialEntries !== undefined && { initialEntries }),
          ...(initialIndex !== undefined && { initialIndex }),
          children,
        })
  return rtlRenderHook(callback, { ...rtlOptions, wrapper: WrapperWithProviders })
}
export { customRenderHook as renderHook }