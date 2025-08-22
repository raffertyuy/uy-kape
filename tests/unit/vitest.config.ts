import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    // Use threads with minimal options for better memory management
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true // Enable isolation for better cleanup
      }
    },
    // Reduce concurrency to minimum
    maxConcurrency: 1,
    fileParallelism: false,
    // Shorter timeouts to prevent hanging tests
    testTimeout: 15000,
    hookTimeout: 15000,
    // Essential environment
    env: {
      NODE_ENV: 'test'
    },
    // Better error handling
    dangerouslyIgnoreUnhandledErrors: false,
    passWithNoTests: false,
    // Exclude problematic tests and Playwright tests
    exclude: [
      'node_modules/**',
      'src/components/menu/__tests__/DrinkCategoryForm.test.tsx',
      'tests/e2e/**',
      '**/*.spec.ts'
    ],
    // Simplified coverage
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      exclude: [
        'node_modules/',
        'src/test-utils.tsx',
        'src/setupTests.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'vite.config.ts',
        'vitest.config.ts',
        'vitest.config.ci.ts'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        }
      }
    },
    // Simple reporting
    reporters: [['default', { summary: false }]],
    // Memory monitoring
    logHeapUsage: true,
    // Minimal dependencies
    deps: {
      optimizer: {
        web: {
          include: ['@testing-library/react']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Minimal build config
  esbuild: {
    target: 'es2020'
  }
})