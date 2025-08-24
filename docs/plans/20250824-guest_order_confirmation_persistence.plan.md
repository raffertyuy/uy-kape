---
description: "Implementation plan for persisting guest order confirmation page on browser refresh"
created-date: 2025-08-24
---

# Implementation Plan for Guest Order Confirmation Persistence

## OBJECTIVE

Fix the guest order confirmation page so that when a guest refreshes the browser (F5), they stay on the order confirmation page with updated queue number and estimated wait time, instead of being redirected back to the ordering flow.

**Current behavior**: When a guest submits an order and reaches the confirmation page, pressing F5 redirects them back to the ordering page.

**Expected behavior**: When a guest refreshes the confirmation page, they should see the updated queue number and estimated wait time for their submitted order.

**Root cause**: The order confirmation state is managed with local component state (`currentStep` in `useOrderForm`) without URL persistence, causing the state to reset on page refresh.

## IMPLEMENTATION PLAN

- [ ] Step 1: Add URL Parameter Support to Guest Module
  - **Task**: Implement URL search parameters to preserve order confirmation state across browser refreshes
  - **Files**:
    - `src/pages/GuestModule.tsx`: Add URL parameter handling for order confirmation state
    - `src/hooks/useOrderForm.ts`: Update form state management to use URL parameters for success step
  - **Dependencies**: React Router DOM `useSearchParams` hook
  - **Changes**:
    - Import `useSearchParams` from `react-router-dom` in GuestModule
    - Add logic to read order ID from URL parameter `orderId` (e.g., `/order?orderId=abc123`)
    - Update order submission flow to set URL parameter when order is successful
    - Add handling for invalid or missing order ID parameters
    - Ensure proper clearing of URL parameters when starting new order
  - **Pseudocode**:

    ```typescript
    import { useSearchParams } from 'react-router-dom'
    
    function GuestModulePage() {
      const [searchParams, setSearchParams] = useSearchParams()
      const orderIdParam = searchParams.get('orderId')
      
      // If there's an orderId parameter, we should be in confirmation mode
      const shouldShowConfirmation = orderIdParam !== null
      
      // Update order form to handle URL-based confirmation
      const orderForm = useOrderForm(orderIdParam)
      
      // Handle order submission success - set URL parameter
      const handleOrderSuccess = (result: OrderSubmissionResult) => {
        setSearchParams({ orderId: result.order_id })
      }
      
      // Handle starting new order - clear URL parameters
      const handleNewOrder = () => {
        setSearchParams({})
        orderForm.startNewOrder()
      }
    }
    ```
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 2: Create Order Confirmation Hook
  - **Task**: Create a specialized hook to manage order confirmation state and real-time updates
  - **Files**:
    - `src/hooks/useOrderConfirmation.ts`: New hook for order confirmation functionality
  - **Dependencies**: Step 1, existing useQueueStatus hook
  - **Changes**:
    - Create hook that fetches order details from order ID
    - Integrate with existing `useQueueStatus` hook for real-time updates
    - Handle order not found scenarios
    - Provide refresh functionality for queue position and wait time
    - Handle order status changes (if order is completed, cancelled, etc.)
  - **Pseudocode**:
    ```typescript
    interface UseOrderConfirmationReturn {
      orderResult: OrderSubmissionResult | null
      queueStatus: QueueStatusData | null
      guestName: string | null
      specialRequest: string | null
      isLoading: boolean
      error: OrderServiceError | null
      refreshStatus: () => Promise<void>
    }
    
    export function useOrderConfirmation(orderId: string | null): UseOrderConfirmationReturn {
      // Fetch order details from order ID
      // Use existing useQueueStatus for real-time updates
      // Handle error states (order not found, etc.)
      // Provide manual refresh capability
    }
    ```
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 3: Update Order Success Component
  - **Task**: Enhance OrderSuccess component to support URL-based confirmation with real-time updates
  - **Files**:
    - `src/components/guest/OrderSuccess.tsx`: Update to handle URL-based confirmation state
  - **Dependencies**: Step 2 (useOrderConfirmation hook)
  - **Changes**:
    - Add support for URL-based order confirmation mode
    - Integrate with new useOrderConfirmation hook for real-time updates
    - Add refresh button for manual queue status updates
    - Display current queue position and estimated wait time with auto-refresh
    - Handle edge cases (order not found, expired orders, etc.)
    - Maintain existing functionality for in-flow order success
  - **Pseudocode**:
    ```typescript
    interface OrderSuccessProps {
      // Existing props for in-flow success
      result?: OrderSubmissionResult
      guestName?: string
      specialRequest?: string
      onCreateNewOrder: () => void
      
      // New props for URL-based confirmation
      orderId?: string | null
      isUrlBasedConfirmation?: boolean
    }
    
    export const OrderSuccess = memo<OrderSuccessProps>(function OrderSuccess(props) {
      if (props.isUrlBasedConfirmation && props.orderId) {
        // Use useOrderConfirmation hook for URL-based mode
        const confirmation = useOrderConfirmation(props.orderId)
        
        // Render with real-time data from confirmation hook
        // Include refresh button for manual updates
        // Handle loading and error states
      } else {
        // Existing in-flow success rendering
      }
    })
    ```
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 4: Update Order Form Hook Integration
  - **Task**: Modify useOrderForm hook to work with URL parameter-based confirmation state
  - **Files**:
    - `src/hooks/useOrderForm.ts`: Update to support URL-based confirmation mode
  - **Dependencies**: Step 1-3
  - **Changes**:
    - Add optional orderId parameter to useOrderForm hook
    - Update currentStep logic to handle URL-based confirmation state
    - Modify submitOrder function to integrate with URL parameter setting
    - Update startNewOrder to clear URL parameters properly
    - Ensure proper state management between in-flow and URL-based modes
  - **Pseudocode**:
    ```typescript
    export function useOrderForm(orderIdFromUrl?: string | null): UseOrderFormReturn {
      // If orderIdFromUrl is provided, initialize in confirmation mode
      const [currentStep, setCurrentStep] = useState<OrderFormStep>(
        orderIdFromUrl ? 'success' : 'drink-selection'
      )
      
      // Update submitOrder to work with URL parameter callback
      const submitOrder = useCallback(async (onSuccess?: (result: OrderSubmissionResult) => void): Promise<boolean> => {
        // Existing submission logic...
        if (success && onSuccess) {
          onSuccess(result)
        }
        return success
      }, [...])
      
      // Handle URL-based confirmation
      const orderConfirmation = orderIdFromUrl ? useOrderConfirmation(orderIdFromUrl) : null
    }
    ```
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 5: Manual Testing and Validation
  - **Task**: Manually test the order confirmation persistence functionality
  - **Files**: N/A (manual testing)
  - **Dependencies**: Previous steps completion and running application
  - **Changes**:
    - Navigate to guest ordering flow and submit a complete order
    - Verify that order confirmation page shows with correct queue number and wait time
    - Press F5 to refresh the page and verify it stays on confirmation page
    - Verify that queue number and wait time update correctly after refresh
    - Test direct navigation to order confirmation URL (e.g., `/order?orderId=abc123`)
    - Test with invalid order ID and verify graceful error handling
    - Test starting new order from confirmation page clears URL parameters
  - **Expected Outcomes**:
    - `/order` shows normal ordering flow
    - `/order?orderId=validId` shows order confirmation with current status
    - Browser refresh on confirmation page preserves confirmation view with updated data
    - Invalid order IDs show appropriate error message with option to start new order
    - New order button properly clears URL parameters and returns to ordering flow
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 6: Write Unit Tests
  - **Task**: Create comprehensive unit tests for the guest order confirmation persistence functionality
  - **Files**:
    - `src/hooks/__tests__/useOrderConfirmation.test.ts`: Tests for order confirmation hook
    - `src/pages/__tests__/GuestModule.test.tsx`: Update tests for URL parameter handling
    - `src/components/guest/__tests__/OrderSuccess.test.tsx`: Update tests for URL-based confirmation
  - **Dependencies**: Previous steps completion
  - **Changes**:
    - Test useOrderConfirmation hook with valid and invalid order IDs
    - Test URL parameter handling in GuestModule component
    - Test OrderSuccess component in both in-flow and URL-based confirmation modes
    - Test queue status refresh functionality
    - Test error handling for order not found scenarios
    - Test URL parameter clearing when starting new orders
  - **Pseudocode**:
    ```typescript
    describe('useOrderConfirmation', () => {
      it('should fetch order details for valid order ID')
      it('should handle order not found error')
      it('should provide real-time queue status updates')
      it('should refresh queue status on demand')
    })
    
    describe('GuestModule URL Parameter Handling', () => {
      it('should show ordering flow when no URL parameters')
      it('should show confirmation when orderId parameter is present')
      it('should handle invalid orderId parameter gracefully')
      it('should clear URL parameters when starting new order')
    })
    
    describe('OrderSuccess URL-based Confirmation', () => {
      it('should display order confirmation from URL parameter')
      it('should refresh queue status when refresh button is clicked')
      it('should handle order not found scenarios')
    })
    ```
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 7: Run All Tests
  - **Task**: Execute full test suite to ensure no regressions from order confirmation persistence changes
  - **Files**: None (test execution)
  - **Dependencies**: Previous steps completion
  - **Changes**:
    - Run unit tests: `npm run test:run`
    - Run linting: `npm run lint`
    - Run build verification: `npm run build`
  - **Expected Outcomes**:
    - All existing unit tests continue to pass
    - New unit tests for order confirmation persistence pass
    - No TypeScript compilation errors
    - No ESLint errors or warnings
    - Application builds successfully
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 8: Definition of Done Compliance Check
  - **Task**: Verify implementation meets all Definition of Done criteria
  - **Files**: Review all modified files against definition of done criteria
  - **Dependencies**: Previous steps completion
  - **Changes**:
    - Verify TypeScript compilation succeeds with no errors
    - Verify all unit tests pass with new functionality covered
    - Verify manual testing confirms expected behavior
    - Verify code follows project coding standards
    - Verify accessibility requirements are met
    - Verify mobile responsiveness is maintained
    - Verify no breaking changes to existing functionality
  - **Expected Outcomes**:
    - Full compliance with Definition of Done requirements
    - Ready for production deployment
    - User experience improved with order confirmation persistence
    - No regressions in existing functionality
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

## TECHNICAL NOTES

### Implementation Approach

- Use React Router's `useSearchParams` hook for URL parameter management (similar to Barista Module solution)
- Create specialized hook for order confirmation state management with real-time updates
- Maintain existing OrderSuccess component functionality for in-flow order success
- Add URL-based confirmation mode to OrderSuccess component for refresh scenarios

### URL Parameter Schema

- No parameter: Normal ordering flow
- `orderId=<order_id>`: Order confirmation view with real-time status

### Error Handling

- Invalid order IDs gracefully show error message with option to start new order
- Order not found scenarios provide clear feedback to users
- Network errors during status refresh provide retry options

### Real-time Updates

- Integrate with existing `useQueueStatus` hook for automatic queue position updates
- Provide manual refresh button for immediate status updates
- Handle order status changes (completed, cancelled, etc.)

### Performance Considerations

- URL parameter changes trigger minimal re-renders
- Order confirmation data is fetched only when needed
- Real-time subscriptions work efficiently with order confirmation view

## VALIDATION STEPS

After implementation, verify the following behaviors:

1. **Normal Flow**: Order submission leads to confirmation page with queue number and wait time
2. **Refresh Persistence**: Pressing F5 on confirmation page refreshes and stays on confirmation page
3. **Updated Data**: After refresh, queue number and wait time reflect current status
4. **Direct Navigation**: Direct navigation to `/order?orderId=validId` shows confirmation page
5. **Invalid Order ID**: Navigation to `/order?orderId=invalid` shows error with new order option
6. **New Order Flow**: Starting new order from confirmation properly clears URL parameters
7. **Real-time Updates**: Queue status automatically updates while on confirmation page
8. **Mobile Responsiveness**: Confirmation persistence works correctly on mobile devices

## RISK ASSESSMENT

**Risk Level**: Low

**Potential Issues**:

- URL parameters might be visible to users (acceptable for order confirmation)
- Order IDs in URLs could be shared (consider security implications)
- Browser history will include order confirmation URLs

**Mitigation**:

- Order IDs provide limited sensitive information exposure
- Implement proper order ID validation and error handling
- Consider order expiration for security (existing functionality)
- Maintain existing order cancellation and privacy controls

## DEPENDENCIES

- React Router DOM `useSearchParams` hook (already installed)
- Existing `useQueueStatus` hook for real-time updates
- Existing `orderService` for order details fetching
- No additional npm packages required

## EXPECTED OUTCOMES

- Browser refresh preserves guest order confirmation page state
- Queue number and estimated wait time update correctly after refresh
- Real-time updates continue to work on confirmation page
- Direct linking to order confirmation works correctly
- All existing guest ordering functionality remains unchanged
- Improved user experience for guests checking their order status
