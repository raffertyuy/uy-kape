import { render, screen } from '../../../../tests/config/test-utils'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

// Component variables
let OrderSummary: any

describe('OrderSummary', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('lucide-react', () => ({
      Clock: () => <div data-testid="clock-icon" />,
      CheckCircle2: () => <div data-testid="check-circle-icon" />,
      User: () => <div data-testid="user-icon" />,
      Coffee: () => <div data-testid="coffee-icon" />,
      MessageSquare: () => <div data-testid="message-square-icon" />
    }))

    // Import component after mocking
    const orderSummaryModule = await import('../OrderSummary')
    OrderSummary = orderSummaryModule.OrderSummary
  })

  afterAll(() => {
    vi.doUnmock('lucide-react')
  })
  const mockDrink = {
    id: '1',
    name: 'Americano',
    description: 'Classic black coffee',
    category_id: 'cat1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    drink_options: [],
    category: {
      id: 'cat1',
      name: 'Coffee',
      description: 'Hot coffee drinks',
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  } as any

  const mockOptionCategories = [
    {
      id: 'size',
      name: 'Size',
      description: 'Cup size',
      is_required: true,
      display_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      option_values: [
        {
          id: 'small',
          name: 'Small',
          category_id: 'size',
          display_order: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 'large',
          name: 'Large',
          category_id: 'size',
          display_order: 2,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]
    }
  ] as any

  const defaultProps = {
    drink: mockDrink,
    selectedOptions: { size: 'large' },
    optionCategories: mockOptionCategories,
    guestName: 'John Doe'
  }

  describe('Basic Information Display', () => {
    it('should render order summary title', () => {
      render(<OrderSummary {...defaultProps} />)
      
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })

    it('should display guest name', () => {
      render(<OrderSummary {...defaultProps} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText(/order for:/i)).toBeInTheDocument()
    })

    it('should display drink name and description', () => {
      render(<OrderSummary {...defaultProps} />)
      
      expect(screen.getByText('Americano')).toBeInTheDocument()
      expect(screen.getByText('Classic black coffee')).toBeInTheDocument()
    })

    it('should display selected options', () => {
      render(<OrderSummary {...defaultProps} />)
      
      expect(screen.getByText(/customizations/i)).toBeInTheDocument()
      expect(screen.getByText('Size:')).toBeInTheDocument()
      expect(screen.getByText('Large')).toBeInTheDocument()
    })

    it('should display order status', () => {
      render(<OrderSummary {...defaultProps} />)
      
      expect(screen.getByText('Status:')).toBeInTheDocument()
      expect(screen.getByText('Ready to Submit')).toBeInTheDocument()
    })
  })

  describe('Special Request Display', () => {
    it('should not show special request section when not provided', () => {
      render(<OrderSummary {...defaultProps} />)
      
      expect(screen.queryByText(/special request/i)).not.toBeInTheDocument()
    })

    it('should not show special request section when empty string', () => {
      render(<OrderSummary {...defaultProps} specialRequest="" />)
      
      expect(screen.queryByText(/special request/i)).not.toBeInTheDocument()
    })

    it('should not show special request section when only whitespace', () => {
      render(<OrderSummary {...defaultProps} specialRequest="   " />)
      
      expect(screen.queryByText(/special request/i)).not.toBeInTheDocument()
    })

    it('should display special request when provided', () => {
      const specialRequest = 'Extra hot please'
      render(<OrderSummary {...defaultProps} specialRequest={specialRequest} />)
      
      expect(screen.getByText(/special request/i)).toBeInTheDocument()
      expect(screen.getByText('Extra hot please')).toBeInTheDocument()
    })

    it('should preserve whitespace in special request text', () => {
      const specialRequest = 'Line 1\\nLine 2\\n\\nLine 4'
      render(<OrderSummary {...defaultProps} specialRequest={specialRequest} />)
      
      const requestText = screen.getByText(specialRequest)
      expect(requestText).toHaveClass('whitespace-pre-wrap')
    })

    it('should display special request with proper styling', () => {
      render(<OrderSummary {...defaultProps} specialRequest="Test request" />)
      
      const requestSection = screen.getByText('Test request').closest('div')
      expect(requestSection).toHaveClass('bg-white')
      expect(requestSection).toHaveClass('rounded-lg')
    })
  })

  describe('Conditional Rendering', () => {
    it('should hide customizations section when no options selected', () => {
      render(<OrderSummary {...defaultProps} selectedOptions={{}} />)
      
      expect(screen.queryByText(/customizations/i)).not.toBeInTheDocument()
    })

    it('should show customizations section when options are selected', () => {
      render(<OrderSummary {...defaultProps} />)
      
      expect(screen.getByText(/customizations/i)).toBeInTheDocument()
    })

    it('should handle guest name fallback', () => {
      render(<OrderSummary {...defaultProps} guestName="" />)
      
      expect(screen.getByText('Guest')).toBeInTheDocument()
    })

    it('should handle missing drink description gracefully', () => {
      const drinkWithoutDescription = { ...mockDrink, description: '' }
      render(<OrderSummary {...defaultProps} drink={drinkWithoutDescription} />)
      
      expect(screen.getByText('Americano')).toBeInTheDocument()
      expect(screen.queryByText('Classic black coffee')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<OrderSummary {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Order Summary')
    })

    it('should have descriptive text for screen readers', () => {
      render(<OrderSummary {...defaultProps} specialRequest="Extra hot" />)
      
      expect(screen.getByText(/order for:/i)).toBeInTheDocument()
      expect(screen.getByText(/drink:/i)).toBeInTheDocument()
      expect(screen.getByText(/special request:/i)).toBeInTheDocument()
      expect(screen.getByText(/status:/i)).toBeInTheDocument()
    })
  })
})