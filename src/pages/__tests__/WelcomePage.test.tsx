import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import WelcomePage from '../WelcomePage'

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

describe('WelcomePage', () => {
  it('renders welcome message and app title', () => {
    renderWithRouter(<WelcomePage />)
    
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
    renderWithRouter(<WelcomePage />)
    
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
    renderWithRouter(<WelcomePage />)
    
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
    renderWithRouter(<WelcomePage />)
    
    // Check responsive container classes (looking for sm:max-w-md since that's the breakpoint)
    const container = screen.getByText('Uy, Kape! ☕').closest('.max-w-sm')
    expect(container).toBeInTheDocument()
    
    // Check logo has XL size classes (size="xl" from Logo component)
    const logo = screen.getByRole('img')
    expect(logo).toHaveClass('w-16', 'h-16', 'sm:w-20', 'sm:h-20', 'md:w-24', 'md:h-24')
  })

  it('displays technology stack badges', () => {
    renderWithRouter(<WelcomePage />)
    
    // Check for technology badges
    expect(screen.getByText('React + TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
    expect(screen.getByText('Supabase')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    renderWithRouter(<WelcomePage />)
    
    // The main container should have proper background and layout
    const mainContainer = screen.getByText('Uy, Kape! ☕').closest('.min-h-screen')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-coffee-50', 'to-coffee-100')
  })
})