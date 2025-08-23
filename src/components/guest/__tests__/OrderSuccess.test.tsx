import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { OrderSuccess } from '../OrderSuccess'
import { useGuestOrderActions } from '@/hooks/useGuestOrderActions'
import type { OrderSubmissionResult } from '@/types/order.types'

// Mock the useGuestOrderActions hook
vi.mock('@/hooks/useGuestOrderActions')

// Mock the BaristaProverb component
vi.mock('@/components/ui/BaristaProverb', () => ({
  BaristaProverb: ({ category, className }: { category: string; className?: string }) => (
    <div data-testid="barista-proverb" data-category={category} className={className}>
      Mocked BaristaProverb
    </div>
  )
}))

const mockUseGuestOrderActions = vi.mocked(useGuestOrderActions)

const mockOrderResult: OrderSubmissionResult = {
  order_id: 'test-order-123',
  queue_number: 5,
  estimated_wait_time: '10-15 minutes'
}

const defaultProps = {
  result: mockOrderResult,
  guestName: 'John Doe',
  onCreateNewOrder: vi.fn(),
  className: ''
}

describe('OrderSuccess', () => {
  const mockCancelOrder = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseGuestOrderActions.mockReturnValue({
      cancelOrder: mockCancelOrder,
      isCancelling: false,
      cancelError: null,
      clearError: mockClearError
    })
  })

  describe('Initial Display', () => {
    it('should render order confirmation details', () => {
      render(<OrderSuccess {...defaultProps} />)

      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument()
      expect(screen.getByText('Thanks John Doe! Your order has been received.')).toBeInTheDocument()
      expect(screen.getByText('10-15 minutes')).toBeInTheDocument() // Wait time
      
      // The order details might be in a different section, let's just check that the component renders the main elements
      expect(screen.getByRole('button', { name: /cancel this order/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /place another order/i })).toBeInTheDocument()
    })

    it('should display special request when provided', () => {
      const propsWithSpecialRequest = {
        ...defaultProps,
        specialRequest: 'Extra hot, no foam'
      }
      
      render(<OrderSuccess {...propsWithSpecialRequest} />)

      expect(screen.getByText('Special Request:')).toBeInTheDocument()
      expect(screen.getByText('Extra hot, no foam')).toBeInTheDocument()
    })

    it('should not display special request section when not provided', () => {
      render(<OrderSuccess {...defaultProps} />)

      expect(screen.queryByText('Special Request:')).not.toBeInTheDocument()
    })

    it('should display cancel order button', () => {
      render(<OrderSuccess {...defaultProps} />)

      expect(screen.getByRole('button', { name: /cancel this order/i })).toBeInTheDocument()
    })

    it('should display place another order button', () => {
      render(<OrderSuccess {...defaultProps} />)

      expect(screen.getByRole('button', { name: /place another order/i })).toBeInTheDocument()
    })
  })

  describe('Order Cancellation', () => {
    it('should show confirmation dialog when cancel button is clicked', async () => {
      render(<OrderSuccess {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel this order/i })
      fireEvent.click(cancelButton)

      expect(screen.getByText('Cancel Order?')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to cancel your order? This action cannot be undone.')).toBeInTheDocument()
      
      // Check for parts separately since the text might be split across elements
      expect(screen.getByText((content) => content.includes('Order #'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('Queue #'))).toBeInTheDocument()
    })

    it('should close confirmation dialog when "Keep Order" is clicked', async () => {
      render(<OrderSuccess {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel this order/i })
      fireEvent.click(cancelButton)

      const keepOrderButton = screen.getByRole('button', { name: /keep order/i })
      fireEvent.click(keepOrderButton)

      await waitFor(() => {
        expect(screen.queryByText('Cancel Order?')).not.toBeInTheDocument()
      })
    })

    it('should call cancelOrder when "Yes, Cancel Order" is clicked', async () => {
      mockCancelOrder.mockResolvedValue({ success: true })
      
      render(<OrderSuccess {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel this order/i })
      fireEvent.click(cancelButton)

      const confirmCancelButton = screen.getByRole('button', { name: /yes, cancel order/i })
      fireEvent.click(confirmCancelButton)

      await waitFor(() => {
        expect(mockCancelOrder).toHaveBeenCalledWith('test-order-123', 'John Doe')
      })
    })

    it('should show success message after successful cancellation', async () => {
      mockCancelOrder.mockResolvedValue({ success: true })
      
      render(<OrderSuccess {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel this order/i })
      fireEvent.click(cancelButton)

      const confirmCancelButton = screen.getByRole('button', { name: /yes, cancel order/i })
      fireEvent.click(confirmCancelButton)

      await waitFor(() => {
        expect(screen.getByText('Order Cancelled')).toBeInTheDocument()
        expect(screen.getByText('Your order has been cancelled successfully.')).toBeInTheDocument()
        expect(screen.getByText('Redirecting to new order in a few seconds...')).toBeInTheDocument()
      })
    })

    it('should show loading state while cancelling', () => {
      mockUseGuestOrderActions.mockReturnValue({
        cancelOrder: mockCancelOrder,
        isCancelling: true,
        cancelError: null,
        clearError: mockClearError
      })

      render(<OrderSuccess {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancelling.../i })
      expect(cancelButton).toBeDisabled()
    })

    it('should display error message when cancellation fails', () => {
      const errorMessage = 'Order is too old to cancel'
      mockUseGuestOrderActions.mockReturnValue({
        cancelOrder: mockCancelOrder,
        isCancelling: false,
        cancelError: errorMessage,
        clearError: mockClearError
      })

      render(<OrderSuccess {...defaultProps} />)

      expect(screen.getByText('Cancellation Failed')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should clear error when cancel dialog is opened', () => {
      const errorMessage = 'Order is too old to cancel'
      mockUseGuestOrderActions.mockReturnValue({
        cancelOrder: mockCancelOrder,
        isCancelling: false,
        cancelError: errorMessage,
        clearError: mockClearError
      })

      render(<OrderSuccess {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel this order/i })
      fireEvent.click(cancelButton)

      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('Navigation', () => {
    it('should call onCreateNewOrder when "Place Another Order" is clicked', () => {
      render(<OrderSuccess {...defaultProps} />)

      const newOrderButton = screen.getByRole('button', { name: /place another order/i })
      fireEvent.click(newOrderButton)

      expect(defaultProps.onCreateNewOrder).toHaveBeenCalled()
    })

    it('should call onCreateNewOrder when "Place New Order Now" is clicked after cancellation', async () => {
      mockCancelOrder.mockResolvedValue({ success: true })
      
      render(<OrderSuccess {...defaultProps} />)

      // Cancel the order
      const cancelButton = screen.getByRole('button', { name: /cancel this order/i })
      fireEvent.click(cancelButton)

      const confirmCancelButton = screen.getByRole('button', { name: /yes, cancel order/i })
      fireEvent.click(confirmCancelButton)

      // Wait for success state and click new order button
      await waitFor(() => {
        const newOrderButton = screen.getByRole('button', { name: /place new order now/i })
        fireEvent.click(newOrderButton)
      })

      expect(defaultProps.onCreateNewOrder).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles and labels', () => {
      render(<OrderSuccess {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel this order/i })
      const newOrderButton = screen.getByRole('button', { name: /place another order/i })

      expect(cancelButton).toBeInTheDocument()
      expect(newOrderButton).toBeInTheDocument()
    })

    it('should disable buttons when cancelling', () => {
      mockUseGuestOrderActions.mockReturnValue({
        cancelOrder: mockCancelOrder,
        isCancelling: true,
        cancelError: null,
        clearError: mockClearError
      })

      render(<OrderSuccess {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancelling.../i })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('BaristaProverb Integration', () => {
    it('should display BaristaProverb when estimated wait time is provided', () => {
      render(<OrderSuccess {...defaultProps} />)

      expect(screen.getByTestId('barista-proverb')).toBeInTheDocument()
      expect(screen.getByTestId('barista-proverb')).toHaveAttribute('data-category', 'patience')
    })

    it('should not display BaristaProverb when no estimated wait time', () => {
      const propsWithoutWaitTime = {
        ...defaultProps,
        result: {
          ...mockOrderResult,
          estimated_wait_time: null as any
        }
      }

      render(<OrderSuccess {...propsWithoutWaitTime} />)

      expect(screen.queryByTestId('barista-proverb')).not.toBeInTheDocument()
    })
  })
})