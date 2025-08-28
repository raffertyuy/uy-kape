/**
 * Centralized telemetry configuration management
 *
 * This module provides a single source of truth for all telemetry-related configuration.
 * All telemetry features are OPTIONAL and DISABLED by default to ensure the app works
 * perfectly for developers without any external telemetry services configured.
 *
 * Master switches control groups of related features:
 * - Vercel telemetry: Speed Insights, performance tracking, dev dashboard
 * - Supabase telemetry: Query logging, connection monitoring
 *
 * These features are purely additive and do not affect core functionality.
 */

/**
 * Telemetry configuration object with type-safe environment variable access
 */
export const telemetryConfig = {
  /**
   * Vercel telemetry master switch and related features
   * Controls Speed Insights and performance tracking
   */
  vercel: {
    enabled: import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === "true",
    speedInsights: import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === "true",
    performanceTracking:
      import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === "true",
  },

  /**
   * Supabase telemetry master switch and related features
   * Controls query logging and connection monitoring
   */
  supabase: {
    enabled: import.meta.env.VITE_SUPABASE_TELEMETRY_ENABLED === "true",
    queryLogging: import.meta.env.VITE_SUPABASE_TELEMETRY_ENABLED === "true",
    connectionMonitoring:
      import.meta.env.VITE_SUPABASE_TELEMETRY_ENABLED === "true",
  },

  /**
   * Configuration values with sensible defaults
   * Only used when telemetry is enabled
   */
  slowQueryThreshold: Number(import.meta.env.VITE_SLOW_QUERY_THRESHOLD) || 500,

  /**
   * Enhanced error reporting
   * Enabled if either Vercel or Supabase telemetry is enabled
   */
  enhancedErrorReporting:
    import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === "true" ||
    import.meta.env.VITE_SUPABASE_TELEMETRY_ENABLED === "true",
} as const;

/**
 * Type-safe helper to check if any telemetry is enabled
 */
export const isTelemetryEnabled = (): boolean => {
  return telemetryConfig.vercel.enabled || telemetryConfig.supabase.enabled;
};

/**
 * Type-safe helper to check if specific telemetry feature is enabled
 */
export const isTelemetryFeatureEnabled = (
  category: "vercel" | "supabase",
  feature?:
    | keyof typeof telemetryConfig.vercel
    | keyof typeof telemetryConfig.supabase,
): boolean => {
  if (feature) {
    return telemetryConfig[category][
      feature as keyof typeof telemetryConfig[typeof category]
    ];
  }
  return telemetryConfig[category].enabled;
};

/**
 * Development helper to log telemetry configuration status
 * Only logs in development mode
 */
export const logTelemetryStatus = (): void => {
  if (
    import.meta.env.DEV &&
    (telemetryConfig.vercel.enabled || telemetryConfig.supabase.enabled)
  ) {
    // eslint-disable-next-line no-console
    console.log("🔍 Telemetry Configuration:", {
      vercel: telemetryConfig.vercel,
      supabase: telemetryConfig.supabase,
      enhancedErrorReporting: telemetryConfig.enhancedErrorReporting,
      slowQueryThreshold: telemetryConfig.slowQueryThreshold,
    });
  }
};
