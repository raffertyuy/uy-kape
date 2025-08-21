import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../Layout'

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter 
      initialEntries={initialEntries}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {component}
    </MemoryRouter>
  )
}

describe('Layout', () => {
  it('renders children correctly', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies correct CSS classes for responsive design', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    // Check background gradient
    const container = screen.getByText('Test Content').closest('.min-h-screen')
    expect(container).toHaveClass('bg-gradient-to-br', 'from-coffee-50', 'to-coffee-100')
  })

  it('maintains proper semantic structure', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    // Check for main element
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('displays navigation when not on welcome page', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      ['/order']
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
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      ['/']
    )
    
    // Navigation should not be present on welcome page
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('highlights active navigation links', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      ['/order']
    )
    
    // Check that the order link is highlighted using menuitem role
    const orderLink = screen.getByRole('menuitem', { name: /order/i })
    expect(orderLink).toHaveClass('bg-coffee-600', 'text-white')
  })

  it('has proper accessibility for navigation', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      ['/order']
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