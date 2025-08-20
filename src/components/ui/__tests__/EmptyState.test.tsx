import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { EmptyState } from '../EmptyState'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('EmptyState', () => {
  it('renders with title and description', () => {
    const title = 'No items found'
    const description = 'Try adjusting your search'
    
    renderWithRouter(
      <EmptyState title={title} description={description} />
    )
    
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('renders logo when showLogo is true', () => {
    renderWithRouter(
      <EmptyState 
        title="No items" 
        description="Nothing here" 
        showLogo 
      />
    )
    
    // Logo has role="presentation" and alt="", so query by src attribute
    const logo = screen.getByRole('presentation')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveClass('opacity-60') // Correct opacity class
  })

  it('does not render logo when showLogo is false', () => {
    renderWithRouter(
      <EmptyState 
        title="No items" 
        description="Nothing here" 
        showLogo={false} 
      />
    )
    
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    renderWithRouter(
      <EmptyState title="Test" description="Test description" />
    )
    
    const container = screen.getByText('Test').closest('.text-center')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('py-12')
  })

  it('displays title with proper styling', () => {
    renderWithRouter(
      <EmptyState title="Test Title" description="Test description" />
    )
    
    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-coffee-800', 'mb-2')
  })

  it('displays description with proper styling', () => {
    renderWithRouter(
      <EmptyState title="Test Title" description="Test description" />
    )
    
    const description = screen.getByText('Test description')
    expect(description).toHaveClass('text-coffee-600', 'mb-6')
  })
})