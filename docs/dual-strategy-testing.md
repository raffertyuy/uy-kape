# Dual Strategy Testing Guide

This document explains the dual strategy testing approach implemented for the Uy, Kape! application, which allows tests to run either with comprehensive mocks (for CI environments) or against a real local Supabase database (for development).

## Overview

The dual strategy testing system provides:

- **CI Environment**: Fast, reliable tests using comprehensive mocks
- **Local Development**: Integration tests against real Supabase database  
- **Automatic Detection**: Environment-based strategy selection
- **Manual Override**: Environment variables to force specific strategies

## Strategy Selection

The system automatically selects the appropriate testing strategy based on environment detection:

```typescript
// Automatic strategy selection logic
const shouldUseMocks = (): boolean => {
  // Always use mocks in CI environment
  if (isCI()) return true;

  // Check for manual overrides
  if (process.env.VITE_TEST_USE_MOCKS === 'true') return true;
  if (process.env.VITE_TEST_USE_LOCAL_DB === 'true') return false;

  // Default to mocks for safety
  return isTestEnv();
};
```

## Environment Variables

| Variable | Purpose | Values | Default |
|----------|---------|--------|---------|
| `VITE_TEST_USE_MOCKS` | Force mock strategy | `true`/`false` | Based on environment |
| `VITE_TEST_USE_LOCAL_DB` | Force local DB strategy | `true`/`false` | `false` |
| `CI` | CI environment detection | `true`/`false` | Auto-detected |
| `VITE_VITEST_DEBUG` | Enable debug logging | `true`/`false` | `false` |

## Quick Start

### 1. CI/Mock Testing (Default)
```bash
# Run tests with mocks (default behavior)
npm run test

# Force mock strategy
npm run test:mocks
```

### 2. Local Database Testing
```bash
# Start Supabase local instance
npm run supabase:start

# Run tests against local database
npm run test:local-db

# Or use the PowerShell script (Windows)
npm run db:test
```

### 3. Using PowerShell Script (Windows)
```powershell
# Check status
.\scripts\test-local-db.ps1 status

# Start Supabase and run tests
.\scripts\test-local-db.ps1 setup
.\scripts\test-local-db.ps1 test

# Stop when done
.\scripts\test-local-db.ps1 stop
```

## Configuration Files

### Test Environment Files

- **`.env.test.local`**: Local development test configuration
- **`.env.ci`**: CI-specific configuration
- **`tests/config/test-environment.ts`**: Environment detection utilities

### Vitest Configurations

- **`vitest.config.ts`**: Standard local development configuration
- **`tests/config/vitest.config.ci.ts`**: CI-optimized configuration

## Mock Implementation

### Comprehensive Supabase Mocks

The mock implementation provides complete Supabase API coverage:

```typescript
// Complete method chaining support
const mockClient = createCompleteSupabaseClient();

// All operations return proper mock responses
await mockClient.from('drinks').select('*').eq('category', 'coffee');
await mockClient.auth.signIn({ email, password });
await mockClient.storage.from('images').upload('file.jpg', file);
```

### Mock Configurations

Pre-configured data sets for different testing scenarios:

- `basicMenu`: Standard coffee shop menu data
- `emptyMenu`: Empty data for edge case testing
- `complexMenu`: Full menu with all options and categories

## Local Database Setup

### Prerequisites

1. **Docker Desktop**: Required for Supabase local development
2. **Supabase CLI**: Install from [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
3. **PostgreSQL Tools** (optional): For direct database access

### Database Schema

The local database uses:
- **Schema**: `database/schema.sql` - Table definitions and constraints
- **Seed Data**: `supabase/seed.sql` - Initial test data
- **Configuration**: `supabase/config.toml` - Local Supabase settings

### Local Database URLs

When running locally:
- **API URL**: `http://127.0.0.1:54321`
- **Studio URL**: `http://127.0.0.1:54323`
- **Database URL**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## Testing Strategies

### When to Use Mocks

✅ **Use mocks for**:
- CI/CD pipelines
- Unit tests focused on component logic
- Tests that need deterministic data
- Fast feedback during development
- Testing error conditions and edge cases

### When to Use Local Database

✅ **Use local database for**:
- Integration testing
- End-to-end testing
- Database query optimization
- Testing real data relationships
- Performance testing

## Common Commands

### Development Workflow
```bash
# Start development with local database
npm run supabase:start
npm run dev

# Run tests in watch mode with local database
npm run test:local-db:watch
```

### CI/CD Workflow
```bash
# CI automatically uses mocks
npm run test:ci-no-coverage
```

### Database Management
```bash
# Reset database to clean state
npm run supabase:reset

# Check Supabase status
npm run supabase:status

# Stop all services
npm run supabase:stop
```

## Troubleshooting

### Common Issues

**"Supabase is not running"**
```bash
# Check Docker is running
docker info

# Start Supabase
npm run supabase:start

# Check status
npm run db:status
```

**"Cannot connect to database"**
```bash
# Verify ports are not in use
netstat -an | findstr "54321\|54322\|54323"

# Reset Supabase completely
npm run supabase:stop
npm run supabase:start
```

**"Tests fail with real database but pass with mocks"**
- Check database schema is up to date
- Verify seed data is properly loaded
- Ensure tests clean up after themselves
- Check for test isolation issues

### Debug Mode

Enable detailed logging:
```bash
# Enable debug logging
export VITE_VITEST_DEBUG=true
npm run test:local-db
```

### Performance Optimization

For faster local database tests:
```bash
# Skip coverage collection
npm run test:local-db

# Use parallel execution
npm run test:local-db -- --reporter=dot
```

## Architecture

### File Structure
```
tests/
├── config/
│   ├── local-db-setup.ts          # Local database utilities
│   ├── mocks.ts                   # Basic mock utilities  
│   ├── supabase-mocks.ts          # Comprehensive Supabase mocks
│   ├── test-environment.ts        # Environment detection
│   └── vitest.config.ci.ts        # CI test configuration
├── e2e/                           # End-to-end tests
└── outputs/                       # Test result outputs

src/
├── setupTests.ts                  # Global test setup
└── lib/
    └── supabase.ts               # Supabase client with environment detection

scripts/
└── test-local-db.ps1             # Windows PowerShell test script

.env.test.local                   # Local test configuration
.env.ci                          # CI test configuration
```

### Environment Detection Flow

```mermaid
graph TD
    A[Test Start] --> B{CI Environment?}
    B -->|Yes| C[Use Mocks]
    B -->|No| D{VITE_TEST_USE_MOCKS=true?}
    D -->|Yes| C
    D -->|No| E{VITE_TEST_USE_LOCAL_DB=true?}
    E -->|Yes| F[Use Local Database]
    E -->|No| G{Test Environment?}
    G -->|Yes| C
    G -->|No| F
```

## Best Practices

### Test Design

1. **Write tests that work with both strategies**
   - Use consistent data expectations
   - Avoid hard-coding IDs or timestamps
   - Test business logic, not implementation details

2. **Use appropriate test levels**
   - Unit tests: Always use mocks
   - Integration tests: Prefer local database
   - E2E tests: Use real services

3. **Clean up after tests**
   - Reset database state between tests
   - Clear mock state appropriately
   - Avoid test pollution

### Performance Considerations

1. **Local database tests are slower**
   - Reserve for integration scenarios
   - Use mocks for quick feedback
   - Consider parallel execution

2. **CI optimization**
   - Always use mocks in CI
   - Enable coverage only when needed
   - Use appropriate reporters

## Migration Guide

### From Pure Mocks to Dual Strategy

1. **Update test setup**
   - Install cross-env dependency
   - Configure environment variables
   - Update npm scripts

2. **Review existing tests**
   - Ensure tests work with real data
   - Add database cleanup if needed
   - Update assertions for dynamic data

3. **Configure CI**
   - Verify CI uses mock strategy
   - Update environment variables
   - Test pipeline thoroughly

### From Real Database to Dual Strategy

1. **Add mock support**
   - Implement comprehensive mocks
   - Configure mock data sets
   - Update test setup

2. **Update local development**
   - Configure Supabase local
   - Set up database scripts
   - Document setup process

This dual strategy provides the best of both worlds: fast, reliable CI tests with comprehensive mocks, and thorough integration testing with real database connectivity during development.