import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { render, screen } from '@/test-utils'

// Component variables
let Layout: any

describe('Layout', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('lucide-react', () => ({
      Home: () => <div data-testid="home-icon" />,
      Coffee: () => <div data-testid="coffee-icon" />,
      Settings: () => <div data-testid="settings-icon" />
    }))

    // Import component after mocking
    const layoutModule = await import('../Layout')
    Layout = layoutModule.default
  })

  afterAll(() => {
    vi.doUnmock('lucide-react')
  })
  it('renders children correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies correct CSS classes for responsive design', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    // Check background gradient
    const container = screen.getByText('Test Content').closest('.min-h-screen')
    expect(container).toHaveClass('bg-gradient-to-br', 'from-coffee-50', 'to-coffee-100')
  })

  it('maintains proper semantic structure', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    // Check for main element
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('displays navigation when not on welcome page', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { initialEntries: ['/order'] }
    )
    
    // Check for navigation
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // Check for logo in navigation - it has role="presentation" 
    const logo = screen.getByRole('presentation')
    expect(logo).toBeInTheDocument()
    
    // Check for navigation links using menuitem role
    expect(screen.getByRole('link', { name: /uy, kape!/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /order/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /admin/i })).toBeInTheDocument()
  })

  it('hides navigation on welcome page', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { initialEntries: ['/'] }
    )
    
    // Navigation should not be present on welcome page
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('highlights active navigation links', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { initialEntries: ['/order'] }
    )
    
    // Check that the order link is highlighted using menuitem role
    const orderLink = screen.getByRole('menuitem', { name: /order/i })
    expect(orderLink).toHaveClass('bg-coffee-600', 'text-white')
  })

  it('has proper accessibility for navigation', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { initialEntries: ['/order'] }
    )
    
    // Check navigation has proper structure
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // Check logo is accessible
    const logoLink = screen.getByRole('link', { name: /uy, kape!/i })
    expect(logoLink).toHaveAttribute('href', '/')
    
    // Check navigation links are accessible using menuitem role
    const orderLink = screen.getByRole('menuitem', { name: /order/i })
    const adminLink = screen.getByRole('menuitem', { name: /admin/i })
    
    expect(orderLink).toBeVisible()
    expect(adminLink).toBeVisible()
  })
})