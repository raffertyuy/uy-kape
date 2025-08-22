import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { render, screen } from '@/test-utils'

let LoadingSpinner: any

describe('LoadingSpinner', () => {
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
    const spinnerModule = await import('../LoadingSpinner')
    LoadingSpinner = spinnerModule.LoadingSpinner
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

  it('renders loading spinner with logo', () => {
    render(<LoadingSpinner />)
    
    // Logo has role="presentation" and alt="", so query differently
    const logo = screen.getByRole('presentation')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('alt', '')
  })

  it('displays loading text', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('has proper animation classes', () => {
    render(<LoadingSpinner />)
    
    const logo = screen.getByRole('presentation')
    expect(logo).toHaveClass('opacity-60')
    
    // Check text animation
    const text = screen.getByText('Loading...')
    expect(text).toHaveClass('animate-pulse')
  })

  it('is centered properly', () => {
    render(<LoadingSpinner />)
    
    const container = screen.getByText('Loading...').closest('.flex')
    expect(container).toHaveClass('flex-col', 'items-center', 'justify-center')
  })
})