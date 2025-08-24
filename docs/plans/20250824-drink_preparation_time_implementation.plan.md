---
description: "Implementation plan for drink preparation time feature with dynamic wait time calculation"
created-date: 2025-08-24
---

# Implementation Plan for Drink Preparation Time Feature

## OBJECTIVE

Enable baristas to set individual preparation times for each drink in the menu management system, replacing the global VITE_WAIT_TIME_PER_ORDER with drink-specific times. Calculate estimated wait times based on the total preparation time of all pending orders ahead in the queue, improving guest experience with more accurate wait time estimates.

## IMPLEMENTATION PLAN

- [ ] Step 1: Database Schema Update
  - **Task**: Add preparation_time_minutes column to drinks table, update schema.sql and seed.sql with default values, create new migration
  - **Files**:
    - `supabase/schema.sql`: Add preparation_time_minutes INTEGER column to drinks table
    - `supabase/seed.sql`: Update seed data with specified preparation times
    - `docs/specs/db_schema.md`: Document the new column in the database schema documentation
  - **Dependencies**: None
  - **Seed Data Default Values**:
    - Espresso: 3 minutes
    - Espresso Macchiato: 3 minutes
    - Black Coffee (Moka Pot): 10 minutes
    - Black Coffee (V60): 10 minutes
    - Black Coffee (Aeropress): 10 minutes
    - Ice-Blended Coffee: 15 minutes
    - Affogato: 7 minutes
    - Milo: 0 minutes
    - Ribena: 0 minutes
    - Yakult: 0 minutes
    - Everything else: NULL
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 2: Database Migration and Reset
  - **Task**: Delete existing migration, reset Supabase database, and apply new schema with seed data
  - **Files**:
    - Delete `supabase/migrations/20250823145856_initial_schema_and_seed.sql`
    - Reset local Supabase database to apply new schema and seed data
  - **Dependencies**: Step 1
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 3: Update TypeScript Types
  - **Task**: Add preparation_time_minutes to drink-related types and interfaces
  - **Files**:
    - `src/types/menu.types.ts`: Add preparation_time_minutes?: number | null to Drink interface
    - `src/types/admin.types.ts`: Update admin types that reference drinks
  - **Dependencies**: Step 2
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 4: Update Barista Admin Menu Management UI
  - **Task**: Add preparation time input field to drink creation and editing forms
  - **Files**:
    - `src/components/admin/DrinkCard.tsx`: Display preparation time if available
    - `src/components/admin/DrinkForm.tsx`: Add preparation time input field with validation
    - `src/pages/admin/MenuManagement.tsx`: Handle preparation time in form state
  - **Dependencies**: Step 3
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 5: Update Menu Services for Preparation Time
  - **Task**: Modify menu services to handle preparation time CRUD operations
  - **Files**:
    - `src/services/menuService.ts`: Update drink creation/editing to include preparation_time_minutes
    - `src/services/adminMenuService.ts`: Handle preparation time in admin operations
  - **Dependencies**: Step 4
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 6: Update Wait Time Calculation Logic
  - **Task**: Replace global wait time calculation with dynamic calculation based on queue drinks and their preparation times
  - **Files**:
    - `src/utils/queueUtils.ts`: Update calculateEstimatedTime to use drink-specific preparation times
    - `src/hooks/useQueueStatus.ts`: Modify to calculate wait time based on queue drinks ahead
    - `src/services/orderService.ts`: Update queue status calculation
    - `src/services/adminOrderService.ts`: Update admin order estimated completion times
  - **Dependencies**: Step 5
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Implement logic: For each order in queue ahead of current order, get its drink's preparation_time_minutes, sum all times, fallback to VITE_WAIT_TIME_PER_ORDER for drinks without specific times
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 7: Update Functional Specifications Documentation
  - **Task**: Document the new preparation time feature and wait time calculation in functional specifications
  - **Files**:
    - `docs/specs/functional_specifications.md`: Add section documenting drink-specific preparation times and dynamic wait time calculation
  - **Dependencies**: Step 6
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Document the test scenarios: Espresso (3min) → Ice-Blended Coffee (15min) → Milo (0min) → Cappuccino (15min + fallback time)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 8: Test Application with New Features
  - **Task**: Run the application and test menu management functionality for preparation time setting
  - **Files**: None (testing process)
  - **Dependencies**: Step 7
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - Test that baristas can set/edit preparation times for drinks in menu management
    - Verify that preparation times are saved and displayed correctly
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 9: Playwright Exploratory Testing for Wait Time Calculation
  - **Task**: Use Playwright MCP to test the dynamic wait time calculation with the specified test scenario
  - **Files**: None (exploratory testing)
  - **Dependencies**: Step 8
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - Test scenario:
      1. Clear all pending orders in admin dashboard
      2. Order Espresso → verify 3 minutes wait time
      3. Order Ice-Blended Coffee → verify 15 minutes wait time  
      4. Order Milo → verify still 15 minutes (0 prep time)
      5. Order Cappuccino → verify 15 + VITE_WAIT_TIME_PER_ORDER minutes
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 10: Write Unit Tests for New Functionality
  - **Task**: Create comprehensive unit tests for preparation time management and wait time calculation
  - **Files**:
    - `src/utils/__tests__/queueUtils.test.ts`: Update tests for new wait time calculation logic
    - `src/services/__tests__/menuService.test.ts`: Add tests for preparation time CRUD operations
    - `src/hooks/__tests__/useQueueStatus.test.ts`: Test dynamic wait time calculation
  - **Dependencies**: Step 9
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Test edge cases: null preparation times, zero preparation times, mix of drinks with/without specific times
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 11: Write Playwright UI Tests
  - **Task**: Create Playwright tests for the preparation time feature and wait time calculation
  - **Files**:
    - `tests/e2e/admin/menu-management-preparation-time.spec.ts`: Test setting preparation times in menu management
    - `tests/e2e/guest/dynamic-wait-time-calculation.spec.ts`: Test guest wait time calculation accuracy
  - **Dependencies**: Step 10
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Focus on core user flows: admin setting preparation times, guest seeing accurate wait times
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 12: Run All Tests and Fix Issues
  - **Task**: Execute full test suite and fix any failing tests or integration issues
  - **Files**: Various (as needed for fixes)
  - **Dependencies**: Step 11
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - Run unit tests, Playwright tests, linting, and build checks
    - Fix any TypeScript errors, test failures, or integration issues
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 13: Definition of Done Compliance Check
  - **Task**: Ensure implementation meets all requirements in definition_of_done.md
  - **Files**: Review all modified files against DoD criteria
  - **Dependencies**: Step 12
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Verify all DoD criteria are met:
      - Unit tests with 80%+ coverage
      - All tests passing  
      - Zero ESLint errors
      - TypeScript properly typed
      - Mobile responsiveness
      - Documentation updated
      - Real-time functionality working
      - Security considerations addressed
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.

## Success Criteria

- [ ] Database schema includes preparation_time_minutes column for drinks
- [ ] Barista admin can set/edit preparation times for individual drinks in menu management
- [ ] Guest wait time calculation uses sum of preparation times for orders ahead in queue
- [ ] Fallback to VITE_WAIT_TIME_PER_ORDER for drinks without specific preparation times
- [ ] Zero preparation time correctly handled (e.g., Milo shows 0 additional wait time)
- [ ] All existing functionality remains intact and working
- [ ] Unit tests cover new functionality with adequate coverage
- [ ] Playwright tests validate user flows
- [ ] Documentation updated to reflect new feature
- [ ] All tests passing and no regressions introduced
- [ ] Real-time updates work correctly with new wait time calculations
- [ ] Mobile responsive design maintained
- [ ] TypeScript types properly defined for all new functionality

## Technical Notes

- Preparation time is stored as INTEGER minutes in database, nullable to allow fallback
- Wait time calculation: SUM(preparation_time_minutes OR fallback_value) for orders ahead in queue
- UI should clearly indicate when preparation time is using fallback vs. specific value
- Consider performance implications of calculating wait times for each order
- Maintain backward compatibility with existing orders and menu items
