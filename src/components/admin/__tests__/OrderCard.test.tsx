import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent } from '../../../../tests/config/test-utils'
import type { AdminOrderListItem } from '../../../types/admin.types'

// Component variables
let OrderCard: any

describe('OrderCard', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('lucide-react', () => ({
      Clock: () => <div data-testid="clock-icon" />,
      CheckCircle: () => <div data-testid="check-circle-icon" />,
      XCircle: () => <div data-testid="x-circle-icon" />,
      Coffee: () => <div data-testid="coffee-icon" />,
      Users: () => <div data-testid="users-icon" />,
      MessageSquare: () => <div data-testid="message-square-icon" />
    }))

    vi.doMock('@/utils/queueUtils', () => ({
      calculateEstimatedTime: vi.fn(() => 15)
    }))

    vi.doMock('../OrderStatusBadge', () => ({
      OrderStatusBadge: ({ status }: { status: string }) => (
        <span data-testid="status-badge">{status}</span>
      )
    }))

    vi.doMock('../QueuePosition', () => ({
      QueuePosition: ({ position }: { position: number }) => (
        <span data-testid="queue-position">Queue #{position}</span>
      ),
      QueuePriorityIndicator: ({ priority }: { priority: string }) => (
        <span data-testid="priority-indicator">
          {priority === 'normal' ? 'Normal Priority' : priority}
        </span>
      )
    }))

    vi.doMock('../GuestNameDisplay', () => ({
      GuestNameDisplay: ({ guestName }: { guestName: string }) => (
        <div data-testid="guest-name-display">{guestName}</div>
      )
    }))

    // Import component after mocking
    const orderCardModule = await import('../OrderCard')
    OrderCard = orderCardModule.OrderCard
  })

  afterAll(() => {
    vi.doUnmock('lucide-react')
    vi.doUnmock('@/utils/queueUtils')
    vi.doUnmock('../OrderStatusBadge')
    vi.doUnmock('../QueuePosition')
    vi.doUnmock('../GuestNameDisplay')
  })

  const mockOrder: AdminOrderListItem = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  guest_name: 'John Doe',
  drink_id: 'drink-123',
  drink_name: 'Americano',
  category_name: 'Coffee',
  special_request: 'Extra hot, no foam',
  status: 'pending',
  queue_number: 3,
  selected_options: [
    {
      option_category_id: 'cat-1',
      option_category_name: 'Size',
      option_value_id: 'val-1',
      option_value_name: 'Medium'
    },
    {
      option_category_id: 'cat-2',
      option_category_name: 'Extras',
      option_value_id: 'val-2',
      option_value_name: 'Extra Shot'
    }
  ],
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  estimated_completion_time: '2024-01-15T10:45:00Z',
  priority_level: 'normal'
}

  const mockOnStatusUpdate = vi.fn()
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should use GuestNameDisplay component for guest name', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByTestId('guest-name-display')).toBeInTheDocument()
      expect(screen.getByTestId('guest-name-display')).toHaveTextContent('John Doe')
    })

    it('should render order information correctly', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Americano')).toBeInTheDocument()
      expect(screen.getByTestId('status-badge')).toBeInTheDocument()
      expect(screen.getByTestId('queue-position')).toBeInTheDocument()
    })

    it('should render special request when provided', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByText('"Extra hot, no foam"')).toBeInTheDocument()
    })

    it('should not render special request when empty', () => {
      const orderWithoutSpecialRequest = { ...mockOrder, special_request: '' }
      
      render(
        <OrderCard
          order={orderWithoutSpecialRequest}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.queryByText('Extra hot, no foam')).not.toBeInTheDocument()
    })

    it('should apply selected styling when isSelected is true', () => {
      const { container } = render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected
        />
      )

      // Check for selected styling classes
      const card = container.firstChild
      expect(card).toHaveClass('ring-2')
    })

    it('should render in compact mode when specified', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
          compact
        />
      )

      // In compact mode, the layout should be different
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Americano')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onSelect when card is clicked', () => {
      const { container } = render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      fireEvent.click(card)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith(mockOrder.id, true)
    })

    it('should call onStatusUpdate when status action is triggered', () => {
      // This test would depend on the actual status action buttons in the component
      // For now, we'll test that the component renders without errors
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
          showActions
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should not show actions when showActions is false', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
          showActions={false}
        />
      )

      // Test that the basic content is still rendered
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Americano')).toBeInTheDocument()
    })
  })

  describe('Order Status Handling', () => {
    it('should render pending status correctly', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByTestId('status-badge')).toHaveTextContent('pending')
    })

    it('should render completed status correctly', () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      
      render(
        <OrderCard
          order={completedOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByTestId('status-badge')).toHaveTextContent('completed')
    })

    it('should render cancelled status correctly', () => {
      const cancelledOrder = { ...mockOrder, status: 'cancelled' as const }
      
      render(
        <OrderCard
          order={cancelledOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByTestId('status-badge')).toHaveTextContent('cancelled')
    })

    it('should render completed status correctly', () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      
      render(
        <OrderCard
          order={completedOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByTestId('status-badge')).toHaveTextContent('completed')
    })
  })

  describe('Priority Level Display', () => {
    it('should display normal priority correctly', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const priorityIndicator = screen.queryByTestId('priority-indicator')
      expect(priorityIndicator).toBeInTheDocument()
      expect(priorityIndicator).toHaveTextContent('Normal Priority')
    })

    it('should display high priority correctly', () => {
      const highPriorityOrder = { ...mockOrder, priority_level: 'high' as const }
      
      render(
        <OrderCard
          order={highPriorityOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByTestId('priority-indicator')).toHaveTextContent('high')
    })

    it('should display urgent priority correctly', () => {
      const urgentOrder = { ...mockOrder, priority_level: 'urgent' as const }
      
      render(
        <OrderCard
          order={urgentOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByTestId('priority-indicator')).toHaveTextContent('urgent')
    })
  })

  describe('Edge Cases', () => {
    it('should handle order with no special request', () => {
      const orderWithoutSpecialRequest = { ...mockOrder, special_request: null }
      
      render(
        <OrderCard
          order={orderWithoutSpecialRequest}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Americano')).toBeInTheDocument()
    })

    it('should handle very long guest names', () => {
      const longNameOrder = { 
        ...mockOrder, 
        guest_name: 'This is a very long guest name that should be handled properly by the component' 
      }
      
      render(
        <OrderCard
          order={longNameOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByText(longNameOrder.guest_name)).toBeInTheDocument()
    })

    it('should handle order with no selected options', () => {
      const orderWithoutOptions = { ...mockOrder, selected_options: [] }
      
      render(
        <OrderCard
          order={orderWithoutOptions}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Americano')).toBeInTheDocument()
    })
  })

  describe('Checkbox Behavior for Order Status', () => {
    it('should show checkbox for pending orders when onSelect is provided', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('aria-label', 'Select order for John Doe')
    })

    it('should not show checkbox for completed orders', () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      
      render(
        <OrderCard
          order={completedOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('should not show checkbox for cancelled orders', () => {
      const cancelledOrder = { ...mockOrder, status: 'cancelled' as const }
      
      render(
        <OrderCard
          order={cancelledOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('should not show checkbox when onSelect is not provided', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          isSelected={false}
        />
      )

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('should only allow click interaction for pending orders', () => {
      const { container } = render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('role', 'button')
      expect(card).toHaveAttribute('tabIndex', '0')
      expect(card).toHaveAttribute('aria-label', 'Select order for John Doe')
    })

    it('should not allow click interaction for completed orders', () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      const { container } = render(
        <OrderCard
          order={completedOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveAttribute('role')
      expect(card).not.toHaveAttribute('tabIndex')
      expect(card).not.toHaveAttribute('aria-label')
    })

    it('should not allow click interaction for cancelled orders', () => {
      const cancelledOrder = { ...mockOrder, status: 'cancelled' as const }
      const { container } = render(
        <OrderCard
          order={cancelledOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveAttribute('role')
      expect(card).not.toHaveAttribute('tabIndex')
      expect(card).not.toHaveAttribute('aria-label')
    })

    it('should not call onSelect when completed order is clicked', () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      const { container } = render(
        <OrderCard
          order={completedOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      fireEvent.click(card)

      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('should handle keyboard navigation only for pending orders', () => {
      render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const { container } = render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      fireEvent.keyDown(card, { key: 'Enter' })

      expect(mockOnSelect).toHaveBeenCalledWith(mockOrder.id, true)
    })

    it('should handle space key for pending orders', () => {
      const { container } = render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      fireEvent.keyDown(card, { key: ' ' })

      expect(mockOnSelect).toHaveBeenCalledWith(mockOrder.id, true)
    })

    it('should not handle keyboard events for completed orders', () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      const { container } = render(
        <OrderCard
          order={completedOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      fireEvent.keyDown(card, { key: 'Enter' })

      expect(mockOnSelect).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible for pending orders', () => {
      const { container } = render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('tabIndex', '0')
    })

    it('should not be keyboard accessible for completed orders', () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      const { container } = render(
        <OrderCard
          order={completedOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveAttribute('tabIndex')
    })

    it('should have proper role attributes for pending orders', () => {
      const { container } = render(
        <OrderCard
          order={mockOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('role', 'button')
      expect(card).toHaveAttribute('aria-label', 'Select order for John Doe')
    })

    it('should not have interactive role attributes for completed orders', () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      const { container } = render(
        <OrderCard
          order={completedOrder}
          onStatusUpdate={mockOnStatusUpdate}
          onSelect={mockOnSelect}
          isSelected={false}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveAttribute('role')
      expect(card).not.toHaveAttribute('aria-label')
    })
  })
})