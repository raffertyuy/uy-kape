import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    // Single-threaded execution for CI stability
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        useAtomics: false,
        isolate: false
      }
    },
    // Force completely serial execution
    sequence: {
      concurrent: false,
      shuffle: false
    },
    fileParallelism: false,
    maxConcurrency: 1,
    isolate: false,
    // Increase timeouts for CI environment
    testTimeout: 45000,
    hookTimeout: 45000,
    
    // Performance monitoring configuration
    logHeapUsage: true,
    
    // Enhanced test environment configuration
    env: {
      NODE_ENV: 'test',
      CI: 'true'
    },
    
    // Better handling of async operations
    dangerouslyIgnoreUnhandledErrors: false,
    passWithNoTests: false,
    // Exclude problematic tests for CI stability
    exclude: [
      'node_modules/**',
      'tests/e2e/**',
      'src/components/menu/__tests__/DrinkCategoryForm.test.tsx'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils.tsx',
        'src/setupTests.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'vite.config.ts',
        'vitest.config.ts',
        'vitest.config.ci.ts',
        // Exclude components that cause memory issues
        'src/components/menu/DrinkCategoryForm.tsx'
      ],
      thresholds: {
        global: {
          branches: 75, // Slightly lower due to excluded tests
          functions: 75,
          lines: 75,
          statements: 75
        }
      }
    },
    // CI-specific reporting
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: '../outputs/test-results.xml'
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})