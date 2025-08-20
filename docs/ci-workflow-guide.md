# CI Workflow Guide for React + Supabase

This document provides comprehensive guidance for understanding and troubleshooting the continuous integration workflows for the Uy, Kape! project, which uses React.js + Vite + Supabase.

## CI Workflow Overview for React + Supabase

The Uy, Kape! project implements a multi-workflow CI/CD pipeline optimized for React + TypeScript + Supabase development:

### Primary Workflows

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - **Triggers**: Push and Pull Request to main branch
   - **Purpose**: Core build, test, and quality checks
   - **Node Versions**: 18.x and 20.x (matrix strategy)
   - **Key Steps**: TypeScript compilation, ESLint, Vitest testing, Vite build

2. **Security Scan** (`.github/workflows/security.yml`)
   - **Triggers**: Push and Pull Request to main branch  
   - **Purpose**: Security vulnerability scanning and React/Supabase specific checks
   - **Key Features**: npm audit, hardcoded secrets detection, React anti-pattern scanning

3. **Performance Analysis** (`.github/workflows/performance.yml`)
   - **Triggers**: Pull Request to main branch
   - **Purpose**: Vite bundle analysis and mobile performance validation
   - **Output**: PR comments with bundle size analysis and optimization recommendations

4. **Supabase Integration** (`.github/workflows/supabase-validation.yml`)
   - **Triggers**: Push and Pull Request to main branch
   - **Purpose**: Validate Supabase configuration, migrations, and integration
   - **Key Features**: Schema validation, environment variable checks, real-time feature testing

5. **Line Endings Check** (`.github/workflows/check-line-endings.yml`)
   - **Triggers**: Push and Pull Request to main branch
   - **Purpose**: Ensure consistent line endings across the codebase

## Workflow Triggers and Branch Protection

### Trigger Strategy
- **Push to main**: All workflows execute to validate the main branch
- **Pull Requests**: All workflows execute to validate proposed changes
- **Performance Analysis**: Only on PRs to avoid unnecessary main branch noise

### Optimization Features
- **Change Detection**: CI workflow includes path filtering to skip unnecessary runs
- **Caching Strategy**: Aggressive caching for npm, Vite, and TypeScript compilation
- **Parallel Execution**: Multiple jobs run simultaneously where possible
- **Matrix Strategy**: Test against multiple Node.js versions for compatibility

## React Component Testing Best Practices

### Test Structure
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import YourComponent from '../YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### Coverage Requirements
- **Branches**: 80% minimum
- **Functions**: 80% minimum  
- **Lines**: 80% minimum
- **Statements**: 80% minimum

### Test Categories
1. **Component Rendering**: Verify components render without crashing
2. **User Interactions**: Test click handlers, form submissions, keyboard navigation
3. **Props Validation**: Ensure components handle different prop combinations
4. **Accessibility**: Verify ARIA attributes and keyboard navigation
5. **Error Boundaries**: Test error handling and fallback UI

## Supabase Integration Testing Guide

### Environment Variables
Required environment variables for local development:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Schema Validation
The CI pipeline validates:
- Migration file presence and structure
- Required tables for coffee shop functionality
- Row Level Security (RLS) policies
- Seed data integrity

### Real-time Features Testing
Tests verify implementation of:
- Channel subscriptions for menu updates
- Real-time order status changes
- Connection status indicators
- Proper cleanup on component unmount

### Integration Test Patterns
```typescript
// Supabase integration test example
import { createClient } from '@supabase/supabase-js'

// Mock Supabase in tests
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}))
```

## Vite Build Optimization Tips

### Bundle Analysis
The performance workflow provides:
- Chunk size analysis
- Code splitting opportunities identification
- Mobile performance metrics
- Supabase client bundle impact assessment

### Optimization Strategies
1. **Lazy Loading**: Use `React.lazy()` for route-based code splitting
2. **Dynamic Imports**: Import large libraries only when needed
3. **Tree Shaking**: Ensure unused Supabase features are excluded
4. **Asset Optimization**: Optimize images and use modern formats

### Vite-Specific Optimizations
```typescript
// vite.config.ts optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
```

## Troubleshooting Common React/Supabase Issues

### Build Failures

**TypeScript Compilation Errors**
- Check `tsconfig.json` configuration
- Verify all imports have proper file extensions
- Ensure TypeScript version compatibility

**ESLint Errors**
- Review `eslint.config.js` for React and accessibility rules
- Use `npm run lint -- --fix` for auto-fixable issues
- Check for missing `aria-label` attributes on interactive elements

### Test Failures

**React Testing Library Issues**
- Ensure `@testing-library/jest-dom` is properly configured
- Use `screen.debug()` to inspect rendered output
- Check for proper `await` usage with async queries

**Supabase Mocking Problems**
- Verify mock implementations match actual Supabase API
- Use `vi.clearAllMocks()` in test cleanup
- Mock real-time subscriptions properly

### Performance Issues

**Large Bundle Sizes**
- Analyze bundle composition in PR comments
- Check for duplicate dependencies
- Ensure proper tree shaking configuration

**Slow Test Execution**
- Review test isolation and cleanup
- Use `vi.mock()` for expensive operations
- Consider test file organization and parallelization

## Local Development Setup with Supabase

### Initial Setup
1. Install Supabase CLI: `curl -fsSL https://supabase.com/install.sh | sh` (or download from GitHub releases)
2. Login: `supabase login`
3. Initialize project: `supabase init` (if not already done)
4. Link to remote project: `supabase link --project-ref your-project-ref`

### Database Development
1. Start local development: `supabase start`
2. Apply migrations: `supabase db reset`
3. Generate TypeScript types: `supabase gen types typescript --local > src/types/database.types.ts`

### Environment Configuration
Create `.env` file with local Supabase credentials:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

## Mobile-First Performance Guidelines

### Critical Performance Metrics
- **First Contentful Paint**: < 1.5s on 3G
- **Largest Contentful Paint**: < 2.5s on 3G  
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Coffee Shop App Optimizations
1. **Menu Loading**: Implement progressive loading for large menus
2. **Image Optimization**: Use WebP format with fallbacks
3. **Offline Support**: Cache menu data for offline browsing
4. **Touch Interactions**: Ensure 44px minimum touch targets

### Performance Testing
```javascript
// Performance monitoring example
import { getCLS, getFID, getFCP, getLCP } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
```

## Workflow Maintenance

### Regular Tasks
- Update Node.js versions in matrix strategy
- Review and update ESLint rules quarterly
- Monitor bundle size trends in performance reports
- Update Supabase CLI installation method in workflows as needed

### Security Considerations
- Rotate secrets regularly
- Review dependency updates for security patches
- Monitor CodeQL findings and address promptly
- Validate environment variable exposure

### Documentation Updates
- Update this guide when workflows change
- Document new testing patterns as they emerge
- Maintain troubleshooting section with common issues
- Keep performance benchmarks current

## Quick Reference Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Build for production
npm run build

# Start local Supabase
supabase start

# Reset local database
supabase db reset

# Generate types
supabase gen types typescript --local > src/types/database.types.ts
```

### CI/CD Debugging
```bash
# Test workflows locally with act (if installed)
act -j ci

# Check workflow syntax
gh workflow validate

# View workflow runs
gh run list

# Download workflow artifacts
gh run download <run-id>
```

## Contact and Support

For issues with CI workflows:
1. Check workflow run logs in GitHub Actions
2. Review this documentation for troubleshooting steps
3. Ensure local environment matches CI configuration
4. Test changes locally before pushing

Remember: The CI pipeline is designed to catch issues early and maintain code quality. Understanding these workflows helps ensure smooth development and deployment of the Uy, Kape! coffee ordering system.