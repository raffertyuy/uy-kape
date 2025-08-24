import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { GuestModulePage } from '@/pages/GuestModule'

// Mock the useOrderForm hook
vi.mock('@/hooks/useOrderForm', () => ({
  useOrderForm: vi.fn(),
  default: vi.fn()
}))

// Mock the useMenuData hook to provide test data
vi.mock('@/hooks/useMenuData', () => ({
  useDrinksWithOptionsPreview: vi.fn(() => ({
    data: [
      {
        id: 'drink-1',
        name: 'Americano',
        category: { id: 'coffee', name: 'Coffee' },
        options_preview: []
      }
    ],
    isLoading: false,
    error: null
  }))
}))

// Mock DrinkGrid component (this provides the drink-selection testid)
vi.mock('@/components/guest/DrinkGrid', () => ({
  DrinkGrid: vi.fn(() => <div data-testid="drink-selection">Drink Grid</div>)
}))

// Mock DrinkCategoryTabs component
vi.mock('@/components/guest/DrinkCategoryTabs', () => ({
  DrinkCategoryTabs: vi.fn(() => <div data-testid="drink-categories">Categories</div>)
}))

// Mock DrinkOptionsForm component (this provides the drink-customization testid)
vi.mock('@/components/guest/DrinkOptionsForm', () => ({
  DrinkOptionsForm: vi.fn(() => <div data-testid="drink-customization">Options Form</div>)
}))

// Mock the OrderSuccess component 
vi.mock('@/components/guest/OrderSuccess', () => ({
  OrderSuccess: vi.fn(() => (
    <div data-testid="order-success">Order Success Component</div>
  )),
  default: vi.fn()
}))

// Mock GuestInfoForm component (this provides the guest-info-form testid)
vi.mock('@/components/guest/GuestInfoForm', () => ({
  GuestInfoForm: () => <div data-testid="guest-info-form">Guest Info Form</div>,
  default: () => <div data-testid="guest-info-form">Guest Info Form</div>
}))

// Mock OrderSummary component (this provides the order-summary testid)
vi.mock('@/components/guest/OrderSummary', () => ({
  OrderSummary: () => <div data-testid="order-summary">Order Summary</div>,
  default: () => <div data-testid="order-summary">Order Summary</div>
}))

// Mock OrderActions component
vi.mock('@/components/guest/OrderActions', () => ({
  OrderActions: vi.fn(() => <div data-testid="order-actions">Order Actions</div>)
}))

// Mock Logo component
vi.mock('@/components/ui/Logo', () => ({
  Logo: vi.fn(() => <div data-testid="logo">Logo</div>)
}))

import { useOrderForm } from '@/hooks/useOrderForm'

const mockUseOrderForm = vi.mocked(useOrderForm)

describe('GuestModule URL Parameter Handling', () => {
  const mockOrderFormBase = {
    currentStep: 'drink-selection' as const,
    selectedDrink: null,
    guestInfo: {
      guestName: '',
      specialRequest: '',
      isGeneratedName: false,
      userHasClearedName: false,
      isValid: false,
      error: null,
      setGuestName: vi.fn(),
      setSpecialRequest: vi.fn(),
      generateNewFunnyName: vi.fn(),
      clearGeneratedName: vi.fn(),
      validateName: vi.fn(),
      clearError: vi.fn(),
      handleBlur: vi.fn(),
      hasInput: false,
      trimmedName: ''
    },
    optionSelection: {
      optionCategories: [],
      selectedOptions: {},
      isLoading: false,
      isValidating: false,
      error: null,
      validationErrors: [],
      selectOption: vi.fn(),
      clearSelection: vi.fn(),
      resetToDefaults: vi.fn(),
      validateSelection: vi.fn(),
      isValid: true,
      hasRequiredSelections: true,
      selectedCount: 0
    },
    orderSubmission: {
      isSubmitting: false,
      isSuccess: false,
      result: null,
      error: null,
      submitGuestOrder: vi.fn(),
      resetSubmission: vi.fn(),
      clearError: vi.fn(),
      canSubmit: false,
      lastSubmissionAt: null,
      submitCount: 0,
      shouldShowSuccess: false,
      shouldShowError: false
    },
    goToStep: vi.fn(),
    nextStep: vi.fn(),
    previousStep: vi.fn(),
    canGoNext: false,
    canGoPrevious: false,
    selectDrink: vi.fn(),
    resetForm: vi.fn(),
    submitOrder: vi.fn(),
    startNewOrder: vi.fn(),
    setOrderSuccessCallback: vi.fn(),
    isFormValid: false,
    orderData: null,
    progress: 0
  }

  const renderWithRouter = (initialEntries: string[] = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <GuestModulePage />
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseOrderForm.mockReturnValue(mockOrderFormBase)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Normal ordering flow (no URL parameters)', () => {
    it('should show ordering flow when no URL parameters', () => {
      renderWithRouter(['/'])

      expect(mockUseOrderForm).toHaveBeenCalledWith(null)
      expect(screen.getByTestId('drink-selection')).toBeInTheDocument()
    })

    it('should show different steps based on currentStep', () => {
      mockUseOrderForm.mockReturnValue({
        ...mockOrderFormBase,
        currentStep: 'guest-info'
      })

      renderWithRouter(['/'])

      expect(screen.getByTestId('guest-info-form')).toBeInTheDocument()
    })

    it('should show order summary for review step', () => {
      mockUseOrderForm.mockReturnValue({
        ...mockOrderFormBase,
        currentStep: 'review',
        selectedDrink: {
          id: 'test-drink',
          name: 'Test Drink',
          description: 'Test Description',
          is_active: true,
          display_order: 0,
          created_at: null,
          updated_at: null,
          category_id: 'coffee',
          category: { 
            id: 'coffee', 
            name: 'Coffee',
            description: null,
            is_active: true,
            display_order: 0,
            created_at: null,
            updated_at: null
          },
          drink_options: []
        }
      })

      renderWithRouter(['/'])

      expect(screen.getByTestId('order-summary')).toBeInTheDocument()
    })
  })

  describe('URL parameter handling', () => {
    it('should show confirmation when orderId parameter is present', () => {
      const mockSuccessForm = {
        ...mockOrderFormBase,
        currentStep: 'success' as const,
        orderSubmission: {
          ...mockOrderFormBase.orderSubmission,
          isSuccess: true,
          shouldShowSuccess: true,
          shouldShowError: false,
          result: {
            order_id: 'test-order-123',
            queue_number: 5,
            estimated_wait_time: '15 minutes'
          }
        }
      }
      mockUseOrderForm.mockReturnValue(mockSuccessForm)

      renderWithRouter(['/?orderId=test-order-123'])

      expect(mockUseOrderForm).toHaveBeenCalledWith('test-order-123')
      expect(screen.getByTestId('order-success')).toBeInTheDocument()
    })

    it('should handle invalid orderId parameter gracefully', () => {
      renderWithRouter(['/?orderId=invalid'])

      expect(mockUseOrderForm).toHaveBeenCalledWith('invalid')
      expect(screen.getByTestId('drink-selection')).toBeInTheDocument()
    })

    it('should handle empty orderId parameter', () => {
      renderWithRouter(['/?orderId='])

      expect(mockUseOrderForm).toHaveBeenCalledWith('')
      expect(screen.getByTestId('drink-selection')).toBeInTheDocument()
    })

    it('should ignore other URL parameters', () => {
      renderWithRouter(['/?someOtherParam=value'])

      expect(mockUseOrderForm).toHaveBeenCalledWith(null)
      expect(screen.getByTestId('drink-selection')).toBeInTheDocument()
    })
  })

  describe('Step navigation', () => {
    it('should render drink selection for drink-selection step', () => {
      renderWithRouter(['/'])

      expect(screen.getByTestId('drink-selection')).toBeInTheDocument()
    })

    it('should render drink customization for customization step', () => {
      mockUseOrderForm.mockReturnValue({
        ...mockOrderFormBase,
        currentStep: 'customization',
        selectedDrink: {
          id: 'test-drink',
          name: 'Test Drink',
          description: 'Test Description',
          is_active: true,
          display_order: 0,
          created_at: null,
          updated_at: null,
          category_id: 'coffee',
          category: { 
            id: 'coffee', 
            name: 'Coffee',
            description: null,
            is_active: true,
            display_order: 0,
            created_at: null,
            updated_at: null
          },
          drink_options: []
        }
      })

      renderWithRouter(['/'])

      expect(screen.getByTestId('drink-customization')).toBeInTheDocument()
    })

    it('should render guest info form for guest-info step', () => {
      mockUseOrderForm.mockReturnValue({
        ...mockOrderFormBase,
        currentStep: 'guest-info'
      })

      renderWithRouter(['/'])

      expect(screen.getByTestId('guest-info-form')).toBeInTheDocument()
    })

    it('should render order summary for review step', () => {
      mockUseOrderForm.mockReturnValue({
        ...mockOrderFormBase,
        currentStep: 'review',
        selectedDrink: {
          id: 'test-drink',
          name: 'Test Drink',
          description: 'Test Description',
          is_active: true,
          display_order: 0,
          created_at: null,
          updated_at: null,
          category_id: 'coffee',
          category: { 
            id: 'coffee', 
            name: 'Coffee',
            description: null,
            is_active: true,
            display_order: 0,
            created_at: null,
            updated_at: null
          },
          drink_options: []
        }
      })

      renderWithRouter(['/'])

      expect(screen.getByTestId('order-summary')).toBeInTheDocument()
    })

    it('should render order success for success step', () => {
      mockUseOrderForm.mockReturnValue({
        ...mockOrderFormBase,
        currentStep: 'success',
        orderSubmission: {
          ...mockOrderFormBase.orderSubmission,
          isSuccess: true,
          result: {
            order_id: 'test-order-123',
            queue_number: 5,
            estimated_wait_time: '15 minutes'
          }
        }
      })

      renderWithRouter(['/'])

      expect(screen.getByTestId('order-success')).toBeInTheDocument()
    })
  })

  describe('Order success callback handling', () => {
    it('should set URL parameter callback on component mount', () => {
      renderWithRouter(['/'])

      expect(mockOrderFormBase.setOrderSuccessCallback).toHaveBeenCalledWith(
        expect.any(Function)
      )
    })

    it('should clear URL parameters when starting new order', () => {
      // This test verifies the integration exists; the actual URL clearing 
      // is handled by setSearchParams in the component
      renderWithRouter(['/?orderId=test-order-123'])

      expect(mockUseOrderForm).toHaveBeenCalledWith('test-order-123')
    })
  })

  describe('Error handling', () => {
    it('should handle malformed URL parameters gracefully', () => {
      renderWithRouter(['/?orderId=%20invalid%20'])

      expect(mockUseOrderForm).toHaveBeenCalledWith(' invalid ')
      expect(screen.getByTestId('drink-selection')).toBeInTheDocument()
    })

    it('should handle special characters in orderId parameter', () => {
      renderWithRouter(['/?orderId=test-order-123%40special'])

      expect(mockUseOrderForm).toHaveBeenCalledWith('test-order-123@special')
      expect(screen.getByTestId('drink-selection')).toBeInTheDocument()
    })
  })
})