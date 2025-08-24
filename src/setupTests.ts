import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, configure } from "@testing-library/react";
import { isCI, shouldUseMocks } from "@/lib/supabase";

// Global test setup and environment configuration for React 19
// This file is loaded before all tests as specified in vitest.config.ts

// Ensure proper test environment globals
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Conditionally mock Supabase based on environment
if (shouldUseMocks()) {
  // Use mocks for CI or when explicitly requested
  vi.mock("@/lib/supabase", async (importOriginal) => {
    const actual = await importOriginal() as any;
    const { createCompleteSupabaseClient, mockConfigurations } = await import(
      "../tests/config/supabase-mocks"
    );

    const mockClient = createCompleteSupabaseClient(
      mockConfigurations.basicMenu,
    );

    return {
      ...actual,
      supabase: mockClient,
    };
  });
}

// Log the test strategy being used
const strategy = shouldUseMocks() ? "mocks" : "real database";
const env = isCI() ? "CI" : "local";
console.log(`Test setup: Using ${strategy} in ${env} environment`);

// Configure global error handler to reduce verbosity in tests
import { configureGlobalErrorHandler } from "./utils/globalErrorHandler";
configureGlobalErrorHandler({
  enableLogging: import.meta.env.VITE_VITEST_DEBUG === "true",
  logLevel: "error",
  enableDevDetails: false,
});

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

// Enhanced console override to suppress noisy warnings in tests
const createFilteredConsole = (originalFn: typeof console.warn | typeof console.error) => {
  return (...args: any[]) => {
    const message = args[0];

    // Suppress React act() warnings unless debug mode is enabled
    if (
      typeof message === "string" &&
      import.meta.env.VITE_VITEST_DEBUG !== "true"
    ) {
      if (
        message.includes("Warning: An update to") &&
        message.includes("was not wrapped in act(...)")
      ) {
        return;
      }
      if (
        message.includes("Warning: You seem to have overlapping act() calls")
      ) {
        return;
      }
      if (message.includes("The current testing environment is not configured to support act")) {
        return;
      }
      // Suppress expected Supabase service error messages in tests
      if (message.includes("Supabase operation failed:")) {
        return;
      }
    }

    originalFn(...args);
  };
};

// Override console methods
console.warn = createFilteredConsole(originalConsole.warn);
console.error = createFilteredConsole(originalConsole.error);

// Reset storage and specific mocks before each test, but preserve component mocks
beforeEach(() => {
  sessionStorageMock.clear();
  localStorageMock.clear();
  // Only clear non-component mocks to avoid test interference
  if (global.fetch) {
    vi.mocked(global.fetch).mockClear();
  }

  // Reset console mocks but maintain filtering
  console.error = createFilteredConsole(originalConsole.error);
  console.warn = createFilteredConsole(originalConsole.warn);
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
