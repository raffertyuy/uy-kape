/**
 * Shared mock utilities for testing
 * Common mocking patterns and mock implementations
 */

import { vi } from "vitest";

// ===== STATIC ASSET MOCKS =====

/**
 * Mock for static assets (images, fonts, etc.)
 * Used to handle imports of static files in tests
 */
export const mockStaticAsset = "/test-assets/mock-asset.png";

/**
 * Mock CSS module exports
 */
export const mockCSSModule = {};

// ===== SUPABASE MOCKS =====

/**
 * Creates a mock Supabase client for testing
 */
export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      data: [],
      error: null,
    })),
    insert: vi.fn(() => ({
      data: null,
      error: null,
    })),
    update: vi.fn(() => ({
      data: null,
      error: null,
    })),
    delete: vi.fn(() => ({
      data: null,
      error: null,
    })),
    eq: vi.fn(() => ({
      data: [],
      error: null,
    })),
    order: vi.fn(() => ({
      data: [],
      error: null,
    })),
    single: vi.fn(() => ({
      data: null,
      error: null,
    })),
  })),
});

/**
 * Creates a successful Supabase response
 */
export const createSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
  status: 200,
  statusText: "OK",
});

/**
 * Creates a failed Supabase response
 */
export const createErrorResponse = (message: string, code?: string) => ({
  data: null,
  error: {
    message,
    code: code || "GENERIC_ERROR",
    details: "",
    hint: "",
  },
  status: 400,
  statusText: "Bad Request",
});

// ===== ROUTER MOCKS =====

/**
 * Creates a mock React Router navigate function
 */
export const createMockNavigate = () => vi.fn();

/**
 * Creates a mock React Router location object
 */
export const createMockLocation = (pathname = "/", search = "", hash = "") => ({
  pathname,
  search,
  hash,
  state: null,
  key: "default",
});

// ===== ERROR CONTEXT MOCKS =====

/**
 * Creates a mock error context value
 */
export const createMockErrorContext = () => ({
  errors: [],
  reportError: vi.fn(),
  clearError: vi.fn(),
  clearAllErrors: vi.fn(),
});

// ===== LOCAL STORAGE MOCKS =====

/**
 * Creates a mock localStorage implementation
 */
export const createMockLocalStorage = () => {
  const storage: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    length: 0,
    key: vi.fn(),
  };
};

// ===== DOM MOCKS =====

/**
 * Creates a mock fetch implementation
 */
export const createMockFetch = (
  responses: Array<{ url?: string; response: unknown }> = [],
) => {
  let callIndex = 0;

  return vi.fn((url: string) => {
    const mockResponse = responses[callIndex] ||
      responses.find((r) => !r.url || r.url === url);
    callIndex++;

    if (!mockResponse) {
      return Promise.reject(new Error(`No mock response defined for ${url}`));
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse.response),
      text: () => Promise.resolve(JSON.stringify(mockResponse.response)),
    });
  });
};

/**
 * Creates a mock IntersectionObserver
 */
export const createMockIntersectionObserver = () => {
  const mockObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  vi.stubGlobal("IntersectionObserver", mockObserver);
  return mockObserver;
};

/**
 * Creates a mock ResizeObserver
 */
export const createMockResizeObserver = () => {
  const mockObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  vi.stubGlobal("ResizeObserver", mockObserver);
  return mockObserver;
};

// ===== TIMER MOCKS =====

/**
 * Sets up fake timers for testing
 */
export const setupFakeTimers = () => {
  vi.useFakeTimers();
  return {
    advance: (ms: number) => vi.advanceTimersByTime(ms),
    runAll: () => vi.runAllTimers(),
    restore: () => vi.useRealTimers(),
  };
};

// ===== CONSOLE MOCKS =====

/**
 * Mocks console methods and provides utilities to check calls
 */
export const createMockConsole = () => {
  const originalConsole = global.console;

  const mocks = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  global.console = { ...originalConsole, ...mocks };

  return {
    mocks,
    restore: () => {
      global.console = originalConsole;
    },
    getCalls: (method: keyof typeof mocks) => mocks[method].mock.calls,
    getLastCall: (method: keyof typeof mocks) => {
      const calls = mocks[method].mock.calls;
      return calls[calls.length - 1];
    },
  };
};

// ===== ASYNC UTILITIES =====

/**
 * Waits for all pending promises to resolve
 */
export const flushPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Waits for the next microtask
 */
export const nextTick = () =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 0);
  });

/**
 * Resolves a promise with a delay
 */
export const resolveAfter = <T>(value: T, ms: number): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/**
 * Rejects a promise with a delay
 */
export const rejectAfter = (error: Error, ms: number): Promise<never> =>
  new Promise((_, reject) => setTimeout(() => reject(error), ms));

// ===== FORM MOCKS =====

/**
 * Creates a mock form submission event
 */
export const createMockFormEvent = (formData: Record<string, string> = {}) => {
  const mockForm = document.createElement("form");
  Object.entries(formData).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.name = name;
    input.value = value;
    mockForm.appendChild(input);
  });

  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: mockForm,
    currentTarget: mockForm,
  } as unknown as React.FormEvent<HTMLFormElement>;
};

/**
 * Creates a mock input change event
 */
export const createMockChangeEvent = (name: string, value: string) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: {
    name,
    value,
    type: "text",
  },
} as unknown as React.ChangeEvent<HTMLInputElement>);

// ===== CLEANUP UTILITIES =====

/**
 * Restores all mocks and cleans up after tests
 */
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.useRealTimers();
};
