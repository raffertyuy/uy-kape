# Dual Strategy Testing Guide

This guide explains the dual strategy testing approach for Uy, Kape!, which allows tests to run with mocks (CI) or against a local Supabase database (development).

## Setup

### 1. Environment Files

Copy the template files and customize:

```bash
# For development
cp .env.example .env

# For testing  
cp .env.test.example .env.test.local
```

### 2. Local Database Testing

```bash
# Start Supabase and run tests
npm run db:setup
npm run test:local-db
```

### 3. Mock Testing (Default)

```bash
# Run with mocks (no setup needed)
npm run test
```

## Strategy Selection

The system automatically selects the appropriate testing strategy:

- **CI Environment**: Always uses mocks
- **Local with VITE_TEST_USE_MOCKS=true**: Forces mocks
- **Local with VITE_TEST_USE_LOCAL_DB=true**: Uses local database
- **Default**: Uses mocks for safety

## Environment Variables

| Variable | Purpose | Values | Default |
|----------|---------|--------|---------|
| VITE_TEST_USE_MOCKS | Force mock strategy | true/false | Auto-detected |
| VITE_TEST_USE_LOCAL_DB | Force local DB strategy | true/false | false |
| CI | CI environment detection | true/false | Auto-detected |

## Files

- `.env.example` → `.env` (development configuration)
- `.env.test.example` → `.env.test.local` (test configuration)  
- `.env.ci` (CI configuration with mocks)

## npm Scripts

```bash
# Mock testing
npm run test              # Default (mocks)
npm run test:mocks       # Force mocks

# Local database testing  
npm run test:local-db    # Force local DB
npm run db:setup         # Start Supabase + reset DB
```
