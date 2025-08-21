import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Logo from '../Logo'

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

describe('Logo Component', () => {
  it('renders with correct size variant', () => {
    renderWithRouter(<Logo size="md" />)
    const logo = screen.getByRole('img')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12')
  })

  it('renders hero size with responsive classes', () => {
    renderWithRouter(<Logo size="hero" />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveClass('w-20', 'h-20', 'xs:w-24', 'xs:h-24', 'sm:w-28', 'sm:h-28')
  })

  it('applies custom className properly', () => {
    const customClass = 'custom-test-class'
    renderWithRouter(<Logo size="sm" className={customClass} />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveClass(customClass)
  })

  it('displays appropriate alt text for accessibility', () => {
    const customAlt = 'Custom alt text'
    renderWithRouter(<Logo size="md" alt={customAlt} />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('alt', customAlt)
  })

  it('uses default alt text when none provided', () => {
    renderWithRouter(<Logo size="md" />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('alt', 'Uy, Kape! Coffee Ordering System')
  })

  it('handles click events when onChick prop is provided', () => {
    const handleClick = vi.fn()
    renderWithRouter(<Logo size="md" onClick={handleClick} />)
    const logoContainer = screen.getByRole('button')
    fireEvent.click(logoContainer)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is keyboard accessible when clickable', () => {
    const handleClick = vi.fn()
    renderWithRouter(<Logo size="md" onClick={handleClick} />)
    const logoContainer = screen.getByRole('button')
    fireEvent.keyDown(logoContainer, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('maintains aspect ratio across all sizes', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'> = ['xs', 'sm', 'md', 'lg', 'xl', 'hero']
    
    sizes.forEach(size => {
      const { unmount } = renderWithRouter(<Logo size={size} />)
      const logo = screen.getByRole('img')
      expect(logo).toHaveClass('object-contain')
      unmount()
    })
  })

  it('renders without onClick as a non-interactive element', () => {
    renderWithRouter(<Logo size="md" />)
    const logo = screen.getByRole('img')
    expect(logo).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has proper loading attributes for performance', () => {
    renderWithRouter(<Logo size="md" />)
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('loading', 'lazy')
    expect(logo).toHaveAttribute('decoding', 'async')
  })
})