import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, configure } from "@testing-library/react";

// Global test setup and environment configuration for React 19
// This file is loaded before all tests as specified in vitest.config.ts

// Import environment detection utilities
const isCI = (): boolean => {
  return (
    process.env.CI === "true" ||
    process.env.GITHUB_ACTIONS === "true" ||
    Boolean(process.env.CI)
  );
};

const isTestEnv = (): boolean => {
  return process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
};

const shouldUseMocks = (): boolean => {
  // Always use mocks in CI environment
  if (isCI()) return true;

  // Check if we should force mocks for testing
  if (process.env.VITE_TEST_USE_MOCKS === 'true') return true;
  
  // Check if local database testing is explicitly enabled
  if (process.env.VITE_TEST_USE_LOCAL_DB === 'true') return false;

  // Default to mocks for safety in test environment
  return isTestEnv();
};

// Supabase mocking setup based on environment
if (shouldUseMocks()) {
  // Set up global Supabase mocking for CI environment or when mocks are forced
  // We'll use vi.doMock to mock the Supabase module
  vi.doMock("@/lib/supabase", async () => {
    const { createCompleteSupabaseClient, mockConfigurations } = await import(
      "../tests/config/supabase-mocks"
    );

    // Create mock client with basic menu data
    const mockClient = createCompleteSupabaseClient(
      mockConfigurations.basicMenu,
    );

    return {
      supabase: mockClient,
      isCI,
      isTestEnv,
      shouldUseMocks: () => true,
    };
  });
} else {
  // For local database testing, we still need to provide environment detection
  // but use the real Supabase client configured for local development
  vi.doMock("@/lib/supabase", async () => {
    const { createLocalSupabaseClient } = await import(
      "../tests/config/local-db-setup"
    );

    // Use local Supabase instance for integration testing
    const localClient = createLocalSupabaseClient();

    return {
      supabase: localClient,
      isCI,
      isTestEnv,
      shouldUseMocks: () => false,
    };
  });
}

// Configure React Testing Library for React 19 compatibility
configure({
  // Enable automatic cleanup after each test
  testIdAttribute: "data-testid",
  // Reduce async utilities timeout for faster tests
  asyncUtilTimeout: 5000,
  // React 19 specific configurations
  reactStrictMode: true,
  // Better error messages for debugging
  getElementError: (message: string | null, _container: Element) => {
    const error = new Error(message || "Element not found");
    error.name = "TestingLibraryElementError";
    if (error.stack) {
      error.stack = error.stack.split("\n").slice(1).join("\n");
    }
    return error;
  },
});

// Automatically cleanup DOM after each test to prevent interference
afterEach(() => {
  cleanup();
});

// Enhanced window.matchMedia mock for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Enhanced History API mock for React Router with proper state management
Object.defineProperty(window, "history", {
  value: {
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    pushState: vi.fn(),
    replaceState: vi.fn(),
    length: 1,
    state: null,
    scrollRestoration: "auto",
  },
  writable: true,
});

// Enhanced Location mock for React Router
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000/",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock IntersectionObserver for components that might use it
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver for components that might use it
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Enhanced sessionStorage mock
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: vi.fn(),
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock localStorage with similar functionality
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: vi.fn(),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock console methods for cleaner test output
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
};

// Reset storage and specific mocks before each test, but preserve component mocks
beforeEach(() => {
  sessionStorageMock.clear();
  localStorageMock.clear();
  // Only clear non-component mocks to avoid test interference
  if (global.fetch) {
    vi.mocked(global.fetch).mockClear();
  }

  // Reset console mocks but allow them through unless explicitly suppressed
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
});

// Clean up after each test
afterEach(() => {
  // Restore original console methods
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
  // Reset mocked module registry to avoid cross-file leakage
  try {
    vi.resetModules();
  } catch {
    // ignore if not available in this environment
  }
});

// Global error handler for unhandled promise rejections in tests
const unhandledRejections: Array<
  { reason: unknown; promise: Promise<unknown> }
> = [];

// Single global handler that won't be duplicated
const handleUnhandledRejection = (
  reason: unknown,
  promise: Promise<unknown>,
) => {
  unhandledRejections.push({ reason, promise });
  // Suppress noisy warnings in test environment unless critical
  if (import.meta.env.MODE !== "test" || import.meta.env.VITE_VITEST_DEBUG) {
    console.warn("Unhandled Promise Rejection:", reason);
  }
};

// Add the listener only once
if (!process.listenerCount("unhandledRejection")) {
  process.on("unhandledRejection", handleUnhandledRejection);
}

// Check for unhandled rejections after each test
afterEach(() => {
  if (unhandledRejections.length > 0) {
    const rejections = [...unhandledRejections];
    unhandledRejections.length = 0; // Clear the array
    // Only log in debug mode to reduce noise
    if (import.meta.env.VITE_VITEST_DEBUG) {
      console.warn(
        `${rejections.length} unhandled promise rejection(s) detected:`,
        rejections,
      );
    }
  }
});

// Setup fetch mock for API testing
global.fetch = vi.fn();

// Reset fetch mock before each test
beforeEach(() => {
  if (global.fetch) {
    vi.mocked(global.fetch).mockClear();
  }
});

// Log the test strategy being used
const strategy = shouldUseMocks() ? "mocks" : "real database";
const env = isCI() ? "CI" : "local";
console.log(`Test setup: Using ${strategy} in ${env} environment`);
