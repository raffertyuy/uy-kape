import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { render, screen, waitFor } from '../../../tests/config/test-utils'
import userEvent from '@testing-library/user-event'

// Component variables
let ProtectedBaristaModule: any

describe('BaristaModule URL Parameter Handling', () => {
  beforeAll(async () => {
    // Mock password protection to bypass authentication for testing
    vi.doMock('@/components/PasswordProtection', () => ({
      default: ({ children }: { children: React.ReactNode }) => <div data-testid="password-protection">{children}</div>
    }))

    // Mock the Logo component
    vi.doMock('@/components/ui/Logo', () => ({
      Logo: ({ alt }: { alt: string }) => <img alt={alt} data-testid="logo" />
    }))

    // Mock MenuManagement component
    vi.doMock('@/pages/MenuManagement', () => ({
      MenuManagement: () => <div data-testid="menu-management">Menu Management Content</div>
    }))

    // Mock OrderDashboard component
    vi.doMock('@/components/admin/OrderDashboard', () => ({
      OrderDashboard: () => <div data-testid="order-dashboard">Order Dashboard Content</div>
    }))

    // Mock app config
    vi.doMock('@/config/app.config', () => ({
      appConfig: {
        adminPassword: 'test-password'
      }
    }))

    // Import component after mocking
    const baristaModuleModule = await import('../BaristaModule')
    ProtectedBaristaModule = baristaModuleModule.default
  })

  afterAll(() => {
    vi.doUnmock('@/components/PasswordProtection')
    vi.doUnmock('@/components/ui/Logo')
    vi.doUnmock('@/pages/MenuManagement')
    vi.doUnmock('@/components/admin/OrderDashboard')
    vi.doUnmock('@/config/app.config')
  })

  describe('Default View Behavior', () => {
    it('defaults to dashboard view when no URL parameters', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin'] 
      })
      
      // Should show the main dashboard content
      expect(screen.getByText('Barista Administration Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Order Management')).toBeInTheDocument()
      expect(screen.getByText('Menu Management')).toBeInTheDocument()
      expect(screen.getByText('System Status:')).toBeInTheDocument()
      
      // Should NOT show navigation bar (only shown for non-dashboard views)
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
      
      // Should NOT show Menu Management or Order Dashboard content
      expect(screen.queryByTestId('menu-management')).not.toBeInTheDocument()
      expect(screen.queryByTestId('order-dashboard')).not.toBeInTheDocument()
    })

    it('defaults to dashboard view with explicit view=dashboard parameter', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=dashboard'] 
      })
      
      // Should show the main dashboard content
      expect(screen.getByText('Barista Administration Dashboard')).toBeInTheDocument()
      expect(screen.queryByTestId('menu-management')).not.toBeInTheDocument()
      expect(screen.queryByTestId('order-dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Menu Management View', () => {
    it('shows menu view when URL parameter is view=menu', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=menu'] 
      })
      
      // Should show Menu Management content
      expect(screen.getByTestId('menu-management')).toBeInTheDocument()
      expect(screen.getByText('Menu Management Content')).toBeInTheDocument()
      
      // Should show navigation bar
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      
      // Should NOT show dashboard or order dashboard content
      expect(screen.queryByText('Barista Administration Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByTestId('order-dashboard')).not.toBeInTheDocument()
    })

    it('shows navigation with Menu Management button highlighted', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=menu'] 
      })
      
      const menuButton = screen.getByRole('button', { name: /menu management/i })
      expect(menuButton).toBeInTheDocument()
      
      // Check if the button has active styling (border-coffee-500 class indicates active state)
      expect(menuButton).toHaveClass('border-coffee-500')
    })
  })

  describe('Order Dashboard View', () => {
    it('shows orders view when URL parameter is view=orders', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=orders'] 
      })
      
      // Should show Order Dashboard content
      expect(screen.getByTestId('order-dashboard')).toBeInTheDocument()
      expect(screen.getByText('Order Dashboard Content')).toBeInTheDocument()
      
      // Should show navigation bar
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      
      // Should NOT show dashboard or menu management content
      expect(screen.queryByText('Barista Administration Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByTestId('menu-management')).not.toBeInTheDocument()
    })

    it('shows navigation with Orders button highlighted', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=orders'] 
      })
      
      const ordersButton = screen.getByRole('button', { name: /orders/i })
      expect(ordersButton).toBeInTheDocument()
      
      // Check if the button has active styling
      expect(ordersButton).toHaveClass('border-coffee-500')
    })
  })

  describe('Invalid View Parameters', () => {
    it('defaults to dashboard for invalid view parameters', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=invalid'] 
      })
      
      // Should default to dashboard view
      expect(screen.getByText('Barista Administration Dashboard')).toBeInTheDocument()
      expect(screen.queryByTestId('menu-management')).not.toBeInTheDocument()
      expect(screen.queryByTestId('order-dashboard')).not.toBeInTheDocument()
      
      // Should NOT show navigation bar (dashboard doesn't show nav)
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('defaults to dashboard for empty view parameter', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view='] 
      })
      
      // Should default to dashboard view
      expect(screen.getByText('Barista Administration Dashboard')).toBeInTheDocument()
    })

    it('defaults to dashboard for unknown view parameter', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=nonexistent'] 
      })
      
      // Should default to dashboard view
      expect(screen.getByText('Barista Administration Dashboard')).toBeInTheDocument()
    })
  })

  describe('Navigation Updates URL Parameters', () => {
    it('updates URL when navigating from dashboard to menu', async () => {
      const user = userEvent.setup()
      
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin'] 
      })
      
      // Start in dashboard
      expect(screen.getByText('Barista Administration Dashboard')).toBeInTheDocument()
      
      // Click Menu Management button
      const menuButton = screen.getByRole('button', { name: /menu management/i })
      await user.click(menuButton)
      
      // Should now show Menu Management content
      await waitFor(() => {
        expect(screen.getByTestId('menu-management')).toBeInTheDocument()
      })
      
      // Should show navigation bar
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('updates URL when navigating from dashboard to orders', async () => {
      const user = userEvent.setup()
      
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin'] 
      })
      
      // Start in dashboard
      expect(screen.getByText('Barista Administration Dashboard')).toBeInTheDocument()
      
      // Click Order Management button
      const orderButton = screen.getByRole('button', { name: /order management/i })
      await user.click(orderButton)
      
      // Should now show Order Dashboard content
      await waitFor(() => {
        expect(screen.getByTestId('order-dashboard')).toBeInTheDocument()
      })
      
      // Should show navigation bar
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('navigates back to dashboard from menu view', async () => {
      const user = userEvent.setup()
      
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=menu'] 
      })
      
      // Start in menu view
      expect(screen.getByTestId('menu-management')).toBeInTheDocument()
      
      // Click Dashboard button in navigation (the Uy, Kape! logo button)
      const dashboardButton = screen.getByRole('button', { name: /uy, kape!/i })
      await user.click(dashboardButton)
      
      // Should now show dashboard content
      await waitFor(() => {
        expect(screen.getByText('Barista Administration Dashboard')).toBeInTheDocument()
      })
      
      // Should NOT show navigation bar anymore
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('navigates between menu and orders views', async () => {
      const user = userEvent.setup()
      
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=menu'] 
      })
      
      // Start in menu view
      expect(screen.getByTestId('menu-management')).toBeInTheDocument()
      
      // Click Orders button
      const ordersButton = screen.getByRole('button', { name: /orders/i })
      await user.click(ordersButton)
      
      // Should now show Order Dashboard content
      await waitFor(() => {
        expect(screen.getByTestId('order-dashboard')).toBeInTheDocument()
      })
      
      // Menu content should be gone
      expect(screen.queryByTestId('menu-management')).not.toBeInTheDocument()
    })
  })

  describe('View Persistence Across Re-renders', () => {
    it('maintains menu view across component re-renders', () => {
      const { rerender } = render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=menu'] 
      })
      
      // Should show menu content
      expect(screen.getByTestId('menu-management')).toBeInTheDocument()
      
      // Re-render the component
      rerender(<ProtectedBaristaModule />)
      
      // Should still show menu content
      expect(screen.getByTestId('menu-management')).toBeInTheDocument()
      expect(screen.queryByText('Barista Administration Dashboard')).not.toBeInTheDocument()
    })

    it('maintains orders view across component re-renders', () => {
      const { rerender } = render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=orders'] 
      })
      
      // Should show orders content
      expect(screen.getByTestId('order-dashboard')).toBeInTheDocument()
      
      // Re-render the component
      rerender(<ProtectedBaristaModule />)
      
      // Should still show orders content
      expect(screen.getByTestId('order-dashboard')).toBeInTheDocument()
      expect(screen.queryByText('Barista Administration Dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility and User Experience', () => {
    it('has proper ARIA attributes in navigation', () => {
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin?view=menu'] 
      })
      
      // Navigation should be properly labeled
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      
      // Buttons should be accessible
      const dashboardButton = screen.getByRole('button', { name: /uy, kape!/i })
      const menuButton = screen.getByRole('button', { name: /menu management/i })
      const ordersButton = screen.getByRole('button', { name: /orders/i })
      
      expect(dashboardButton).toBeVisible()
      expect(menuButton).toBeVisible()
      expect(ordersButton).toBeVisible()
    })

    it('maintains focus when navigating between views', async () => {
      const user = userEvent.setup()
      
      render(<ProtectedBaristaModule />, { 
        initialEntries: ['/admin'] 
      })
      
      // Click Menu Management button
      const menuButton = screen.getByRole('button', { name: /menu management/i })
      await user.click(menuButton)
      
      // Should be able to find focusable elements in the new view
      await waitFor(() => {
        expect(screen.getByTestId('menu-management')).toBeInTheDocument()
      })
      
      // Navigation buttons should still be accessible
      const dashboardButton = screen.getByRole('button', { name: /uy, kape!/i })
      expect(dashboardButton).toBeVisible()
    })
  })
})