# Testing Setup and Configuration

This document explains the testing setup for the Uy, Kape! application, including how Supabase mocking is configured for unit tests and how to set up local Supabase for development and testing.

## Test Structure

The project uses Vitest for unit testing with the following structure:

- **Unit tests**: Located in `__tests__` folders alongside the code they test
- **Test configuration**: Centralized in `tests/config/`
- **E2E tests**: Located in `tests/e2e/` (uses Playwright)
- **Test outputs**: Reports and artifacts in `tests/outputs/`

## Supabase Mocking Strategy

### Global Mocking Setup

The project uses a comprehensive global mocking strategy for Supabase in unit tests:

1. **Global mocks** are configured in `src/setupTests.ts`
2. **Supabase client** is mocked at the module level using `vi.mock()`
3. **All Supabase operations** return predictable mock responses
4. **No real HTTP requests** are made during unit tests

### Mock Configuration

The global setup includes:

- Mock for `@supabase/supabase-js` module
- Mock for local `@/lib/supabase` client
- Comprehensive query builder mocks (select, insert, update, delete, etc.)
- Mock auth methods
- Mock real-time subscriptions

### Benefits

- **Fast tests**: No network requests or database connections
- **Reliable**: Tests don't depend on external services
- **Isolated**: Each test runs independently
- **Predictable**: Mock responses are consistent

## Local Supabase for Development

For development and integration testing with a real database, you can use local Supabase:

### Prerequisites

- Docker Desktop installed and running
- Supabase CLI (available as dev dependency)

### Setup Local Supabase

1. **Start local Supabase**:
   ```bash
   npx supabase start
   ```

2. **Configure environment**:
   Create a `.env` file with local Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   ```

3. **Run the application**:
   ```bash
   npm run dev
   ```

4. **Access Supabase Studio**: http://127.0.0.1:54323

### Testing with Local Supabase

Unit tests will always use mocks regardless of environment configuration. To test against a real local database:

1. Use integration tests or E2E tests
2. Set up test data using Supabase seeding
3. Use Playwright tests for full end-to-end scenarios

## Test Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with CI configuration
npm run test:ci

# Run E2E tests
npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Tests hanging**: Usually caused by unmocked async operations
2. **Flaky tests**: Often due to timing issues or shared state
3. **Memory leaks**: Check for uncleared timers or subscriptions

### Debugging Tests

1. Use `console.log` in tests for debugging
2. Run single test files: `npx vitest run path/to/test.ts`
3. Use `--reporter=verbose` for detailed output
4. Check test isolation with `--no-coverage` flag

### Mock Issues

If you encounter Supabase-related errors in tests:

1. Verify global mocks are properly configured in `setupTests.ts`
2. Check that no real Supabase client is being imported before mocks are applied
3. Ensure test cleanup is properly configured

## Best Practices

1. **Keep tests fast**: Use mocks for external dependencies
2. **Test behavior, not implementation**: Focus on what the code does, not how
3. **Isolate tests**: Each test should be independent
4. **Clean up**: Use proper cleanup in test hooks
5. **Mock at the right level**: Mock at module boundaries, not internal functions

## Configuration Files

- `tests/config/vitest.config.ts`: Development test configuration
- `tests/config/vitest.config.ci.ts`: CI test configuration
- `src/setupTests.ts`: Global test setup and mocks
- `tests/config/test-utils.tsx`: Testing utilities and custom render functions
- `tests/config/mocks.ts`: Shared mock utilities (legacy, prefer global mocks)