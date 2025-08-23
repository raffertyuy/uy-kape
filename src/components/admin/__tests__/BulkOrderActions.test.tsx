import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../../tests/config/test-utils'
import type { AdminOrderListItem, BulkOperationResult } from '../../../types/admin.types'

// Component variables
let BulkOrderActions: any

describe('BulkOrderActions', () => {
  beforeAll(async () => {
    // Import component after mocking
    const bulkOrderActionsModule = await import('../BulkOrderActions')
    BulkOrderActions = bulkOrderActionsModule.BulkOrderActions
  })

  const mockSelectedOrders: AdminOrderListItem[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      guest_name: 'John Doe',
      drink_id: 'drink-123',
      drink_name: 'Americano',
      category_name: 'Coffee',
      special_request: 'Extra hot',
      status: 'pending',
      queue_number: 1,
      selected_options: [
        {
          option_category_id: 'cat-1',
          option_category_name: 'Size',
          option_value_id: 'val-1',
          option_value_name: 'Medium'
        }
      ],
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      estimated_completion_time: '2024-01-15T10:45:00Z',
      priority_level: 'normal'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      guest_name: 'Jane Smith',
      drink_id: 'drink-124',
      drink_name: 'Latte',
      category_name: 'Coffee',
      special_request: null,
      status: 'pending',
      queue_number: 2,
      selected_options: [
        {
          option_category_id: 'cat-1',
          option_category_name: 'Size',
          option_value_id: 'val-2',
          option_value_name: 'Large'
        },
        {
          option_category_id: 'cat-2',
          option_category_name: 'Extras',
          option_value_id: 'val-3',
          option_value_name: 'Extra Shot'
        }
      ],
      created_at: '2024-01-15T10:35:00Z',
      updated_at: '2024-01-15T10:35:00Z',
      estimated_completion_time: '2024-01-15T10:50:00Z',
      priority_level: 'high'
    }
  ]

  const mockSuccessResult: BulkOperationResult = {
    success_count: 2,
    failed_count: 0,
    errors: []
  }

  const mockPartialFailureResult: BulkOperationResult = {
    success_count: 1,
    failed_count: 1,
    errors: [
      {
        order_id: '550e8400-e29b-41d4-a716-446655440002',
        error: 'Order not found'
      }
    ]
  }

  const mockOnBulkStatusUpdate = vi.fn()
  const mockOnClearSelection = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render bulk actions panel when orders are selected', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      expect(screen.getByText('Bulk Actions')).toBeInTheDocument()
      expect(screen.getByText('2 selected')).toBeInTheDocument()
      expect(screen.getByText('Clear selection')).toBeInTheDocument()
    })

    it('should not render when no orders are selected', () => {
      const { container } = render(
        <BulkOrderActions
          selectedOrders={[]}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should show complete and cancel action buttons for pending orders', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      expect(screen.getByText('Complete (2)')).toBeInTheDocument()
      expect(screen.getByText('Cancel (2)')).toBeInTheDocument()
    })

    it('should display selected orders preview', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      expect(screen.getByText('Selected orders:')).toBeInTheDocument()
      expect(screen.getByText('John Doe - 1 option')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith - 2 options')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onClearSelection when clear selection button is clicked', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Clear selection'))
      expect(mockOnClearSelection).toHaveBeenCalledTimes(1)
    })

    it('should show confirmation dialog when complete action is clicked', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      expect(screen.getByText('Confirm Bulk Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to completed 2 selected orders?')).toBeInTheDocument()
    })

    it('should show confirmation dialog when cancel action is clicked', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Cancel (2)'))
      expect(screen.getByText('Confirm Bulk Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to cancelled 2 selected orders?')).toBeInTheDocument()
    })

    it('should close confirmation dialog when cancel button is clicked', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      expect(screen.getByText('Confirm Bulk Action')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Cancel'))
      expect(screen.queryByText('Confirm Bulk Action')).not.toBeInTheDocument()
    })
  })

  describe('Bulk Operations', () => {
    it('should execute bulk complete operation when confirmed', async () => {
      mockOnBulkStatusUpdate.mockResolvedValue(mockSuccessResult)

      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      fireEvent.click(screen.getByText('Confirm Complete'))

      await waitFor(() => {
        expect(mockOnBulkStatusUpdate).toHaveBeenCalledWith(
          ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
          'completed'
        )
      })
    })

    it('should execute bulk cancel operation when confirmed', async () => {
      mockOnBulkStatusUpdate.mockResolvedValue(mockSuccessResult)

      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Cancel (2)'))
      fireEvent.click(screen.getByText('Confirm Cancellation'))

      await waitFor(() => {
        expect(mockOnBulkStatusUpdate).toHaveBeenCalledWith(
          ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
          'cancelled'
        )
      })
    })

    it('should clear selection after successful bulk operation', async () => {
      mockOnBulkStatusUpdate.mockResolvedValue(mockSuccessResult)

      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      fireEvent.click(screen.getByText('Confirm Complete'))

      await waitFor(() => {
        expect(mockOnClearSelection).toHaveBeenCalledTimes(1)
      })
    })

    it('should display success message after successful operation', async () => {
      mockOnBulkStatusUpdate.mockResolvedValue(mockSuccessResult)

      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      fireEvent.click(screen.getByText('Confirm Complete'))

      await waitFor(() => {
        expect(screen.getByText('✅ 2 orders updated successfully')).toBeInTheDocument()
      })
    })

    it('should display error messages for partial failures', async () => {
      mockOnBulkStatusUpdate.mockResolvedValue(mockPartialFailureResult)

      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      fireEvent.click(screen.getByText('Confirm Complete'))

      await waitFor(() => {
        expect(screen.getByText('✅ 1 orders updated successfully')).toBeInTheDocument()
        expect(screen.getByText('❌ 1 errors:')).toBeInTheDocument()
        expect(screen.getByText('Order 550e8400-e29b-41d4-a716-446655440002: Order not found')).toBeInTheDocument()
      })
    })

    it('should handle operation failures gracefully', async () => {
      mockOnBulkStatusUpdate.mockRejectedValue(new Error('Network error'))

      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      fireEvent.click(screen.getByText('Confirm Complete'))

      await waitFor(() => {
        expect(screen.getByText('❌ 2 errors:')).toBeInTheDocument()
      })
    })

    it('should show loading state during bulk operation', async () => {
      // Mock a delayed response
      mockOnBulkStatusUpdate.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSuccessResult), 100))
      )

      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      fireEvent.click(screen.getByText('Confirm Complete'))

      expect(screen.getByText('Processing...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Processing...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for action buttons', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      expect(screen.getByLabelText('Complete 2 selected orders')).toBeInTheDocument()
      expect(screen.getByLabelText('Cancel 2 selected orders')).toBeInTheDocument()
      expect(screen.getByLabelText('Clear selection')).toBeInTheDocument()
    })

    it('should disable buttons during loading state', async () => {
      mockOnBulkStatusUpdate.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSuccessResult), 100))
      )

      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      fireEvent.click(screen.getByText('Confirm Complete'))

      expect(screen.getByText('Cancel (2)')).toBeDisabled()

      await waitFor(() => {
        expect(screen.getByText('Cancel (2)')).not.toBeDisabled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle single order selection correctly', () => {
      render(
        <BulkOrderActions
          selectedOrders={[mockSelectedOrders[0]]}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      expect(screen.getByText('1 selected')).toBeInTheDocument()
      expect(screen.getByText('Complete (1)')).toBeInTheDocument()
      expect(screen.getByText('Cancel (1)')).toBeInTheDocument()
    })

    it('should handle orders with no options correctly', () => {
      const orderWithoutOptions = {
        ...mockSelectedOrders[0],
        selected_options: []
      }

      render(
        <BulkOrderActions
          selectedOrders={[orderWithoutOptions]}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      expect(screen.getByText('John Doe - 0 options')).toBeInTheDocument()
    })

    it('should display confirmation dialog with order details', () => {
      render(
        <BulkOrderActions
          selectedOrders={mockSelectedOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (2)'))
      
      expect(screen.getByText('This will affect:')).toBeInTheDocument()
      expect(screen.getByText('• John Doe (pending)')).toBeInTheDocument()
      expect(screen.getByText('• Jane Smith (pending)')).toBeInTheDocument()
    })

    it('should truncate long order lists in confirmation dialog', () => {
      const manyOrders = Array.from({ length: 7 }, (_, i) => ({
        ...mockSelectedOrders[0],
        id: `order-${i}`,
        guest_name: `Guest ${i + 1}`
      }))

      render(
        <BulkOrderActions
          selectedOrders={manyOrders}
          onBulkStatusUpdate={mockOnBulkStatusUpdate}
          onClearSelection={mockOnClearSelection}
        />
      )

      fireEvent.click(screen.getByText('Complete (7)'))
      
      expect(screen.getByText('... and 2 more orders')).toBeInTheDocument()
    })
  })
})