/**
 * Dedicated Supabase mocking utilities for comprehensive testing
 * Provides complete mock implementations for all Supabase service methods
 */

import { vi } from "vitest";

/**
 * Types for mock configuration
 */
export interface MockSupabaseResponse<T = unknown> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
  status: number;
  statusText: string;
  count?: number | null;
}

export interface MockTableData {
  [tableName: string]: unknown[];
}

export interface MockTableErrors {
  [tableName: string]: {
    message: string;
    code?: string;
  } | null;
}

/**
 * Creates a comprehensive mock Supabase query builder that supports full method chaining
 */
export const createCompleteMockQueryBuilder = (
  mockData: unknown[] = [],
  mockError: { message: string; code?: string } | null = null,
  _tableName = "unknown_table",
) => {
  const createResponse = (
    data: unknown = mockData,
    error = mockError,
  ): MockSupabaseResponse => ({
    data,
    error,
    status: error ? 400 : 200,
    statusText: error ? "Bad Request" : "OK",
    count: Array.isArray(data) ? data.length : null,
  });

  const builder = {
    // Core query methods
    select: vi.fn((_columns?: string) => builder),

    // Filter methods
    eq: vi.fn((_column: string, _value: unknown) => builder),
    neq: vi.fn((_column: string, _value: unknown) => builder),
    gt: vi.fn((_column: string, _value: unknown) => builder),
    gte: vi.fn((_column: string, _value: unknown) => builder),
    lt: vi.fn((_column: string, _value: unknown) => builder),
    lte: vi.fn((_column: string, _value: unknown) => builder),
    like: vi.fn((_column: string, _pattern: string) => builder),
    ilike: vi.fn((_column: string, _pattern: string) => builder),
    is: vi.fn((_column: string, _value: unknown) => builder),
    in: vi.fn((_column: string, _values: unknown[]) => builder),
    contains: vi.fn((_column: string, _value: unknown) => builder),
    containedBy: vi.fn((_column: string, _value: unknown) => builder),
    rangeGt: vi.fn((_column: string, _range: string) => builder),
    rangeGte: vi.fn((_column: string, _range: string) => builder),
    rangeLt: vi.fn((_column: string, _range: string) => builder),
    rangeLte: vi.fn((_column: string, _range: string) => builder),
    rangeAdjacent: vi.fn((_column: string, _range: string) => builder),
    overlaps: vi.fn((_column: string, _value: unknown) => builder),
    textSearch: vi.fn((_column: string, _query: string) => builder),
    match: vi.fn((_query: Record<string, unknown>) => builder),
    not: vi.fn((_column: string, _operator: string, _value: unknown) =>
      builder
    ),
    or: vi.fn((_filters: string) => builder),
    filter: vi.fn((_column: string, _operator: string, _value: unknown) =>
      builder
    ),

    // Modifier methods
    order: vi.fn((_column: string, _options?: { ascending?: boolean }) =>
      builder
    ),
    limit: vi.fn((_count: number) => builder),
    range: vi.fn((_from: number, _to: number) => builder),
    abortSignal: vi.fn((_signal: unknown) => builder),

    // Terminal methods for single results
    single: vi.fn(() => {
      const response = createResponse(
        mockData.length > 0 ? mockData[0] : null,
        mockError,
      );
      return Promise.resolve(response);
    }),

    maybeSingle: vi.fn(() => {
      const response = createResponse(
        mockData.length > 0 ? mockData[0] : null,
        mockError,
      );
      return Promise.resolve(response);
    }),

    // Mutation methods
    insert: vi.fn((_values: unknown | unknown[]) => {
      const insertedData = Array.isArray(_values) ? _values : [_values];
      return {
        ...builder,
        then: vi.fn((resolve) => {
          const response = createResponse(insertedData, mockError);
          return Promise.resolve(resolve(response));
        }),
      };
    }),

    update: vi.fn((_values: Record<string, unknown>) => {
      return {
        ...builder,
        then: vi.fn((resolve) => {
          const response = createResponse(mockData, mockError);
          return Promise.resolve(resolve(response));
        }),
      };
    }),

    upsert: vi.fn((_values: unknown | unknown[]) => {
      const upsertedData = Array.isArray(_values) ? _values : [_values];
      return {
        ...builder,
        then: vi.fn((resolve) => {
          const response = createResponse(upsertedData, mockError);
          return Promise.resolve(resolve(response));
        }),
      };
    }),

    delete: vi.fn(() => {
      return {
        ...builder,
        then: vi.fn((resolve) => {
          const response = createResponse([], mockError);
          return Promise.resolve(resolve(response));
        }),
      };
    }),
  };

  // Make the builder thenable so it can be awaited directly
  Object.defineProperty(builder, "then", {
    value: vi.fn((resolve, reject) => {
      const response = createResponse(mockData, mockError);

      if (mockError && reject) {
        return Promise.resolve().then(() =>
          reject(new Error(mockError.message))
        );
      }
      return Promise.resolve().then(() => resolve(response));
    }),
    writable: true,
    configurable: true,
  });

  return builder;
};

/**
 * Creates a complete mock Supabase client with all service methods
 */
export const createCompleteSupabaseClient = (options: {
  mockData?: MockTableData;
  mockErrors?: MockTableErrors;
  enableLogging?: boolean;
} = {}) => {
  const { mockData = {}, mockErrors = {} } = options;

  return {
    from: vi.fn((table: string) => {
      const tableData = mockData[table] || [];
      const tableError = mockErrors[table] || null;
      return createCompleteMockQueryBuilder(tableData, tableError, table);
    }),

    // Auth service mock
    auth: {
      getSession: vi.fn(() => {
        return Promise.resolve({
          data: { session: null },
          error: null,
        });
      }),
      getUser: vi.fn(() => {
        return Promise.resolve({
          data: { user: null },
          error: null,
        });
      }),
      signInWithPassword: vi.fn((_credentials) => {
        return Promise.resolve({
          data: { user: null, session: null },
          error: null,
        });
      }),
      signUp: vi.fn((_credentials) => {
        return Promise.resolve({
          data: { user: null, session: null },
          error: null,
        });
      }),
      signOut: vi.fn(() => {
        return Promise.resolve({ error: null });
      }),
      onAuthStateChange: vi.fn((_callback) => {
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      }),
      resetPasswordForEmail: vi.fn((_email) => {
        return Promise.resolve({ data: {}, error: null });
      }),
    },

    // Storage service mock
    storage: {
      from: vi.fn((_bucket: string) => {
        return {
          upload: vi.fn((_path, _file, _options) => {
            return Promise.resolve({
              data: { path: _path, fullPath: `${_bucket}/${_path}` },
              error: null,
            });
          }),
          download: vi.fn((_path) => {
            return Promise.resolve({
              data: { arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) },
              error: null,
            });
          }),
          remove: vi.fn((paths) => {
            return Promise.resolve({
              data: paths.map((path: string) => ({ name: path })),
              error: null,
            });
          }),
          list: vi.fn((_path, _options) => {
            return Promise.resolve({
              data: [],
              error: null,
            });
          }),
          getPublicUrl: vi.fn((path) => {
            return {
              data: { publicUrl: `https://mock-url/${_bucket}/${path}` },
            };
          }),
          createSignedUrl: vi.fn((path, _expiresIn) => {
            return Promise.resolve({
              data: { signedUrl: `https://mock-signed-url/${_bucket}/${path}` },
              error: null,
            });
          }),
        };
      }),
    },

    // Realtime service mock
    channel: vi.fn((_name: string) => {
      return {
        on: vi.fn((_event, _filter, _callback) => {
          return {
            subscribe: vi.fn((callback) => {
              if (callback) callback("SUBSCRIBED", null);
              return {
                unsubscribe: vi.fn(),
              };
            }),
          };
        }),
        subscribe: vi.fn((callback) => {
          if (callback) callback("SUBSCRIBED", null);
          return {
            unsubscribe: vi.fn(),
          };
        }),
        unsubscribe: vi.fn(() => {
          return Promise.resolve("ok");
        }),
      };
    }),

    // RPC (Remote Procedure Call) mock
    rpc: vi.fn(
      (_functionName: string, _params: Record<string, unknown> = {}) => {
        return Promise.resolve({
          data: null,
          error: null,
          status: 200,
          statusText: "OK",
        });
      },
    ),
  };
};

/**
 * Mock data generators for common tables
 */
export const mockDataGenerators = {
  drinkCategories: (count = 3) =>
    Array.from({ length: count }, (_, i) => ({
      id: `cat-${i + 1}`,
      name: `Category ${i + 1}`,
      description: `Description for category ${i + 1}`,
      display_order: i + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),

  drinks: (count = 5, categoryId = "cat-1") =>
    Array.from({ length: count }, (_, i) => ({
      id: `drink-${i + 1}`,
      name: `Drink ${i + 1}`,
      description: `Description for drink ${i + 1}`,
      base_price: (2 + i) * 100, // Price in cents
      category_id: categoryId,
      display_order: i + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),

  optionCategories: (count = 2) =>
    Array.from({ length: count }, (_, i) => ({
      id: `opt-cat-${i + 1}`,
      name: `Option Category ${i + 1}`,
      description: `Description for option category ${i + 1}`,
      display_order: i + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),

  optionValues: (count = 3, categoryId = "opt-cat-1") =>
    Array.from({ length: count }, (_, i) => ({
      id: `opt-val-${i + 1}`,
      name: `Option ${i + 1}`,
      price_modifier: i * 50, // Price modifier in cents
      category_id: categoryId,
      display_order: i + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
};

/**
 * Predefined mock configurations for common test scenarios
 */
export const mockConfigurations = {
  // Empty database state
  empty: {
    mockData: {},
    mockErrors: {},
  },

  // Basic menu data
  basicMenu: {
    mockData: {
      drink_categories: mockDataGenerators.drinkCategories(3),
      drinks: mockDataGenerators.drinks(5),
      option_categories: mockDataGenerators.optionCategories(2),
      option_values: mockDataGenerators.optionValues(3),
    },
    mockErrors: {},
  },

  // Database error scenarios
  databaseError: {
    mockData: {},
    mockErrors: {
      drink_categories: {
        message: "Database connection failed",
        code: "DB_ERROR",
      },
      drinks: { message: "Table not found", code: "TABLE_NOT_FOUND" },
    },
  },
};
