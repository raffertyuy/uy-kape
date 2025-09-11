---
description: "Implementation plan for improving guest name display in barista admin order dashboard"
created-date: 2025-09-11
---

# Implementation Plan for Guest Name Display Improvement

## OBJECTIVE

Improve the UI/UX in the barista admin order dashboard module so that guest names are fully readable even on mobile responsive view, addressing the current issue where names are trimmed due to the `truncate` class. The solution should provide multiple interaction patterns to ensure full name visibility while maintaining a clean, responsive layout.

## IMPLEMENTATION PLAN

- [x] Step 1: Analyze Current Implementation and Create Enhanced Name Display Component
  - **Task**: Create a new component that provides multiple ways to display and access full guest names, including tooltips, expandable text, and modal dialogs for better mobile UX
  - **Files**: Maximum of 5 files
    - `src/components/admin/GuestNameDisplay.tsx`: New component with tooltip, expandable text, and modal functionality, [Pseudocode: Component with truncated display + hover tooltip + click to expand/modal behavior for mobile] ✅ **COMPLETED**
    - `src/components/admin/__tests__/GuestNameDisplay.test.tsx`: Comprehensive unit tests for component functionality, [Pseudocode: Tests for tooltip behavior, click interactions, accessibility features, mobile responsiveness] ✅ **COMPLETED**
  - **Dependencies**: React hooks, Tailwind CSS utilities, accessibility features
  - **COMPLETION SUMMARY**: Successfully created the GuestNameDisplay component with comprehensive functionality including mobile detection, overflow detection, tooltip display on desktop, click-to-expand on mobile with visual indicators, accessibility features, and TypeScript safety. Created 16 unit tests covering all functionality with 100% pass rate.
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 2: Update OrderCard Component to Use Enhanced Name Display
  - **Task**: Replace the current truncated guest name display in OrderCard component with the new GuestNameDisplay component, ensuring proper responsive behavior and maintaining existing functionality
  - **Files**: Maximum of 3 files
    - `src/components/admin/OrderCard.tsx`: Replace truncated name display with GuestNameDisplay component, [Pseudocode: Import GuestNameDisplay, replace h3 with truncate class, maintain existing layout and styling]
    - `src/components/admin/__tests__/OrderCard.test.tsx`: Update tests to accommodate new name display behavior, [Pseudocode: Add tests for name visibility, tooltip behavior, accessibility compliance]
  - **Dependencies**: Step 1 completion, GuestNameDisplay component
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 3: Test and Validate Implementation
  - **Task**: Run the application and test the enhanced guest name display functionality across different screen sizes and devices using Playwright MCP to ensure proper behavior on both desktop and mobile views
  - **Files**: Maximum of 2 files
    - Update any configuration files if needed for testing
  - **Dependencies**: Step 1 and 2 completion, running application
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 4: Write Unit Tests for Enhanced Guest Name Display
  - **Task**: Create comprehensive unit tests for the GuestNameDisplay component and updated OrderCard component to ensure proper functionality, accessibility, and responsive behavior
  - **Files**: Maximum of 3 files
    - Tests should be created as part of Step 1 and 2, but verify coverage and add additional tests if needed
    - Ensure tests cover tooltip behavior, modal functionality, keyboard navigation, and mobile responsiveness
  - **Dependencies**: Step 1, 2, and 3 completion, dual-testing-strategy compliance
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - Take note of the [dual-testing-strategy](/docs/dual-strategy-testing.md). After testing, set the environment variable back to not using mocks.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 5: Write Playwright UI Tests for Guest Name Display Feature
  - **Task**: Create focused Playwright UI tests that validate the guest name display functionality in the barista admin order dashboard, testing tooltip behavior, modal functionality, and mobile responsiveness
  - **Files**: Maximum of 2 files
    - `tests/e2e/admin/guest-name-display.spec.ts`: UI tests for guest name display functionality, [Pseudocode: Tests for tooltip hover, modal click behavior, responsive breakpoints, accessibility compliance]
  - **Dependencies**: Step 1-4 completion, functioning application
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - Keep the test simple and focused on the intent of the objective. Avoid hardcoding dynamic data that comes from the database, REMEMBER that the data are dynamic and changing.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 6: Ensure Compliance with Definition of Done
  - **Task**: Verify that the implementation meets all requirements specified in the definition of done document, including accessibility, responsiveness, and code quality standards
  - **Files**: No new files, review and validation step
  - **Dependencies**: All previous steps completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - Make sure it complies with our [definition_of_done](/docs/specs/definition_of_done.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
