---
description: "Implementation plan for Guest Module - Coffee Ordering Interface"
created-date: 2025-08-21
---

# Implementation Plan for Guest Module

This plan implements the guest-facing coffee ordering interface based on the initial idea specification and compatible with the established database schema.

## Context Review

Based on the analysis:

- Password protection and routing already implemented
- Database schema supports complex drink options through `drink_options`, `option_categories`, and `option_values` tables
- Existing services (`menuService`) provide data access patterns
- TypeScript-first approach with strict typing requirements
- Mobile-responsive design with coffee theme and accessibility considerations

## Implementation Steps

- [x] **Step 1: Create Order Management Types and Services**
  - **Task**: Define TypeScript interfaces for order operations and create order service for guest submissions
  - **Files**:
    - `src/types/order.types.ts`: Order-specific TypeScript interfaces and enums for guest module
    - `src/services/orderService.ts`: Service layer for order operations (create, get queue position)
  - **Dependencies**: Existing database types, Supabase client
  - **Implementation Details**:

    ```typescript
    // Order form interfaces
    interface GuestOrderForm {
      guest_name: string
      drink_id: string
      selected_options: Record<string, string> // option_category_id -> option_value_id
    }
    
    interface OrderSubmissionResult {
      order_id: string
      queue_number: number
      estimated_wait_time?: string
    }
    
    // Order service methods
    const orderService = {
      submitOrder: async (orderData: GuestOrderForm) => Promise<OrderSubmissionResult>
      getQueuePosition: async (orderId: string) => Promise<number>
      cancelOrder: async (orderId: string) => Promise<void>
    }
    ```

- [x] **Step 2: Create Drink Selection Components**
  - **Task**: Build reusable components for displaying drinks organized by categories with proper TypeScript typing
  - **Files**:
    - `src/components/guest/DrinkCategoryTabs.tsx`: Category navigation with active state management
    - `src/components/guest/DrinkCard.tsx`: Individual drink display with options preview
    - `src/components/guest/DrinkGrid.tsx`: Responsive grid layout for drinks within category
  - **Dependencies**: Menu data hooks, UI components (Button, Card), Tailwind classes
  - **Implementation Details**:

    ```typescript
    interface DrinkCardProps {
      drink: DrinkWithOptionsPreview
      isSelected: boolean
      onSelect: (drinkId: string) => void
      className?: string
    }
    
    // Responsive grid with coffee theme styling
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {drinks.map(drink => (
        <DrinkCard 
          key={drink.id}
          drink={drink}
          isSelected={selectedDrinkId === drink.id}
          onSelect={handleDrinkSelect}
        />
      ))}
    </div>
    ```

- [x] **Step 3: Create Dynamic Options Selection Components**
  - **Task**: Build components for drink options selection based on database schema (option_categories and option_values)
  - **Files**:
    - `src/components/guest/OptionCategory.tsx`: Single option category with values (radio/select)
    - `src/components/guest/DrinkOptionsForm.tsx`: Complete options form for selected drink
    - `src/services/optionService.ts`: Service for fetching option values and validation
    - `src/hooks/useOptionSelection.ts`: Hook for managing option selection state
  - **Dependencies**: Menu data hooks, form validation, UI components
  - **Implementation Details**:

    ```typescript
    interface OptionCategoryProps {
      category: OptionCategoryWithValues
      selectedValue?: string
      onValueChange: (categoryId: string, valueId: string) => void
      isRequired: boolean
    }
    
    // Radio group for single selection options
    <div className="space-y-2">
      <Label className="text-coffee-700 font-medium">
        {category.name} {isRequired && <span className="text-red-500">*</span>}
      </Label>
      {category.option_values.map(value => (
        <RadioButton
          key={value.id}
          name={category.id}
          value={value.id}
          checked={selectedValue === value.id}
          onChange={() => onValueChange(category.id, value.id)}
        >
          {value.name}
        </RadioButton>
      ))}
    </div>
    ```

- [x] **Step 4: Create Guest Information and Order Summary Components**
  - **Task**: Build guest name input and order summary components with validation
  - **Files**:
    - `src/components/guest/GuestInfoForm.tsx`: Name input with validation and accessibility
    - `src/components/guest/OrderSummary.tsx`: Complete order summary with drink and options
    - `src/hooks/useGuestInfo.ts`: Hook for managing guest information state and validation
  - **Dependencies**: Form validation, UI components, accessibility
  - **Implementation Details**:

    ```typescript
    interface GuestInfoFormProps {
      guestName: string
      onNameChange: (name: string) => void
      error?: string
    }
    
    // Accessible form with proper labeling
    <div className="space-y-4">
      <Label htmlFor="guest-name" className="text-coffee-700 font-medium">
        Your Name <span className="text-red-500">*</span>
      </Label>
      <Input
        id="guest-name"
        type="text"
        value={guestName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Enter your name"
        required
        aria-describedby={error ? "name-error" : undefined}
      />
      {error && (
        <p id="name-error" className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
    ```

- [x] **Step 5: Create Order Submission and Actions Components**
  - **Task**: Build order submission, actions, and success confirmation components
  - **Files**:
    - `src/components/guest/OrderActions.tsx`: Submit, reset, and cancel action buttons with loading states
    - `src/components/guest/OrderSuccess.tsx`: Success confirmation with order details and queue number
    - `src/hooks/useOrderSubmission.ts`: Hook for managing order submission state
  - **Dependencies**: Order service, loading states, accessibility, UI components
  - **Implementation Details**:

    ```typescript
    interface OrderConfirmationProps {
      order: {
        id: string
        guest_name: string
        drink_name: string
        queue_number: number
        selected_options: string[]
      }
      onStartNewOrder: () => void
      onCancelOrder: (orderId: string) => Promise<void>
    }
    
    // Success state with clear visual hierarchy
    <div className="text-center space-y-6">
      <div className="text-6xl">✅</div>
      <h3 className="text-2xl font-bold text-coffee-800">
        Thank you, {order.guest_name}!
      </h3>
      <div className="bg-coffee-50 p-4 rounded-lg">
        <p className="text-coffee-700">Your order has been placed</p>
        <p className="text-lg font-semibold text-coffee-800">
          Queue Position: #{order.queue_number}
        </p>
      </div>
    </div>
    ```

- [x] **Step 6: Implement Custom Hooks for Guest Module**
  - **Task**: Create custom hooks for order form state management and queue status
  - **Files**:
    - `src/hooks/useOrderForm.ts`: Complete ordering flow state management with step navigation
    - `src/hooks/useQueueStatus.ts`: Real-time queue position updates via Supabase
  - **Dependencies**: Order service, Supabase real-time, validation utilities, existing hooks
  - **Implementation Details**:

    ```typescript
    interface UseOrderFormReturn {
      // Form state
      guestName: string
      selectedDrinkId: string | null
      selectedOptions: Record<string, string>
      
      // Form actions
      setGuestName: (name: string) => void
      selectDrink: (drinkId: string) => void
      setOption: (categoryId: string, valueId: string) => void
      
      // Validation
      errors: Record<string, string>
      isValid: boolean
      
      // Submission
      submitOrder: () => Promise<void>
      isSubmitting: boolean
    }
    
    export const useOrderForm = (): UseOrderFormReturn => {
      // State management with proper TypeScript typing
      // Form validation logic
      // Order submission with error handling
    }
    ```

- [x] **Step 7: Update Main Guest Module Page**
  - **Task**: Replace placeholder content with complete ordering interface
  - **Files**:
    - `src/pages/GuestModule.tsx`: Main guest ordering page with state management and step-based navigation
  - **Dependencies**: All guest components, custom hooks, layout components, menu data hooks
  - **Status**: ✅ **COMPLETED** - Full guest ordering interface implemented with step-based navigation
  - **Implementation Details**:

    ```typescript
    function GuestModulePage() {
      const {
        guestName, selectedDrinkId, selectedOptions,
        setGuestName, selectDrink, setOption,
        errors, isValid, submitOrder, isSubmitting
      } = useOrderForm()
      
      const [orderStatus, setOrderStatus] = useState<'form' | 'confirmation'>('form')
      const [confirmedOrder, setConfirmedOrder] = useState<OrderSubmissionResult | null>(null)
      
      const handleOrderSubmit = async () => {
        try {
          const result = await submitOrder()
          setConfirmedOrder(result)
          setOrderStatus('confirmation')
        } catch (error) {
          // Error handling with toast notifications
        }
      }
      
      if (orderStatus === 'confirmation' && confirmedOrder) {
        return <OrderConfirmation order={confirmedOrder} onStartNewOrder={() => setOrderStatus('form')} />
      }
      
      return (
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <DrinkCategoryTabs />
          <DrinkGrid onDrinkSelect={selectDrink} selectedDrinkId={selectedDrinkId} />
          {selectedDrinkId && (
            <DrinkOptionsPanel drinkId={selectedDrinkId} onOptionChange={setOption} />
          )}
          <GuestInfoForm guestName={guestName} onNameChange={setGuestName} />
          <OrderSummary />
          <OrderActions onSubmit={handleOrderSubmit} isValid={isValid} isSubmitting={isSubmitting} />
        </div>
      )
    }
    ```

- [x] **Step 7.1: Debug and Fix Critical Step Progression Bug**
  - **Task**: Identify and fix bug where drink selection didn't advance to next step
  - **Files**:
    - `src/hooks/useOrderForm.ts`: Fixed step progression logic for drinks without options
    - `src/pages/GuestModule.tsx`: Fixed data loading issue with useDrinksWithOptionsPreview hook
  - **Status**: ✅ **COMPLETED** - Critical bug fixed and tested working
  - **Bug Details**:
    - **Root Cause 1**: `useDrinksWithOptionsPreview(null)` returned empty array instead of all drinks
    - **Root Cause 2**: Step validation logic checking wrong data structure for drink options
    - **Solution 1**: Changed to `useDrinksWithOptionsPreview()` to load all drinks
    - **Solution 2**: Fixed `isStepValid` and `nextStep` to check `drink.drink_options` directly
  - **Testing Results**:
    - ✅ Drinks without options (Yakult, Ribena, Affogato) automatically progress to guest info step
    - ✅ Drinks with options (Cappuccino, Espresso) progress to customization step
    - ✅ Step progression working seamlessly across all drink types

- [ ] **Step 8: Add Loading and Error States**
  - **Task**: Implement comprehensive loading states and error handling throughout guest module
  - **Files**:
    - `src/components/guest/LoadingStates.tsx`: Skeleton loaders and spinners for guest module
    - `src/components/guest/ErrorStates.tsx`: Error display components with retry actions
    - `src/components/ui/Skeleton.tsx`: Reusable skeleton component for loading states
  - **Dependencies**: UI components, error boundaries
  - **Implementation Details**:

    ```typescript
    // Loading skeleton for drink cards
    function DrinkCardSkeleton() {
      return (
        <div className="border border-coffee-200 rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-coffee-200 rounded mb-2"></div>
          <div className="h-3 bg-coffee-100 rounded mb-1"></div>
          <div className="h-3 bg-coffee-100 rounded w-3/4"></div>
        </div>
      )
    }
    
    // Error state with retry option
    function MenuLoadError({ onRetry }: { onRetry: () => void }) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">😕</div>
          <h3 className="text-lg font-semibold text-coffee-700 mb-2">
            Unable to load menu
          </h3>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </div>
      )
    }
    ```

- [ ] **Step 9: Build and Test Guest Module**
  - **Task**: Ensure the guest module builds successfully and integrates with existing app
  - **Files**: All guest module files
  - **Dependencies**: Development environment, Vite build system
  - **User Intervention**:
    - Run `npm run build` to verify no TypeScript errors
    - Run `npm run dev` to test the interface manually
    - Test password protection flow works correctly
    - Verify Supabase connection and data loading

- [ ] **Step 10: Write Unit Tests for Guest Components**
  - **Task**: Create comprehensive unit tests for all guest module components and hooks
  - **Files**:
    - `src/components/guest/__tests__/DrinkCard.test.tsx`: Test drink card component behavior
    - `src/components/guest/__tests__/DrinkOptionsPanel.test.tsx`: Test options selection logic
    - `src/components/guest/__tests__/OrderSummary.test.tsx`: Test order summary display
    - `src/hooks/__tests__/useOrderForm.test.ts`: Test order form state management
    - `src/hooks/__tests__/useQueueStatus.test.ts`: Test queue status updates
    - `src/services/__tests__/orderService.test.ts`: Test order service operations
  - **Dependencies**: Vitest, React Testing Library, Supabase mocks
  - **Implementation Details**:

    ```typescript
    describe('DrinkCard', () => {
      it('should display drink information correctly', () => {
        render(<DrinkCard drink={mockDrink} isSelected={false} onSelect={mockOnSelect} />)
        expect(screen.getByText(mockDrink.name)).toBeInTheDocument()
        expect(screen.getByText(mockDrink.description)).toBeInTheDocument()
      })
      
      it('should call onSelect when clicked', () => {
        const mockOnSelect = vi.fn()
        render(<DrinkCard drink={mockDrink} isSelected={false} onSelect={mockOnSelect} />)
        fireEvent.click(screen.getByRole('button'))
        expect(mockOnSelect).toHaveBeenCalledWith(mockDrink.id)
      })
      
      it('should show selected state correctly', () => {
        render(<DrinkCard drink={mockDrink} isSelected={true} onSelect={mockOnSelect} />)
        expect(screen.getByRole('button')).toHaveClass('border-coffee-500')
      })
    })
    ```

- [ ] **Step 11: Write Playwright UI Tests for Guest Flow**
  - **Task**: Create end-to-end tests for the complete guest ordering process
  - **Files**:
    - `playwright-tests/guest-ordering.spec.ts`: Complete ordering flow tests
  - **Dependencies**: Playwright, test database setup
  - **Implementation Details**:

    ```typescript
    test.describe('Guest Ordering Flow', () => {
      test('should complete full ordering process', async ({ page }) => {
        // Navigate to guest module
        await page.goto('/order')
        
        // Enter password
        await page.fill('[data-testid="password-input"]', 'guest123')
        await page.click('[data-testid="password-submit"]')
        
        // Select drink category
        await page.click('[data-testid="category-coffee"]')
        
        // Select drink
        await page.click('[data-testid="drink-latte"]')
        
        // Configure options
        await page.click('[data-testid="option-single-shot"]')
        await page.click('[data-testid="option-oat-milk"]')
        
        // Enter guest name
        await page.fill('[data-testid="guest-name"]', 'Test User')
        
        // Submit order
        await page.click('[data-testid="submit-order"]')
        
        // Verify confirmation
        await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible()
        await expect(page.locator('[data-testid="queue-number"]')).toContainText('#')
      })
      
      test('should handle validation errors', async ({ page }) => {
        // Test form validation and error states
      })
      
      test('should handle order cancellation', async ({ page }) => {
        // Test order cancellation flow
      })
    })
    ```

- [ ] **Step 12: Run All Tests and Validate**
  - **Task**: Execute all unit and UI tests to ensure guest module works correctly
  - **Files**: All test files
  - **Dependencies**: Test environment setup
  - **User Intervention**:
    - Run `npm run test` for unit tests
    - Run `npm run test:ui` for Playwright tests
    - Verify 100% of tests pass
    - Check test coverage meets minimum 80% requirement

- [ ] **Step 13: Accessibility Review and Enhancement**
  - **Task**: Ensure guest module meets WCAG 2.1 AA accessibility standards
  - **Files**: All guest module components
  - **Dependencies**: Accessibility testing tools, screen reader testing
  - **Implementation Details**:
    - Verify all interactive elements have proper ARIA labels
    - Test keyboard navigation through entire ordering flow
    - Ensure color contrast meets accessibility standards
    - Test with screen reader for proper announcements
    - Add focus management for dynamic content updates
    - Implement proper error announcements with aria-live regions

- [ ] **Step 14: Validate Against Definition of Done**
  - **Task**: Ensure implementation meets all criteria in definition of done document
  - **Files**: All guest module files and documentation
  - **Dependencies**: Definition of done checklist
  - **Validation Points**:
    - [ ] All TypeScript code properly typed with no `any` types
    - [ ] Zero ESLint errors and warnings
    - [ ] Minimum 80% test coverage achieved
    - [ ] Mobile responsive design verified on multiple devices
    - [ ] Real-time Supabase functionality works correctly
    - [ ] Password protection functions properly
    - [ ] All user inputs properly validated and sanitized
    - [ ] Clear error messages and success feedback provided
    - [ ] Performance optimizations implemented (lazy loading, memoization)
    - [ ] Accessibility standards met (WCAG 2.1 AA)
    - [ ] Documentation updated for guest module features

## Validation Steps

1. **Functionality Validation**:
   - Guest can authenticate with password
   - Menu loads correctly from Supabase
   - Drink selection works across categories
   - Options selection reflects database schema
   - Order submission creates proper database records
   - Queue position calculation works correctly
   - Real-time updates function properly

2. **Design Validation**:
   - Mobile-responsive design works on various screen sizes
   - Coffee theme consistent with existing design
   - Loading states provide good user experience
   - Error states are informative and actionable
   - Accessibility features work with assistive technologies

3. **Technical Validation**:
   - TypeScript compilation succeeds without errors
   - All tests pass (unit and integration)
   - Performance metrics meet standards
   - Security best practices followed
   - Database operations are efficient and secure

4. **User Experience Validation**:
   - Ordering flow is intuitive and efficient
   - Visual feedback is clear and immediate
   - Error recovery is straightforward
   - Order confirmation provides necessary information
   - Overall experience is significantly improved from old system

## Notes

- This implementation leverages the existing database schema fully, including complex option relationships
- Uses established patterns from the barista module for consistency
- Prioritizes accessibility and mobile-responsive design
- Implements proper TypeScript typing throughout
- Includes comprehensive testing strategy
- Follows React 19 best practices and modern patterns
- Integrates seamlessly with existing password protection and routing
- Provides foundation for future enhancements (order tracking, favorites, etc.)
