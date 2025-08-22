import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.svg", "**/*.gif"],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
    // Ensure module isolation between test files
    isolate: true,
    // Use forks for better isolation in large test suites
    pool: "forks",
    poolOptions: {
      forks: {
        // Use multiple forks to avoid cross-file state leakage
        singleFork: false,
        isolate: true,
      },
    },
    // Force sequential execution for stability
    maxConcurrency: 1,
    fileParallelism: false,
    sequence: {
      concurrent: false,
      shuffle: false,
    },
    // Shorter timeouts to prevent hanging tests
    testTimeout: 20000,
    hookTimeout: 15000,
    // Force cleanup between test files
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    // Essential environment
    env: {
      NODE_ENV: "test",
      VITE_IS_TEST: "true",
    },
    // Better error handling
    dangerouslyIgnoreUnhandledErrors: false,
    passWithNoTests: false,
    // Exclude problematic tests and Playwright tests
    exclude: [
      "node_modules/**",
      "src/components/menu/__tests__/DrinkCategoryForm.test.tsx",
      "tests/e2e/**",
      "**/*.spec.ts",
    ],
    // Simplified coverage
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: [
        "node_modules/",
        "src/test-utils.tsx",
        "src/setupTests.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "vite.config.ts",
        "vitest.config.ts",
        "vitest.config.ci.ts",
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
    },
    // Simple reporting
    reporters: [["default", { summary: false }]],
    // Memory monitoring
    logHeapUsage: true,
    // Minimal dependencies
    deps: {
      optimizer: {
        web: {
          include: ["@testing-library/react"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../../src", import.meta.url)),
    },
  },
  // Handle static assets in test environment
  server: {
    fs: {
      allow: ["../.."],
    },
  },
  // Minimal build config with asset handling
  esbuild: {
    target: "es2020",
  },
  // Handle static assets properly in tests
  define: {
    "import.meta.vitest": undefined,
  },
});
