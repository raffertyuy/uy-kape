import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen } from '../../../../tests/config/test-utils'
import userEvent from '@testing-library/user-event'

// Mock the hooks and services
vi.mock('@/hooks/useRealtimeOrders', () => ({
  useRealtimeOrders: vi.fn()
}))

vi.mock('@/services/adminOrderService', () => ({
  adminOrderService: {
    updateOrderStatus: vi.fn(),
    bulkComplete: vi.fn(),
    bulkCancel: vi.fn(),
    clearAllPending: vi.fn()
  }
}))

import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'

// Component variables
let OrderDashboard: any

describe('OrderDashboard', () => {
  beforeAll(async () => {
    // Import component after setup
    const orderDashboardModule = await import('../OrderDashboard')
    OrderDashboard = orderDashboardModule.OrderDashboard
  })

  const mockOrders = [
    {
      id: '1',
      guest_name: 'John Doe',
      status: 'pending' as const,
      created_at: '2025-01-01T10:00:00Z',
      estimated_wait_time_minutes: 10,
      items: [],
      order_item_count: 1,
      total_amount: 10.50
    },
    {
      id: '2',
      guest_name: 'Jane Smith',
      status: 'completed' as const,
      created_at: '2025-01-01T09:30:00Z',
      estimated_wait_time_minutes: 8,
      items: [],
      order_item_count: 2,
      total_amount: 15.75
    }
  ]

  const defaultHookReturn = {
    orders: mockOrders,
    loading: false,
    error: null,
    refetch: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRealtimeOrders as any).mockReturnValue(defaultHookReturn)
  })

  describe('Basic Rendering', () => {
    it('renders the dashboard title and order count', () => {
      render(<OrderDashboard />)
      
      expect(screen.getByText('Order Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/\d+ orders?/)).toBeInTheDocument()
    })

    it('renders order statistics', () => {
      render(<OrderDashboard />)
      
      expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Total').length).toBeGreaterThanOrEqual(1)
    })

    it('has proper test IDs for component identification', () => {
      render(<OrderDashboard />)
      
      expect(screen.getByTestId('order-dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-controls')).toBeInTheDocument()
      expect(screen.getByTestId('order-statistics')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading skeleton when loading and no orders', () => {
      ;(useRealtimeOrders as any).mockReturnValue({
        ...defaultHookReturn,
        orders: [],
        loading: true
      })

      render(<OrderDashboard />)
      
      // Check for loading skeleton elements
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('does not show loading skeleton when orders exist', () => {
      ;(useRealtimeOrders as any).mockReturnValue({
        ...defaultHookReturn,
        loading: true // but orders exist
      })

      render(<OrderDashboard />)
      
      // Should still show the dashboard content
      expect(screen.getByText('Order Dashboard')).toBeInTheDocument()
      expect(screen.queryByText(/animate-pulse/)).not.toBeInTheDocument()
    })
  })

  describe('Mobile Responsive Header Layout', () => {
    it('has responsive flex layout for header controls', () => {
      render(<OrderDashboard />)
      
      const headerControls = screen.getByTestId('dashboard-controls')
      expect(headerControls).toHaveClass(
        'flex',
        'flex-col',
        'space-y-4',
        'lg:flex-row',
        'lg:items-center',
        'lg:justify-between',
        'lg:space-y-0'
      )
    })

    it('has stacked mobile controls layout', () => {
      render(<OrderDashboard />)
      
      // Find the controls container
      const controlsContainer = document.querySelector('.flex.flex-col.space-y-3.sm\\:flex-row')
      expect(controlsContainer).toBeInTheDocument()
      expect(controlsContainer).toHaveClass(
        'flex',
        'flex-col',
        'space-y-3',
        'sm:flex-row',
        'sm:space-y-0',
        'sm:space-x-4'
      )
    })

    it('has proper mobile button layout', () => {
      render(<OrderDashboard />)
      
      // Check refresh button has full width on mobile
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toHaveClass('w-full', 'sm:w-auto')
    })

    it('has proper mobile spacing for action buttons', () => {
      render(<OrderDashboard />)
      
      // Find the action buttons container
      const actionButtonsContainer = document.querySelector('.flex.flex-col.space-y-3.sm\\:flex-row.sm\\:space-y-0.sm\\:space-x-3')
      expect(actionButtonsContainer).toBeInTheDocument()
      expect(actionButtonsContainer).toHaveClass(
        'flex',
        'flex-col',
        'space-y-3',
        'sm:flex-row',
        'sm:space-y-0',
        'sm:space-x-3'
      )
    })

    it('prevents text wrapping on buttons with whitespace-nowrap', () => {
      render(<OrderDashboard />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      const refreshSpan = refreshButton.querySelector('.whitespace-nowrap')
      expect(refreshSpan).toBeInTheDocument()
      expect(refreshSpan).toHaveClass('whitespace-nowrap')
    })
  })

  describe('Responsive Statistics Grid', () => {
    it('has responsive grid layout for statistics', () => {
      render(<OrderDashboard />)
      
      const statisticsGrid = screen.getByTestId('order-statistics')
      expect(statisticsGrid).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-3',
        'gap-4'
      )
    })

    it('statistics cards have proper mobile overflow handling', () => {
      render(<OrderDashboard />)
      
      const statisticsCards = document.querySelectorAll('.bg-white.overflow-hidden.shadow.rounded-lg')
      expect(statisticsCards.length).toBeGreaterThan(0)
      
      statisticsCards.forEach(card => {
        expect(card).toHaveClass('bg-white', 'overflow-hidden', 'shadow', 'rounded-lg')
      })
    })

    it('statistics text has proper truncation classes', () => {
      render(<OrderDashboard />)
      
      // Check for truncate classes on statistic labels
      const truncatedElements = document.querySelectorAll('.truncate')
      expect(truncatedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Connection Status Mobile Layout', () => {
    it('shows connection status with proper mobile spacing', () => {
      render(<OrderDashboard />)
      
      const connectionStatus = screen.getByTestId('connection-status')
      expect(connectionStatus).toBeInTheDocument()
      expect(connectionStatus).toHaveClass('flex', 'items-center', 'space-x-2')
    })

    it('has responsive justify behavior for mobile controls', () => {
      render(<OrderDashboard />)
      
      // Find the container with responsive justify classes
      const responsiveContainer = document.querySelector('.flex.items-center.justify-between.sm\\:justify-start')
      expect(responsiveContainer).toBeInTheDocument()
      expect(responsiveContainer).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'sm:justify-start',
        'space-x-4'
      )
    })
  })

  describe('Toggle Switch Mobile Behavior', () => {
    it('renders show completed toggle with proper mobile accessibility', async () => {
      const user = userEvent.setup()
      render(<OrderDashboard />)
      
      const toggle = screen.getByRole('switch', { name: /toggle show completed orders/i })
      expect(toggle).toBeInTheDocument()
      expect(toggle).toHaveAttribute('aria-checked', 'false')
      
      await user.click(toggle)
      expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('toggle has proper focus styles for mobile accessibility', () => {
      render(<OrderDashboard />)
      
      const toggle = screen.getByRole('switch', { name: /toggle show completed orders/i })
      expect(toggle).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-coffee-500',
        'focus:ring-offset-2'
      )
    })

    it('toggle label has whitespace-nowrap for mobile', () => {
      render(<OrderDashboard />)
      
      const toggleLabel = screen.getByText('Show Completed')
      expect(toggleLabel).toHaveClass('whitespace-nowrap')
    })
  })

  describe('Order Count and Selection Display', () => {
    it('displays order count with proper mobile formatting', () => {
      render(<OrderDashboard />)
      
      expect(screen.getByText(/\d+ orders?/)).toBeInTheDocument()
    })

    it('displays singular order correctly', () => {
      ;(useRealtimeOrders as any).mockReturnValue({
        ...defaultHookReturn,
        orders: [mockOrders[0]]
      })

      render(<OrderDashboard />)
      
      expect(screen.getByText(/1 order/)).toBeInTheDocument()
      expect(screen.queryByText(/1 orders/)).not.toBeInTheDocument()
    })

    it('handles empty orders state', () => {
      ;(useRealtimeOrders as any).mockReturnValue({
        ...defaultHookReturn,
        orders: []
      })

      render(<OrderDashboard />)
      
      expect(screen.getByText(/0 orders/)).toBeInTheDocument()
    })
  })

  describe('Button Touch Targets', () => {
    it('buttons have adequate touch target sizes', () => {
      render(<OrderDashboard />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toHaveClass('px-3', 'py-2')
      
      // Check for inline-flex and items-center for proper layout
      expect(refreshButton).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })

    it('toggle switch has proper touch target size', () => {
      render(<OrderDashboard />)
      
      const toggle = screen.getByRole('switch', { name: /toggle show completed orders/i })
      expect(toggle).toHaveClass('h-6', 'w-11')
    })
  })

  describe('Responsive Breakpoint Behavior', () => {
    it('has proper spacing classes for different breakpoints', () => {
      render(<OrderDashboard />)
      
      const headerControls = screen.getByTestId('dashboard-controls')
      
      // Check for mobile-first responsive classes
      expect(headerControls).toHaveClass('space-y-4')
      expect(headerControls).toHaveClass('lg:space-y-0')
    })

    it('applies responsive flex direction changes', () => {
      render(<OrderDashboard />)
      
      const headerControls = screen.getByTestId('dashboard-controls')
      
      expect(headerControls).toHaveClass('flex-col')
      expect(headerControls).toHaveClass('lg:flex-row')
    })
  })

  describe('Clear All Pending Button Mobile Layout', () => {
    it('shows clear all button when pending orders exist', () => {
      render(<OrderDashboard />)
      
      const clearButton = screen.getByRole('button', { name: /clear all pending/i })
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).toHaveClass('w-full', 'sm:w-auto')
    })

    it('does not show clear all button when no pending orders', () => {
      const completedOrders = mockOrders.map(order => ({ ...order, status: 'completed' as const }))
      ;(useRealtimeOrders as any).mockReturnValue({
        ...defaultHookReturn,
        orders: completedOrders
      })

      render(<OrderDashboard />)
      
      expect(screen.queryByRole('button', { name: /clear all pending/i })).not.toBeInTheDocument()
    })

    it('clear button has proper mobile styling', () => {
      render(<OrderDashboard />)
      
      const clearButton = screen.getByRole('button', { name: /clear all pending/i })
      expect(clearButton).toHaveClass(
        'w-full',
        'sm:w-auto',
        'inline-flex',
        'items-center',
        'justify-center'
      )
    })
  })

  describe('Error Handling', () => {
    it('component renders basic structure when no error occurs', () => {
      render(<OrderDashboard />)
      
      // Should render basic structure
      expect(screen.getByText('Order Dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('order-dashboard')).toBeInTheDocument()
    })
  })

  describe('Custom className prop', () => {
    it('applies custom className to the root container', () => {
      const customClassName = 'custom-dashboard-class'
      render(<OrderDashboard className={customClassName} />)
      
      const dashboard = screen.getByTestId('order-dashboard')
      expect(dashboard).toHaveClass(customClassName)
    })

    it('handles undefined className gracefully', () => {
      expect(() => {
        render(<OrderDashboard className={undefined} />)
      }).not.toThrow()
      
      expect(screen.getByTestId('order-dashboard')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for toggle switches', () => {
      render(<OrderDashboard />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-label', 'Toggle show completed orders')
      expect(toggle).toHaveAttribute('aria-checked')
    })

    it('has proper heading structure', () => {
      render(<OrderDashboard />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Order Dashboard')
    })

    it('statistics have proper semantic structure', () => {
      render(<OrderDashboard />)
      
      // Check for definition list elements in statistics
      const dlElements = document.querySelectorAll('dl')
      expect(dlElements.length).toBeGreaterThan(0)
      
      const dtElements = document.querySelectorAll('dt')
      const ddElements = document.querySelectorAll('dd')
      expect(dtElements.length).toEqual(ddElements.length)
    })
  })
})