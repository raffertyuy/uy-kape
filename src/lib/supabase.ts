import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Environment detection functions
const isCI = (): boolean => {
  return (
    process.env.CI === "true" ||
    process.env.GITHUB_ACTIONS === "true" ||
    Boolean(process.env.CI)
  );
};

const isTestEnv = (): boolean => {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.VITE_IS_TEST === "true" ||
    Boolean((import.meta as { vitest?: boolean })?.vitest)
  );
};

const shouldUseMocks = (): boolean => {
  // Always use mocks in CI environment
  if (isCI()) return true;

  // For local development tests, check if we have local Supabase
  if (isTestEnv()) {
    const hasLocalSupabase = Boolean(
      import.meta.env.VITE_SUPABASE_URL?.includes("localhost") ||
        import.meta.env.VITE_SUPABASE_URL?.includes("127.0.0.1"),
    );

    // Use real DB if available locally, otherwise use mocks
    return !hasLocalSupabase;
  }

  // For production, never use mocks
  return false;
};

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Resolve credentials with safe fallbacks for different environments
let resolvedUrl = supabaseUrl;
let resolvedAnonKey = supabaseAnonKey;

// Enhanced test environment detection and handling
if (isTestEnv()) {
  if (shouldUseMocks()) {
    // In CI or when no local Supabase is available, we'll create a mock client
    // The actual mock will be handled by the test setup
    resolvedUrl = "https://mock-supabase-url.com";
    resolvedAnonKey = "mock-anon-key";
  } else {
    // Local development with real database
    if (!resolvedUrl || !resolvedAnonKey) {
      resolvedUrl = "http://127.0.0.1:54321";
      resolvedAnonKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
    }
  }
}

if (!resolvedUrl || !resolvedAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

// Create the Supabase client
// In test environments with mocks, this will be replaced by test setup
export const supabase = createClient<Database>(resolvedUrl, resolvedAnonKey);

// Export environment detection for use in tests
export { isCI, isTestEnv, shouldUseMocks };
