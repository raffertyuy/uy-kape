import type { ReactElement } from 'react';
import React from 'react'
import type { RenderOptions } from '@testing-library/react';
import { render, act, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { ErrorContextProvider } from '../../src/contexts/ErrorContext'

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
    <ErrorContextProvider>
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
    </ErrorContextProvider>
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

// Override render method with our enhanced version
export { customRender as render }