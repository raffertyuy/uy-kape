---
description: "Implementation plan for reorganizing test files according to industry best practices"
created-date: 2025-08-22
---

# Implementation Plan for Test Structure Reorganization

## Current State Analysis

- **Unit Tests**: Already properly organized in `src/**/__tests__/` following React.js best practices ✅
- **E2E Tests**: Located in `tests/e2e/` with Playwright configuration ✅
- **Test Configuration**: Split between `tests/unit/` (Vitest configs) and `tests/e2e/` (Playwright config)
- **Test Outputs**: Scattered between `tests/outputs/` and `test-results/` directories
- **CLI Commands**: Some configs nested deep, making root-level CLI execution inconsistent

## Target Structure (React.js Industry Best Practice)

```text
src/                        # Source code with co-located tests
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx    # Co-located with component ✅
│   └── admin/
│       ├── Dashboard.tsx
│       └── __tests__/
│           └── Dashboard.test.tsx  # Co-located with component ✅
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts         # Co-located with hook ✅
├── utils/
│   ├── helpers.ts
│   └── __tests__/
│       └── helpers.test.ts         # Co-located with utility ✅
└── ...

tests/                      # Non-unit tests and configurations
├── e2e/                    # End-to-end tests (Playwright)
│   ├── *.spec.ts           # E2E test files
│   ├── fixtures/           # Test data and fixtures
│   └── utils/              # E2E test utilities
├── config/                 # Centralized test configurations
│   ├── vitest.config.ts    # Main Vitest config
│   ├── vitest.config.ci.ts # CI-specific config
│   ├── playwright.config.ts # Playwright config
│   └── test-utils.tsx      # Shared test utilities
└── outputs/                # All test artifacts
    ├── coverage/           # Coverage reports
    ├── playwright-report/  # Playwright HTML reports
    └── junit/              # JUnit XML reports
```

## Implementation Steps

- [ ] **Step 1: Reorganize Test Configuration Directory**
  - **Task**: Create a centralized test configuration directory to consolidate scattered configs
  - **Commands**: Use `git mv` to preserve file history when moving files

    ```bash
    # Create the centralized config directory
    mkdir tests/config
    
    # Move configuration files using git mv to preserve history
    git mv tests/unit/vitest.config.ts tests/config/vitest.config.ts
    git mv tests/unit/vitest.config.ci.ts tests/config/vitest.config.ci.ts
    git mv tests/e2e/playwright.config.ts tests/config/playwright.config.ts
    git mv src/test-utils.tsx tests/config/test-utils.tsx
    ```

  - **Dependencies**: None

- [ ] **Step 2: Consolidate Test Output Directories**
  - **Task**: Merge scattered test output directories into a single location
  - **Files**:
    - Ensure all outputs go to `tests/outputs/`
    - Remove `test-results/` directory (merge contents into `tests/outputs/`)
    - Update `.gitignore` to ignore `tests/outputs/` and remove old scattered ignores

      ```ignore
      # Test artifacts and outputs (consolidated)
      tests/outputs/
      
      # Remove these old entries:
      # tests/outputs/test-results.xml (covered by tests/outputs/)
      # tests/e2e/results/ (will be moved to tests/outputs/)
      # tests/e2e/reports/ (will be moved to tests/outputs/)
      # test-results/ (will be removed)
      # tests/unit/coverage/ (will be moved to tests/outputs/coverage/)
      ```

  - **Note**: Only test configuration and source files should be committed, not generated outputs
  - **Dependencies**: None

- [ ] **Step 3: Update Root-Level Configuration Files**
  - **Task**: Create root-level config files that re-export from centralized configs for seamless CLI usage
  - **Files**:
    - `vitest.config.ts`: Update to re-export from `tests/config/vitest.config.ts`

      ```typescript
      // Re-export the main vitest config from the centralized location
      export { default } from './tests/config/vitest.config.ts'
      ```

    - `playwright.config.ts`: Create root-level config that re-exports from `tests/config/playwright.config.ts`

      ```typescript
      // Re-export the main playwright config from the centralized location
      export { default } from './tests/config/playwright.config.ts'
      ```

  - **Note**: This approach ensures `npx vitest` and `npx playwright test` work seamlessly from root directory
  - **Dependencies**: Step 1

- [ ] **Step 4: Update Package.json Scripts**
  - **Task**: Simplify npm scripts to work from root directory using centralized configs
  - **Files**:
    - `package.json`: Update test scripts for cleaner CLI usage

      ```json
      {
        "test": "vitest run",
        "test:watch": "vitest",
        "test:ui": "vitest --ui",
        "test:coverage": "vitest run --coverage",
        "test:ci": "vitest run --config=tests/config/vitest.config.ci.ts",
        "test:e2e": "playwright test",
        "test:e2e:headed": "playwright test --headed",
        "test:e2e:debug": "playwright test --debug"
      }
      ```

  - **Dependencies**: Step 3

- [ ] **Step 5: Update Configuration File Paths**
  - **Task**: Update all test configuration files to work with the new centralized structure
  - **Files**:
    - `tests/config/vitest.config.ts`: Update setupFiles path, test inclusion patterns, and output paths
    - `tests/config/vitest.config.ci.ts`: Update paths and output directory references
    - `tests/config/playwright.config.ts`: Update testDir, outputDir, and reporter paths
    - `tests/config/test-utils.tsx`: Update import paths to use `@/` alias correctly
  - **Dependencies**: Steps 1-4

- [ ] **Step 6: Validate Unit Test Structure**
  - **Task**: Ensure all unit tests in `src/**/__tests__/` are properly organized and working
  - **Files**:
    - Verify all component tests are in `src/components/**/__tests__/`
    - Verify all hook tests are in `src/hooks/**/__tests__/`
    - Verify all utility tests are in `src/utils/**/__tests__/`
    - Verify all service tests are in `src/services/**/__tests__/`
    - Check for any orphaned test files that need relocation
  - **Dependencies**: Step 5

- [ ] **Step 7: Organize E2E Test Structure**
  - **Task**: Improve organization of e2e tests and add supporting directories
  - **Files**:
    - Ensure all e2e tests are in `tests/e2e/*.spec.ts`
    - Create `tests/e2e/fixtures/` for test data if needed
    - Create `tests/e2e/utils/` for e2e-specific utilities if needed
    - Verify all e2e tests use the centralized Playwright config
  - **Dependencies**: Step 5

- [ ] **Step 8: Update TSConfig and ESLint**
  - **Task**: Update configuration files to recognize the new test structure
  - **Files**:
    - `tsconfig.json`: Ensure test directories are included in compilation
    - `eslint.config.js`: Update test file patterns to include new paths
    - Verify path aliases work correctly for test files
  - **Dependencies**: Steps 1-7

- [ ] **Step 9: Clean Up Old Directories**
  - **Task**: Remove the old scattered test directories and consolidate files
  - **Files**:
    - Remove `tests/unit/` directory (after moving configs to `tests/config/`)
    - Remove `test-results/` directory (after moving contents to `tests/outputs/`)
    - Update any documentation that references old test paths
  - **Dependencies**: Steps 1-8

- [ ] **Step 10: Update CI/CD Configuration**
  - **Task**: Update CI/CD workflows to use the simplified test commands
  - **Files**:
    - `.github/workflows/ci.yml`: Update test commands to use new script names
    - Verify CI still finds and runs all tests correctly
    - Update test artifact collection paths to use `tests/outputs/`
  - **Dependencies**: Step 9

- [ ] **Step 11: Build and Test Validation**
  - **Task**: Verify the application builds and all tests run correctly with the new structure
  - **Files**: None (validation process)
  - **Dependencies**: Step 10
  - **Commands**:

    ```bash
    npm run build
    npm run lint
    npm run test
    npm run test:e2e
    ```

- [ ] **Step 12: Documentation Update**
  - **Task**: Update all documentation to reflect the improved test structure
  - **Files**:
    - `docs/file_structure.md`: Update to reflect new test organization
    - `README.md`: Update test running instructions if needed
    - Any development guides that mention test file locations
  - **Dependencies**: Step 11

- [ ] **Step 13: Definition of Done Compliance Check**
  - **Task**: Ensure the reorganization meets all Definition of Done requirements
  - **Files**: Verify against `docs/specs/definition_of_done.md`
  - **Dependencies**: Step 12
  - **Validation**:
    - All tests pass with new structure
    - CI/CD pipeline works correctly
    - Documentation is updated
    - No duplicate or orphaned test files
    - All npm scripts work from root directory
    - ESLint and TypeScript validation passes
    - Unit tests remain co-located with source files (React.js best practice)
