import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { LoadingSpinner } from '../LoadingSpinner'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      {component}
    </BrowserRouter>
  )
}

describe('LoadingSpinner', () => {
  it('renders loading spinner with logo', () => {
    renderWithRouter(<LoadingSpinner />)
    
    // Logo has role="presentation" and alt="", so query differently
    const logo = screen.getByRole('presentation')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('alt', '')
  })

  it('displays loading text', () => {
    renderWithRouter(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('has proper animation classes', () => {
    renderWithRouter(<LoadingSpinner />)
    
    const logo = screen.getByRole('presentation')
    expect(logo).toHaveClass('opacity-60')
    
    // Check text animation
    const text = screen.getByText('Loading...')
    expect(text).toHaveClass('animate-pulse')
  })

  it('is centered properly', () => {
    renderWithRouter(<LoadingSpinner />)
    
    const container = screen.getByText('Loading...').closest('.flex')
    expect(container).toHaveClass('flex-col', 'items-center', 'justify-center')
  })
})