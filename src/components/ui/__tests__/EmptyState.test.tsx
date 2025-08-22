import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { render, screen } from '@/test-utils'

let EmptyState: any

describe('EmptyState', () => {
  beforeAll(async () => {
    // Mock logo assets before importing component
    vi.doMock('@/assets/logos/logo-24.png', () => ({ default: '/mock-logo-24.png' }))
    vi.doMock('@/assets/logos/logo-32.png', () => ({ default: '/mock-logo-32.png' }))
    vi.doMock('@/assets/logos/logo-48.png', () => ({ default: '/mock-logo-48.png' }))
    vi.doMock('@/assets/logos/logo-64.png', () => ({ default: '/mock-logo-64.png' }))
    vi.doMock('@/assets/logos/logo-96.png', () => ({ default: '/mock-logo-96.png' }))
    vi.doMock('@/assets/logos/logo-256.png', () => ({ default: '/mock-logo-256.png' }))

    // Mock logo types
    vi.doMock('@/types/logo.types', () => ({
      LogoSize: ['xs', 'sm', 'md', 'lg', 'xl', 'hero'],
      LogoVariant: ['default', 'white', 'dark']
    }))

    // Import component after mocking
    const emptyStateModule = await import('../EmptyState')
    EmptyState = emptyStateModule.EmptyState
  })

  afterAll(() => {
    vi.doUnmock('@/assets/logos/logo-24.png')
    vi.doUnmock('@/assets/logos/logo-32.png') 
    vi.doUnmock('@/assets/logos/logo-48.png')
    vi.doUnmock('@/assets/logos/logo-64.png')
    vi.doUnmock('@/assets/logos/logo-96.png')
    vi.doUnmock('@/assets/logos/logo-256.png')
    vi.doUnmock('@/types/logo.types')
  })

  it('renders with title and description', () => {
    const title = 'No items found'
    const description = 'Try adjusting your search'
    
    render(
      <EmptyState title={title} description={description} />
    )
    
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('renders logo when showLogo is true', () => {
    render(
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
    render(
      <EmptyState 
        title="No items" 
        description="Nothing here" 
        showLogo={false} 
      />
    )
    
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    render(
      <EmptyState title="Test" description="Test description" />
    )
    
    const container = screen.getByText('Test').closest('.text-center')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('py-12')
  })

  it('displays title with proper styling', () => {
    render(
      <EmptyState title="Test Title" description="Test description" />
    )
    
    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-coffee-800', 'mb-2')
  })

  it('displays description with proper styling', () => {
    render(
      <EmptyState title="Test Title" description="Test description" />
    )
    
    const description = screen.getByText('Test description')
    expect(description).toHaveClass('text-coffee-600', 'mb-6')
  })
})