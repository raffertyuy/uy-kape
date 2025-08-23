import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent } from '../../../../tests/config/test-utils'

let Logo: any

describe('Logo Component', () => {
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
    const logoModule = await import('../Logo')
    Logo = logoModule.default
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

  it('renders with correct size variant', () => {
    render(<Logo size="md" />)
    const logo = screen.getByRole('img')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12')
  })

  it('renders hero size with responsive classes', () => {
    render(<Logo size="hero" />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveClass('w-20', 'h-20', 'xs:w-24', 'xs:h-24', 'sm:w-28', 'sm:h-28')
  })

  it('applies custom className properly', () => {
    const customClass = 'custom-test-class'
    render(<Logo size="sm" className={customClass} />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveClass(customClass)
  })

  it('displays appropriate alt text for accessibility', () => {
    const customAlt = 'Custom alt text'
    render(<Logo size="md" alt={customAlt} />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('alt', customAlt)
  })

  it('uses default alt text when none provided', () => {
    render(<Logo size="md" />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('alt', 'Uy, Kape! Coffee Ordering System')
  })

  it('handles click events when onChick prop is provided', () => {
    const handleClick = vi.fn()
    render(<Logo size="md" onClick={handleClick} />)
    const logoContainer = screen.getByRole('button')
    fireEvent.click(logoContainer)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is keyboard accessible when clickable', () => {
    const handleClick = vi.fn()
    render(<Logo size="md" onClick={handleClick} />)
    const logoContainer = screen.getByRole('button')
    fireEvent.keyDown(logoContainer, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('maintains aspect ratio across all sizes', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'> = ['xs', 'sm', 'md', 'lg', 'xl', 'hero']
    
    sizes.forEach(size => {
      const { unmount } = render(<Logo size={size} />)
      const logo = screen.getByRole('img')
      expect(logo).toHaveClass('object-contain')
      unmount()
    })
  })

  it('renders without onClick as a non-interactive element', () => {
    render(<Logo size="md" />)
    const logo = screen.getByRole('img')
    expect(logo).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has proper loading attributes for performance', () => {
    render(<Logo size="md" />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('loading', 'lazy')
    expect(logo).toHaveAttribute('decoding', 'async')
  })
})