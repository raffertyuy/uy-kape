# Test Structure Documentation

This document provides a comprehensive guide to the test structure and organization in the Uy, Kape! project.

## 📁 Test Structure Overview

Our test structure follows a **co-located** approach for unit tests with centralized configuration and shared utilities.

```
tests/
├── config/
│   ├── vitest.config.ts          # Main test configuration
│   ├── vitest.config.ci.ts       # CI-optimized configuration
│   ├── test-utils.tsx             # Enhanced React testing utilities
│   ├── fixtures.ts                # Mock data and test fixtures
│   ├── mocks.ts                   # Shared mock implementations
│   └── fileMock.js                # Static asset mock for tests
├── e2e/
│   ├── admin/                     # Admin panel E2E tests
│   ├── guest/                     # Guest experience E2E tests
│   └── system/                    # System-level E2E tests
└── outputs/                       # Test results and reports

src/
├── components/
│   ├── ComponentName.tsx
│   └── __tests__/
│       └── ComponentName.test.tsx # Co-located unit tests
├── hooks/
│   ├── useHookName.ts
│   └── __tests__/
│       └── useHookName.test.ts
└── [other directories follow same pattern]
```

## 🧪 Test Types and Organization

### Unit Tests (Co-located)

Unit tests are placed in `__tests__` directories alongside the code they test:

- **Location**: `src/[module]/__tests__/[file].test.{ts,tsx}`
- **Purpose**: Test individual functions, components, and hooks in isolation
- **Naming**: `[ComponentName].test.tsx` or `[functionName].test.ts`

**Example Structure:**
```
src/components/ui/
├── Button.tsx
├── Modal.tsx
└── __tests__/
    ├── Button.test.tsx
    └── Modal.test.tsx
```

### Integration Tests (Co-located)

Integration tests are also co-located but use the `.integration.test.{ts,tsx}` suffix:

- **Location**: `src/[module]/__tests__/[file].integration.test.{ts,tsx}`
- **Purpose**: Test multiple components or modules working together
- **Naming**: `[FeatureName].integration.test.tsx`

### End-to-End Tests (Centralized by Feature)

E2E tests are organized by feature area in the `tests/e2e/` directory:

- **Admin Tests** (`tests/e2e/admin/`): Admin panel functionality
- **Guest Tests** (`tests/e2e/guest/`): Customer-facing features
- **System Tests** (`tests/e2e/system/`): Core system functionality

## 🔧 Configuration Files

### Main Test Configuration

**File**: `tests/config/vitest.config.ts`

Core test configuration that provides:
- Test environment setup (jsdom)
- Module resolution and aliases
- Coverage configuration
- Test utilities setup

### CI Test Configuration

**File**: `tests/config/vitest.config.ci.ts`

Optimized configuration for CI environments:
- Enhanced timeouts for stability
- Memory optimization
- Parallel execution limits
- CI-specific reporters

### Test Utilities

**File**: `tests/config/test-utils.tsx`

Enhanced React testing utilities providing:
- Custom render function with providers
- React 19 compatibility features
- Enhanced user interaction utilities
- Async operation helpers

## 📊 Shared Test Resources

### Fixtures

**File**: `tests/config/fixtures.ts`

Provides reusable mock data:
- Database entity mocks (drinks, orders, categories)
- Helper functions for creating test data
- Type-safe mock creators

**Usage Example:**
```typescript
import { createMockDrink, mockDrinkCategories } from '../../../tests/config/fixtures'

const testDrink = createMockDrink({ name: 'Test Coffee' })
```

### Mock Utilities

**File**: `tests/config/mocks.ts`

Common mocking patterns:
- Supabase client mocks
- React Router mocks
- DOM API mocks (fetch, localStorage, etc.)
- Static asset mocks (images, CSS)
- Console and timer utilities

**Usage Example:**
```typescript
import { createMockSupabaseClient, setupFakeTimers, mockStaticAsset } from '../../../tests/config/mocks'

const mockSupabase = createMockSupabaseClient()
const timers = setupFakeTimers()

// For components that import images
vi.mock('../assets/logo.png', () => ({ default: mockStaticAsset }))
```

## 🚀 Running Tests

### All Tests
```bash
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:ci           # CI mode with coverage
```

### Specific Test Types
```bash
# Unit tests only
npm run test:run src/

# E2E tests only  
npm run test:e2e

# Specific component
npm run test:run src/components/ui/__tests__/Button.test.tsx

# Specific pattern
npm run test:run --reporter=verbose OrderManagement
```

### CI Commands
```bash
npm run test:ci-no-coverage    # CI without coverage (faster)
npm run test:ci                # CI with coverage
```

## ✍️ Writing Tests

### Unit Test Example

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen } from '../../../tests/config/test-utils'
import { Button } from '../Button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
```

### Integration Test Example

```typescript
// src/components/menu/__tests__/DrinkManagement.integration.test.tsx
import { render, screen, waitFor } from '../../../tests/config/test-utils'
import { createMockSupabaseClient } from '../../../tests/config/mocks'
import { mockDrinks } from '../../../tests/config/fixtures'
import { DrinkManagement } from '../DrinkManagement'

// Mock the service
vi.mock('../../services/menuService', () => ({
  getDrinks: vi.fn(() => Promise.resolve(mockDrinks))
}))

describe('DrinkManagement Integration', () => {
  it('should load and display drinks', async () => {
    render(<DrinkManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Americano')).toBeInTheDocument()
    })
  })
})
```

### E2E Test Example

```typescript
// tests/e2e/guest/guest-experience-improvements.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Guest Experience', () => {
  test('should complete order flow', async ({ page }) => {
    await page.goto('/')
    
    // Select drink
    await page.click('[data-testid="drink-americano"]')
    
    // Fill guest info
    await page.fill('[name="customerName"]', 'John Doe')
    
    // Submit order
    await page.click('[data-testid="submit-order"]')
    
    // Verify success
    await expect(page.getByText('Order placed successfully')).toBeVisible()
  })
})
```

## 🔍 Test Patterns and Best Practices

### Naming Conventions

- **Test Files**: `[ComponentName].test.tsx`, `[hookName].test.ts`
- **Integration Tests**: `[FeatureName].integration.test.tsx`
- **E2E Tests**: `[feature-area].spec.ts`
- **Test Suites**: Use descriptive `describe()` blocks
- **Test Cases**: Use clear, behavior-focused names

### Import Patterns

```typescript
// Always use relative imports for test utilities
import { render, screen } from '../../../tests/config/test-utils'
import { createMockDrink } from '../../../tests/config/fixtures'
import { createMockSupabaseClient } from '../../../tests/config/mocks'

// Use absolute imports for source code
import { Button } from '@/components/ui/Button'
```

### Async Testing

```typescript
// Use act() for React state updates
import { actAsync } from '../../../tests/config/test-utils'

await actAsync(async () => {
  await user.click(button)
})

// Wait for elements
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

### Mock Setup

```typescript
// Clean setup/teardown
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})
```

## 📈 Coverage and Quality

### Coverage Requirements

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

### Quality Gates

1. **TypeScript**: No type errors
2. **Linting**: No ESLint errors
3. **Tests**: All tests passing
4. **Coverage**: Meet minimum thresholds
5. **E2E**: Critical paths covered

## 🔄 Migration Guide

When moving tests to the new structure:

1. **Move test files** to co-located `__tests__` directories
2. **Update imports** to use relative paths to test utilities
3. **Replace test utilities** with centralized versions
4. **Update mocks** to use shared mock utilities
5. **Verify tests** still pass after migration

## 🚨 Troubleshooting

### Common Issues

**Import Resolution**: Use relative imports for test utilities:
```typescript
// ❌ Wrong
import { render } from '@/test-utils'

// ✅ Correct  
import { render } from '../../../tests/config/test-utils'
```

**Path Depth**: Count directories carefully:
```bash
src/components/ui/__tests__/     # 3 levels: ../../../
src/hooks/__tests__/             # 2 levels: ../../
src/pages/admin/__tests__/       # 3 levels: ../../../
```

**React 19 Compatibility**: Use provided async utilities:
```typescript
// ❌ Avoid direct act() usage
act(() => { /* sync operation */ })

// ✅ Use provided utilities
actSync(() => { /* sync operation */ })
actAsync(async () => { /* async operation */ })
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright E2E Testing](https://playwright.dev/)
- [Project Testing Guidelines](../specs/definition_of_done.md)

## 🤝 Contributing

When adding new tests:

1. Follow the co-located structure for unit tests
2. Use shared utilities and fixtures when possible
3. Add E2E tests for new user-facing features
4. Update this documentation for new patterns
5. Ensure tests are deterministic and fast