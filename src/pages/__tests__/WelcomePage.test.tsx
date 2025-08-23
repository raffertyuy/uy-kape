import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { render, screen } from '../../../tests/config/test-utils'

// Component variables
let WelcomePage: any

describe('WelcomePage', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('@/assets/logos', () => ({
      logo24: 'mocked-logo-24.png',
      logo32: 'mocked-logo-32.png',
      logo48: 'mocked-logo-48.png',
      logo64: 'mocked-logo-64.png',
      logo96: 'mocked-logo-96.png',
      logo128: 'mocked-logo-128.png',
      logo192: 'mocked-logo-192.png',
      logo256: 'mocked-logo-256.png'
    }))

    vi.doMock('@/types/logo.types', () => ({
      LogoSize: {
        SM: '24',
        MD: '32',
        LG: '48',
        XL: '64',
        '2XL': '96',
        '3XL': '128',
        '4XL': '192',
        HERO: '256'
      }
    }))

    vi.doMock('lucide-react', () => ({
      Coffee: () => <div data-testid="coffee-icon" />,
      Settings: () => <div data-testid="settings-icon" />
    }))

    // Import component after mocking
    const welcomePageModule = await import('../WelcomePage')
    WelcomePage = welcomePageModule.default
  })

  afterAll(() => {
    vi.doUnmock('@/assets/logos')
    vi.doUnmock('@/types/logo.types')
    vi.doUnmock('lucide-react')
  })
  it('renders welcome message and app title', () => {
    render(<WelcomePage />)
    
    // Check for the logo
    const logo = screen.getByRole('img')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('alt', 'Uy, Kape! Logo')
    
    // Check for the app title text (with emoji)
    expect(screen.getByText('Uy, Kape! ☕')).toBeInTheDocument()
    
    // Check for the description
    expect(screen.getByText('Your friend\'s coffee ordering system')).toBeInTheDocument()
  })

  it('displays order and admin navigation links', () => {
    render(<WelcomePage />)
    
    // Check for Order Here link
    const orderLink = screen.getByRole('link', { name: /order here/i })
    expect(orderLink).toBeInTheDocument()
    expect(orderLink).toHaveAttribute('href', '/order')
    
    // Check for Barista Administration link
    const adminLink = screen.getByRole('link', { name: /barista administration/i })
    expect(adminLink).toBeInTheDocument()
    expect(adminLink).toHaveAttribute('href', '/admin')
  })

  it('has proper accessibility attributes', () => {
    render(<WelcomePage />)
    
    // Check logo accessibility
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('alt')
    
    // Check links have descriptive text
    const orderLink = screen.getByRole('link', { name: /order here/i })
    const adminLink = screen.getByRole('link', { name: /barista administration/i })
    
    expect(orderLink).toBeVisible()
    expect(adminLink).toBeVisible()
  })

  it('is responsive on different screen sizes', () => {
    render(<WelcomePage />)
    
    // Check responsive container classes (looking for sm:max-w-md since that's the breakpoint)
    const container = screen.getByText('Uy, Kape! ☕').closest('.max-w-sm')
    expect(container).toBeInTheDocument()
    
    // Check logo has XL size classes (size="xl" from Logo component)
    const logo = screen.getByRole('img')
    expect(logo).toHaveClass('w-16', 'h-16', 'sm:w-20', 'sm:h-20', 'md:w-24', 'md:h-24')
  })

  it('displays technology stack badges', () => {
    render(<WelcomePage />)
    
    // Check for technology badges
    expect(screen.getByText('React + TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
    expect(screen.getByText('Supabase')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<WelcomePage />)
    
    // The main container should have proper background and layout
    const mainContainer = screen.getByText('Uy, Kape! ☕').closest('.min-h-screen')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-coffee-50', 'to-coffee-100')
  })
})