/**
 * Environment detection utilities for test configuration
 * Handles detection of CI vs local development environments
 */

/**
 * Detects if we're running in a CI environment
 */
export const isCI = (): boolean => {
  return (
    process.env.CI === "true" ||
    process.env.GITHUB_ACTIONS === "true" ||
    process.env.GITLAB_CI === "true" ||
    process.env.TRAVIS === "true" ||
    process.env.CIRCLECI === "true" ||
    Boolean(process.env.CI)
  );
};

/**
 * Detects if we're running in a Vitest test environment
 */
export const isTestEnv = (): boolean => {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.VITE_IS_TEST === "true" ||
    Boolean((import.meta as { vitest?: boolean })?.vitest) ||
    typeof globalThis !== "undefined" && "vitest" in globalThis
  );
};

/**
 * Detects if we're running in a local development environment
 */
export const isLocalDev = (): boolean => {
  return isTestEnv() && !isCI();
};

/**
 * Determines if we should use mocks (CI environment) or real DB (local development)
 */
export const shouldUseMocks = (): boolean => {
  // Always use mocks in CI environment
  if (isCI()) return true;

  // For local development, use real DB if available
  if (isLocalDev()) {
    // Check if local Supabase is configured
    const hasLocalSupabase = Boolean(
      process.env.VITE_SUPABASE_URL?.includes("localhost") ||
        process.env.VITE_SUPABASE_URL?.includes("127.0.0.1"),
    );

    // Use real DB if available, otherwise fall back to mocks
    return !hasLocalSupabase;
  }

  // Default to mocks for any other scenario
  return true;
};

/**
 * Gets the appropriate test strategy based on environment
 */
export const getTestStrategy = () => {
  const useMocks = shouldUseMocks();
  const environment = isCI() ? "ci" : isLocalDev() ? "local" : "unknown";

  return {
    useMocks,
    environment,
    description: useMocks
      ? `Using mocks in ${environment} environment`
      : `Using real database in ${environment} environment`,
  };
};

/**
 * Environment-specific configuration
 */
export const testEnvironmentConfig = {
  ci: {
    useMocks: true,
    timeout: 45000,
    retries: 3,
    description: "CI environment - using mocks for stability",
  },
  local: {
    useMocks: false,
    timeout: 20000,
    retries: 1,
    description:
      "Local development - using real database for integration testing",
  },
  fallback: {
    useMocks: true,
    timeout: 30000,
    retries: 2,
    description: "Unknown environment - defaulting to mocks",
  },
};

/**
 * Gets configuration for current environment
 */
export const getCurrentTestConfig = () => {
  if (isCI()) return testEnvironmentConfig.ci;
  if (isLocalDev()) return testEnvironmentConfig.local;
  return testEnvironmentConfig.fallback;
};
