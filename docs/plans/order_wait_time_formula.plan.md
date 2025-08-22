---
description: "Implementation plan for Order Wait Time formula"
created-date: 2025-01-21
---

# Implementation Plan for Order Wait Time Formula

## Objective
Make the order wait time configurable in the .env file and implement the formula: `estimated_wait_time = queue_position * WAIT_TIME_PER_ORDER`. Display estimated wait time in order confirmation and allow refresh for updated positions.

## Implementation Steps

- [x] **Step 1: Add Environment Variable Configuration**
  - **Task**: Add configurable wait time environment variable to replace hardcoded 3-minute values
  - **Files**:
    - `.env.example`: Add `VITE_WAIT_TIME_PER_ORDER=5` example configuration
    - `src/config/app.config.ts`: Add waitTimePerOrder configuration that reads from environment variable
    - `src/types/app.types.ts`: Update AppConfig interface to include waitTimePerOrder property
  - **Dependencies**: None
  - **Pseudocode**:
    ```typescript
    // In app.config.ts
    export const appConfig: AppConfig = {
      // existing config...
      waitTimePerOrder: Number(import.meta.env.VITE_WAIT_TIME_PER_ORDER) || 5,
    }
    
    // In app.types.ts
    interface AppConfig {
      // existing properties...
      waitTimePerOrder: number
    }
    ```

- [x] **Step 2: Update Queue Utilities**
  - **Task**: Modify queueUtils to use configurable wait time instead of hardcoded value
  - **Files**:
    - `src/utils/queueUtils.ts`: Update calculateEstimatedTime function to accept configurable time and use it as default
  - **Dependencies**: Step 1 (app config)
  - **Pseudocode**:
    ```typescript
    import { appConfig } from '@/config/app.config'
    
    export const calculateEstimatedTime = (
      position: number, 
      averageTimePerOrder: number = appConfig.waitTimePerOrder
    ): string => {
      // existing implementation using averageTimePerOrder
    }
    ```

- [x] **Step 3: Update Queue Status Hook**
  - **Task**: Modify useQueueStatus hook to use configurable wait time for calculations
  - **Files**:
    - `src/hooks/useQueueStatus.ts`: Replace hardcoded 3 with configurable value from app config
  - **Dependencies**: Step 1 (app config)
  - **Pseudocode**:
    ```typescript
    import { appConfig } from '@/config/app.config'
    
    // In fetchQueueStatus function:
    const estimatedWaitTime = position > 0 
      ? `${Math.max(1, position * appConfig.waitTimePerOrder)} minutes`
      : isReady 
      ? 'Ready for pickup!'
      : 'Preparing your order...'
    ```

- [x] **Step 4: Update Admin Order Service**
  - **Task**: Replace hardcoded wait time in admin order service calculations
  - **Files**:
    - `src/services/adminOrderService.ts`: Update estimated completion time calculation to use configurable value
  - **Dependencies**: Step 1 (app config)
  - **Pseudocode**:
    ```typescript
    import { appConfig } from '@/config/app.config'
    
    // Replace hardcoded 3 with configurable value:
    const estimatedMinutes = Math.max(1, (order.queue_number || 0) * appConfig.waitTimePerOrder)
    ```

- [x] **Step 5: Update Order Service (if needed)**
  - **Task**: Check if orderService also uses hardcoded wait times and update if necessary
  - **Files**:
    - `src/services/orderService.ts`: Review for any hardcoded wait time calculations
  - **Dependencies**: Step 1 (app config)
  - **Pseudocode**:
    ```typescript
    // Review and update any hardcoded wait time calculations if found
    ```

- [x] **Step 6: Update Configuration Tests**
  - **Task**: Add tests for new waitTimePerOrder configuration
  - **Files**:
    - `src/config/__tests__/app.config.test.ts`: Add tests for waitTimePerOrder configuration
  - **Dependencies**: Steps 1-2
  - **Pseudocode**:
    ```typescript
    describe('waitTimePerOrder configuration', () => {
      it('should have default waitTimePerOrder value')
      it('should load waitTimePerOrder from environment variable')
      it('should use numeric value for waitTimePerOrder')
    })
    ```

- [x] **Step 7: Add Queue Utils Tests**
  - **Task**: Test that calculateEstimatedTime uses configurable values correctly
  - **Files**:
    - `src/utils/__tests__/queueUtils.test.ts`: Add tests for updated calculateEstimatedTime function
  - **Dependencies**: Step 2
  - **Pseudocode**:
    ```typescript
    describe('calculateEstimatedTime with configurable wait time', () => {
      it('should use default wait time from config')
      it('should accept custom wait time parameter')
      it('should calculate correct time for different positions')
    })
    ```

- [x] **Step 8: Build and Test Application**
  - **Task**: Build the application and run existing tests to ensure no regressions
  - **Files**: None (build/test process)
  - **Dependencies**: Steps 1-7
  - **Commands**:
    ```bash
    npm run build
    npm run test:run
    npm run lint
    ```

- [x] **Step 9: Test Order Flow with Playwright**
  - **Task**: Use Playwright to test complete order flow and verify wait time display and refresh functionality
  - **Files**:
    - Create manual test to verify order confirmation shows correct wait time
    - Test refresh functionality updates queue position and wait time
  - **Dependencies**: Step 8
  - **Test scenarios**:
    - Place an order and verify estimated wait time is displayed
    - Refresh order confirmation page and verify wait time updates
    - Verify wait time calculation uses configured value (5 minutes per order)

- [x] **Step 10: Add Environment Variable Documentation**
  - **Task**: Update documentation to include new environment variable
  - **Files**:
    - Update any relevant documentation about environment variables
  - **Dependencies**: All previous steps
  - **Pseudocode**:
    ```markdown
    ## Environment Variables
    - `VITE_WAIT_TIME_PER_ORDER`: Time in minutes per order for wait time calculation (default: 5)
    ```

- [x] **Step 11: Final Validation and Compliance Check**
  - **Task**: Ensure implementation meets all requirements and follows coding standards
  - **Files**: Review all modified files
  - **Dependencies**: All previous steps
  - **Validation checklist**:
    - [x] Wait time is configurable via .env variable
    - [x] Formula `estimated_wait_time = queue_position * WAIT_TIME_PER_ORDER` is implemented
    - [x] Order confirmation displays estimated wait time
    - [x] Refresh functionality works to update queue position and wait time
    - [x] All tests pass
    - [x] Code follows TypeScript and React best practices
    - [x] Accessibility considerations are maintained
    - [x] No breaking changes to existing functionality

## Success Criteria
- [x] `VITE_WAIT_TIME_PER_ORDER` environment variable controls wait time calculation
- [x] Order confirmation page displays estimated wait time using the formula
- [x] Refresh functionality updates queue position and recalculates wait time
- [x] All existing tests continue to pass
- [x] New functionality tested with Playwright
- [x] Code follows project coding standards and TypeScript best practices