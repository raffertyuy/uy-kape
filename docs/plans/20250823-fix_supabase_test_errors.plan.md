---
description: "Fix Supabase test errors by configuring proper test database integration"
created-date: 2025-08-23
---

# Implementation Plan for Fix Supabase Test Errors

## OBJECTIVE

Fix Supabase errors that occur during test execution by implementing a dual strategy approach:

- **Local Development**: Use real local Supabase (Docker) for integration testing
- **CI Environment**: Use properly configured mocks that don't fail
- **Current Issue**: Tests show errors like "TypeError: Cannot read properties of undefined (reading 'status')" because Supabase mocks have incomplete method chains

This approach ensures tests work reliably in both local development (with real database) and CI (with mocks), without breaking GitHub Actions workflows.

## IMPLEMENTATION PLAN

- [ ] Step 1: Analyze Current Test Configuration and CI Requirements
  - **Task**: Examine why tests are failing with Supabase connection errors and design dual strategy approach
  - **Files**:
    - `src/lib/supabase.ts`: [Review current test environment detection logic]
    - `tests/config/vitest.config.ci.ts`: [Review CI-specific configuration]
    - `tests/config/vitest.config.ts`: [Review local development configuration]
    - `.github/workflows/ci.yml`: [Analyze CI environment constraints]
  - **Dependencies**: Local Supabase (Docker) running for local testing
  - **Analysis**: Determine strategy for CI (mocks) vs local (real DB)
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 2: Fix Supabase Mock Implementation for CI
  - **Task**: Create complete Supabase mock chains that don't throw "undefined status" errors
  - **Files**:
    - `tests/config/mocks.ts`: [Fix createMockSupabaseClient implementation], [Ensure all method chains return proper responses], [Pseudocode: Fix .from().select().order() chain]
    - `tests/config/supabase-mocks.ts`: [Create dedicated Supabase mocking utilities], [Complete mock implementation for all service methods]
  - **Dependencies**: Step 1 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Focus on fixing the method chaining issue in mocks (e.g., from().select().order() should all return proper objects)
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 3: Implement Environment-Based Test Configuration
  - **Task**: Create environment detection that uses real DB locally and mocks in CI
  - **Files**:
    - `src/lib/supabase.ts`: [Enhance test environment detection], [Keep existing local Supabase connection]
    - `tests/config/test-environment.ts`: [Create environment detection utilities], [Pseudocode: isCI() ? useMocks() : useRealDB()]
    - `src/setupTests.ts`: [Add conditional setup based on environment]
  - **Dependencies**: Step 2 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Ensure CI environment variable (CI=true) is properly detected
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step, even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 4: Configure CI Environment for Mocked Tests
  - **Task**: Ensure CI configuration properly uses mocks instead of real database
  - **Files**:
    - `tests/config/vitest.config.ci.ts`: [Add environment variables for CI], [Ensure proper mock configuration], [Pseudocode: CI=true, USE_MOCKS=true]
    - `tests/config/ci-setup.ts`: [Create CI-specific test setup], [Global mock configuration for CI]
  - **Dependencies**: Step 3 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Verify that CI environment doesn't try to connect to real Supabase
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 5: Configure Local Development Database Integration
  - **Task**: Set up proper test data and database utilities for local development
  - **Files**:
    - `supabase/seed.sql`: [Verify test data exists], [Add minimal test data if missing]
    - `tests/config/local-db-setup.ts`: [Create database setup utilities for local tests], [Pseudocode: functions to seed/clean test data when using real DB]
    - `tests/config/vitest.config.ts`: [Configure for local Supabase usage]
  - **Dependencies**: Local Supabase running, Step 4 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - This step only applies to local development, not CI
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 6: Update Global Test Setup for Dual Strategy
  - **Task**: Configure test setup to use mocks in CI and real DB locally
  - **Files**:
    - `src/setupTests.ts`: [Add environment-based Supabase setup], [Pseudocode: if (CI) use global mocks, else use real client]
    - `tests/config/test-utils.tsx`: [Add dual strategy test utilities]
  - **Dependencies**: Step 5 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 7: Update Individual Test Files for Dual Strategy
  - **Task**: Remove problematic Supabase mocking and let environment detection handle it
  - **Files**:
    - `src/pages/__tests__/MenuManagement.test.tsx`: [Remove manual Supabase mocking], [Let global environment detection handle mocking]
    - `src/hooks/__tests__/useMenuData.test.ts`: [Remove inconsistent mocks], [Use environment-based approach]
    - `src/services/__tests__/menuService.test.ts`: [Fix service-level tests to work with both strategies]
  - **Dependencies**: Step 6 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Focus on removing ad-hoc mocking that conflicts with global strategy
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 7: Add Database Test Utilities
  - **Task**: Create helper functions for database operations in tests
  - **Files**:
    - `tests/config/db-helpers.ts`: [Database test utilities], [Functions for seeding/cleaning test data], [Pseudocode: createTestData(), cleanupTestData(), resetDatabase()]
  - **Dependencies**: Step 6 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 8: Test CI Workflow Compatibility
  - **Task**: Verify that GitHub Actions CI runs without Supabase errors
  - **Files**:
    - `.github/workflows/ci.yml`: [Review workflow for any needed adjustments]
  - **Dependencies**: Step 7 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Run `npm run test:ci-no-coverage` locally to simulate CI environment
    - Verify that CI environment variable properly triggers mock usage
    - Create a test PR to verify GitHub Actions workflow works
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 9: Run Tests and Fix Remaining Issues
  - **Task**: Execute test suite and resolve any remaining Supabase-related errors
  - **Files**: Various test files as needed based on failures
  - **Dependencies**: Step 8 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Run `npm test` to see if Supabase errors are resolved
    - Run `npm test -- --reporter=verbose` to see detailed output
    - Fix any remaining connection or configuration issues
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 10: Document Dual Strategy Test Configuration
  - **Task**: Update documentation to explain dual strategy approach and usage
  - **Files**:
    - `docs/testing.md`: [Add section on dual strategy testing], [Document CI vs local development approach], [Explain when to use mocks vs real database]
    - `LOCAL_DEVELOPMENT.md`: [Update with test database setup instructions], [Explain local Supabase test configuration]
    - `README.md`: [Update testing section to mention dual strategy]
  - **Dependencies**: Step 9 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Document the rationale for dual strategy approach
    - Provide clear instructions for developers on both environments
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 11: Final Validation of Both Environments
  - **Task**: Run comprehensive test suite in both local and CI-like environments
  - **Files**: N/A (test execution in multiple environments)
  - **Dependencies**: Step 10 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Run local tests: `npm test` (should use real Supabase)
    - Run CI simulation: `npm run test:ci-no-coverage` (should use mocks)
    - Verify no Supabase connection errors in either environment
    - Verify all tests pass or fail for legitimate reasons (not connection issues)
    - Test a real GitHub Actions run by creating a test PR
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 12: Compliance with Definition of Done
  - **Task**: Ensure the dual strategy implementation meets all requirements from the definition of done
  - **Files**: Review all changes against `/docs/specs/definition_of_done.md`
  - **Dependencies**: Step 11 complete
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Verify test configuration follows PostgreSQL standards from sql.instructions.md
    - Ensure no hardcoded secrets or credentials
    - Verify proper error handling and logging
    - Check that tests run reliably and consistently in both environments
    - Verify CI workflow continues to work without database dependencies
    - Document the dual strategy approach properly
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
