import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/**
 * Custom render function that includes common providers
 * This wrapper includes Router context for components that use routing
 * Uses MemoryRouter for testing to avoid DOM history API issues
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter>
      {children}
    </MemoryRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }