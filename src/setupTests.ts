import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, configure } from "@testing-library/react";

// Global test setup and environment configuration for React 19
// This file is loaded before all tests as specified in vitest.config.ts

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

// ===== SUPABASE MOCKS =====

// Create a comprehensive mock for Supabase client
const createMockSupabaseResponse = (data: any = null, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
});

const createMockSupabaseQuery = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  containedBy: vi.fn().mockReturnThis(),
  rangeGt: vi.fn().mockReturnThis(),
  rangeGte: vi.fn().mockReturnThis(),
  rangeLt: vi.fn().mockReturnThis(),
  rangeLte: vi.fn().mockReturnThis(),
  rangeAdjacent: vi.fn().mockReturnThis(),
  overlaps: vi.fn().mockReturnThis(),
  textSearch: vi.fn().mockReturnThis(),
  match: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(createMockSupabaseResponse(null, null)),
  maybeSingle: vi.fn().mockResolvedValue(createMockSupabaseResponse(null, null)),
  csv: vi.fn().mockResolvedValue(createMockSupabaseResponse(null, null)),
  geojson: vi.fn().mockResolvedValue(createMockSupabaseResponse(null, null)),
  explain: vi.fn().mockResolvedValue(createMockSupabaseResponse(null, null)),
  rollback: vi.fn().mockResolvedValue(createMockSupabaseResponse(null, null)),
  returns: vi.fn().mockReturnThis(),
  then: vi.fn().mockResolvedValue(createMockSupabaseResponse([], null))
});

const mockSupabaseClient = {
  from: vi.fn(() => createMockSupabaseQuery()),
  rpc: vi.fn().mockResolvedValue(createMockSupabaseResponse(null, null)),
  schema: vi.fn().mockReturnThis(),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signIn: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn().mockReturnThis()
  })),
  removeChannel: vi.fn(),
  removeAllChannels: vi.fn(),
  getChannels: vi.fn(() => [])
};

// Mock the Supabase module globally
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

// Mock the local supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient
}));

// Reset fetch mock before each test
beforeEach(() => {
  if (global.fetch) {
    vi.mocked(global.fetch).mockClear();
  }
  
  // Reset Supabase mocks
  Object.values(mockSupabaseClient).forEach(method => {
    if (typeof method === 'function') {
      vi.mocked(method).mockClear();
    }
  });
  
  // Reset the from() method to return fresh query objects
  vi.mocked(mockSupabaseClient.from).mockImplementation(() => createMockSupabaseQuery());
});
