---
description: "Implementation plan for removing 'Ready' order status and adding guest order cancellation"
created-date: 2025-08-23
---

# Implementation Plan for Removing Ready Status and Adding Guest Cancellation

## OBJECTIVE

Remove the "Ready" order status from the system, simplifying the workflow to only use "Pending", "Completed", and "Cancelled". Additionally, add guest order cancellation functionality to the order confirmation page.

**User Stories:**

1. As a barista, when going through the Order Dashboard, I just need to mark drinks as "Completed". I should not need to go through "Ready" before "Complete".
2. As a guest, after submitting an order in the guest module, I should have the option to cancel my order (displayed in the order confirmation page).

## IMPLEMENTATION PLAN

- [ ] Step 1: Update Database Schema and Migration
  - **Task**: Remove "ready" from the order_status enum in the database schema and create migration
  - **Files**:
    - `database/schema.sql`: Update order_status enum to only include 'pending', 'completed', 'cancelled'
    - `supabase/migrations/[timestamp]_remove_ready_status.sql`: Create migration script to safely update existing data
  - **Dependencies**: Direct database access, Supabase CLI
  - **Pseudocode**:

    ```sql
    -- Migration script
    -- 1. Update any existing 'ready' orders to 'pending'
    UPDATE orders SET status = 'pending' WHERE status = 'ready';
    
    -- 2. Drop and recreate the enum without 'ready'
    ALTER TYPE order_status RENAME TO order_status_old;
    CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');
    ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::text::order_status;
    DROP TYPE order_status_old;
    ```

- [ ] Step 2: Update TypeScript Types and Constants
  - **Task**: Update database types and application constants to remove "ready" status
  - **Files**:
    - `src/types/database.types.ts`: Remove "ready" from order_status enum type
    - `src/types/admin.types.ts`: Remove 'mark_ready' operation and update OrderActionType
    - `src/hooks/useQueueStatus.ts`: Remove 'ready' from orderStatus type
    - `src/config/__tests__/app.config.test.ts`: Update test to remove 'ready' from expected statuses
  - **Dependencies**: Step 1 completion
  - **Pseudocode**:

    ```typescript
    // Update enum type
    order_status: "pending" | "completed" | "cancelled"
    
    // Remove mark_ready operation
    operation: 'mark_completed' | 'cancel' | 'delete'
    ```

- [ ] Step 3: Update Order Statistics and Hooks
  - **Task**: Remove references to "ready" status in statistics calculations and hooks
  - **Files**:
    - `src/hooks/useOrderStats.ts`: Remove total_ready from calculations
    - `src/components/admin/OrderStats.tsx`: Remove ready orders from display and calculations
    - `src/services/adminOrderService.ts`: Remove total_ready from statistics
  - **Dependencies**: Step 2 completion
  - **Pseudocode**:

    ```typescript
    // Remove ready from stats calculation
    totalOrders: stats.total_pending + stats.total_completed + stats.total_cancelled
    
    // Remove ready status filtering
    const stats = {
      total_pending: orders.filter(o => o.status === 'pending').length,
      total_completed: orders.filter(o => o.status === 'completed').length,
      total_cancelled: orders.filter(o => o.status === 'cancelled').length,
    }
    ```

- [ ] Step 4: Update Admin Order Management Components
  - **Task**: Remove "Mark Ready" buttons and simplify order status workflow in admin interface
  - **Files**:
    - `src/components/admin/OrderActions.tsx`: Remove 'mark_ready' action, update status transitions
    - `src/components/admin/OrderStatusSelector.tsx`: Remove 'ready' from status options
    - `src/components/admin/BulkOrderActions.tsx`: Update bulk action logic to remove ready status
    - `src/components/admin/OrderDashboard.tsx`: Update order filtering and display logic
  - **Dependencies**: Step 3 completion
  - **Pseudocode**:

    ```typescript
    // Simplified status selector
    const allStatuses: OrderStatus[] = ['pending', 'completed', 'cancelled']
    
    // Direct transition from pending to completed
    const handleMarkCompleted = (orderId: string) => {
      updateOrderStatus(orderId, 'completed')
    }
    ```

- [ ] Step 5: Add Guest Order Cancellation Service
  - **Task**: Enhance order service to support guest-initiated cancellation
  - **Files**:
    - `src/services/orderService.ts`: Add guest cancellation method with validation
    - `src/types/order.types.ts`: Add guest cancellation result type
  - **Dependencies**: Step 4 completion
  - **Pseudocode**:

    ```typescript
    // Guest cancellation service
    cancelGuestOrder: async (orderId: string, guestName: string): Promise<void> => {
      // Validate order exists and belongs to guest
      // Only allow cancellation if status is 'pending'
      // Update status to 'cancelled'
    }
    ```

- [ ] Step 6: Update Guest Order Confirmation Component
  - **Task**: Add order cancellation functionality to the OrderSuccess component
  - **Files**:
    - `src/components/guest/OrderSuccess.tsx`: Add cancel order button and confirmation dialog
    - `src/hooks/useGuestOrderActions.ts`: Create hook for guest order actions (new file)
  - **Dependencies**: Step 5 completion
  - **Pseudocode**:

    ```typescript
    // Add to OrderSuccess component
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    
    const handleCancelOrder = async () => {
      // Show confirmation dialog
      // Call cancellation service
      // Show success/error message
      // Redirect to new order form
    }
    ```

- [ ] Step 7: Update Notification Service
  - **Task**: Remove "order-ready" notifications and update audio types
  - **Files**:
    - `src/utils/notificationService.ts`: Remove "order-ready" from audioType, update notification logic
  - **Dependencies**: Step 6 completion
  - **Pseudocode**:

    ```typescript
    // Updated audio types
    audioType?: "new-order" | "order-completed" | "error"
    
    // Remove ready notification logic
    ```

- [ ] Step 8: Update Test Files
  - **Task**: Update all test files to remove references to "ready" status
  - **Files**:
    - `tests/e2e/admin/order-management.spec.ts`: Update test expectations to remove ready status
    - `tests/e2e/order-dashboard-options.spec.ts`: Remove "Mark Ready" button tests
    - `tests/config/fixtures.ts`: Update OrderStatus type
    - `src/components/admin/__tests__/*.test.tsx`: Update component tests
    - `src/components/guest/__tests__/*.test.tsx`: Add guest cancellation tests
  - **Dependencies**: Step 7 completion
  - **Pseudocode**:

    ```typescript
    // Update test expectations
    await expect(statusButton).toContainText(/complete|pending|cancel/i)
    
    // Add guest cancellation tests
    test('guest can cancel pending order', async () => {
      // Test cancellation flow
    })
    ```

- [ ] Step 9: Update Documentation Files
  - **Task**: Update specification documents to reflect the simplified status workflow
  - **Files**:
    - `docs/specs/application_overview.md`: Update barista admin functionality description
    - `docs/specs/db_schema.md`: Update database schema documentation and order status enum
    - `database/schema.sql`: Ensure comments reflect new status workflow
  - **Dependencies**: Step 8 completion
  - **Pseudocode**: Update documentation to reflect:

    ```markdown
    # Order Status Workflow
    - pending: Order placed, awaiting preparation
    - completed: Order finished and picked up
    - cancelled: Order cancelled by guest or barista
    ```

- [ ] Step 10: Build and Run Application
  - **Task**: Ensure application builds and runs successfully with all changes
  - **Files**: All modified files
  - **Dependencies**: Step 9 completion
  - **Commands**:

    ```bash
    npm run build
    npm run dev
    ```

- [ ] Step 11: Write Unit Tests for New Functionality
  - **Task**: Create comprehensive unit tests for guest cancellation feature
  - **Files**:
    - `src/services/__tests__/orderService.test.ts`: Test guest cancellation service
    - `src/hooks/__tests__/useGuestOrderActions.test.ts`: Test guest order actions hook
    - `src/components/guest/__tests__/OrderSuccess.test.tsx`: Test cancellation UI
  - **Dependencies**: Step 10 completion
  - **Test Coverage**: Minimum 80% coverage for new functionality

- [ ] Step 12: Write Playwright UI Tests
  - **Task**: Create end-to-end tests for the updated order workflow
  - **Files**:
    - `tests/e2e/guest/guest-order-cancellation.spec.ts`: Test complete guest cancellation flow
    - `tests/e2e/admin/simplified-order-management.spec.ts`: Test admin workflow without ready status
  - **Dependencies**: Step 11 completion
  - **Test Scenarios**:

    ```typescript
    // Guest cancellation test
    test('guest can cancel order from confirmation page', async () => {
      // Place order -> confirm -> cancel -> verify status
    })
    
    // Admin workflow test  
    test('admin can mark orders as completed directly', async () => {
      // Verify no "Mark Ready" button, test direct completion
    })
    ```

- [ ] Step 13: Run All Tests
  - **Task**: Execute complete test suite to ensure no regressions
  - **Dependencies**: Step 12 completion
  - **Commands**:

    ```bash
    npm run test
    npm run test:e2e
    npm run lint
    ```

- [ ] Step 14: Definition of Done Compliance Check
  - **Task**: Verify implementation meets all Definition of Done criteria
  - **Dependencies**: Step 13 completion
  - **Checklist**: Review against `/docs/specs/definition_of_done.md`
    - [ ] All tests pass (unit, integration, e2e)
    - [ ] Code follows established patterns
    - [ ] Mobile responsive design maintained
    - [ ] Accessibility standards met
    - [ ] Documentation updated
    - [ ] No security vulnerabilities introduced
    - [ ] Real-time functionality preserved
