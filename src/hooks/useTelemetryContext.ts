/**
 * Hook for accessing telemetry context and utilities
 *
 * This hook provides access to telemetry configuration and logging functions
 * throughout the application. All telemetry operations are optional and
 * gracefully handle cases where telemetry is disabled.
 */

import { useCallback, useMemo } from "react";
import { isTelemetryEnabled, telemetryConfig } from "../config/telemetryConfig";
import { telemetryLogger } from "../utils/telemetryLogger";
import type {
  TelemetryConfiguration,
  TelemetryEvent,
  TelemetryMetrics,
} from "../types/telemetry.types";

/**
 * Telemetry context hook return value
 */
interface UseTelemetryContextReturn {
  /** Current telemetry configuration */
  config: TelemetryConfiguration;
  /** Whether any telemetry is enabled */
  isEnabled: boolean;
  /** Log a telemetry event */
  logEvent: (_event: TelemetryEvent) => void;
  /** Get current telemetry metrics */
  getMetrics: () => TelemetryMetrics;
  /** Get metrics summary */
  getMetricsSummary: () => ReturnType<typeof telemetryLogger.getMetricsSummary>;
  /** Clear all telemetry metrics */
  clearMetrics: () => void;
  /** Get metrics for a specific category */
  getCategoryMetrics: <T extends keyof TelemetryMetrics>(
    _category: T,
  ) => TelemetryMetrics[T];
  /** Check if a specific telemetry feature is enabled */
  isFeatureEnabled: (
    _category: "vercel" | "supabase",
    _feature?: string,
  ) => boolean;
}

/**
 * Hook for accessing telemetry context and utilities
 *
 * @returns Telemetry context and utilities
 */
export const useTelemetryContext = (): UseTelemetryContextReturn => {
  // Memoize configuration to prevent unnecessary re-renders
  const config: TelemetryConfiguration = useMemo(() => ({
    vercelEnabled: telemetryConfig.vercel.enabled,
    supabaseEnabled: telemetryConfig.supabase.enabled,
    enhancedErrorReporting: telemetryConfig.enhancedErrorReporting,
    slowQueryThreshold: telemetryConfig.slowQueryThreshold,
  }), []);

  // Memoize enabled state
  const isEnabled = useMemo(() => isTelemetryEnabled(), []);

  // Log telemetry event
  const logEvent = useCallback((event: TelemetryEvent): void => {
    // Don't even attempt to log if telemetry is disabled
    if (!isEnabled) return;

    try {
      telemetryLogger.logEvent(event);
    } catch (error) {
      // Telemetry failures should not break the application
      // Only log in development for debugging
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Telemetry logging failed:", error);
      }
    }
  }, [isEnabled]);

  // Get all metrics
  const getMetrics = useCallback((): TelemetryMetrics => {
    try {
      return telemetryLogger.getMetrics();
    } catch (error) {
      // Return empty metrics on failure
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to get telemetry metrics:", error);
      }
      return {
        performance: [],
        components: [],
        errors: [],
        queries: [],
        connections: [],
        network: [],
      };
    }
  }, []);

  // Get metrics summary
  const getMetricsSummary = useCallback(() => {
    try {
      return telemetryLogger.getMetricsSummary();
    } catch (error) {
      // Return empty summary on failure
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to get telemetry metrics summary:", error);
      }
      return {
        enabled: false,
        performance: { count: 0, avgDuration: 0 },
        queries: { count: 0, slowQueries: 0, avgDuration: 0 },
        connections: { count: 0, errors: 0 },
        components: { count: 0, avgDuration: 0 },
        errors: { count: 0 },
        network: { count: 0, errors: 0, avgDuration: 0 },
      };
    }
  }, []);

  // Clear all metrics
  const clearMetrics = useCallback((): void => {
    try {
      telemetryLogger.clearMetrics();
    } catch (error) {
      // Silently handle clear metrics failure
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to clear telemetry metrics:", error);
      }
    }
  }, []);

  // Get category-specific metrics
  const getCategoryMetrics = useCallback(<T extends keyof TelemetryMetrics>(
    category: T,
  ): TelemetryMetrics[T] => {
    try {
      return telemetryLogger.getCategoryMetrics(category);
    } catch (error) {
      // Return empty array for any category on failure
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to get category metrics:", error);
      }
      return [] as TelemetryMetrics[T];
    }
  }, []);

  // Check if specific feature is enabled
  const isFeatureEnabled = useCallback((
    category: "vercel" | "supabase",
    feature?: string,
  ): boolean => {
    if (feature) {
      return telemetryConfig[category][
        feature as keyof typeof telemetryConfig[typeof category]
      ];
    }
    return telemetryConfig[category].enabled;
  }, []);

  return {
    config,
    isEnabled,
    logEvent,
    getMetrics,
    getMetricsSummary,
    clearMetrics,
    getCategoryMetrics,
    isFeatureEnabled,
  };
};

/**
 * Hook for logging performance events with component context
 *
 * @param componentName - Name of the component for context
 * @returns Performance logging utilities
 */
export const usePerformanceLogger = (componentName: string) => {
  const { logEvent, isFeatureEnabled } = useTelemetryContext();

  const logPerformance = useCallback((
    name: string,
    duration: number,
    metadata?: Record<string, unknown>,
  ): void => {
    if (!isFeatureEnabled("vercel", "performanceTracking")) return;

    logEvent({
      type: "performance",
      data: {
        name: `${componentName}-${name}`,
        startTime: Date.now() - duration,
        duration,
        endTime: Date.now(),
        ...(metadata &&
          { metadata: { ...metadata, component: componentName } }),
      },
    });
  }, [logEvent, isFeatureEnabled, componentName]);

  const logComponentEvent = useCallback((
    type: "mount" | "update" | "unmount" | "render",
    duration: number,
    metadata?: Record<string, unknown>,
  ): void => {
    if (!isFeatureEnabled("vercel", "performanceTracking")) return;

    logEvent({
      type: "component",
      data: {
        componentName,
        type,
        duration,
        timestamp: Date.now(),
        ...(metadata && { metadata }),
      },
    });
  }, [logEvent, isFeatureEnabled, componentName]);

  return {
    logPerformance,
    logComponentEvent,
    isEnabled: isFeatureEnabled("vercel", "performanceTracking"),
  };
};

/**
 * Hook for logging error events with telemetry context
 *
 * @returns Error logging utilities
 */
export const useErrorLogger = () => {
  const { logEvent, isFeatureEnabled } = useTelemetryContext();

  const logError = useCallback((
    error: Error,
    context?: Record<string, unknown>,
  ): void => {
    if (!isFeatureEnabled("vercel") && !isFeatureEnabled("supabase")) return;

    logEvent({
      type: "error",
      data: {
        name: error.name,
        message: error.message,
        timestamp: Date.now(),
        url: globalThis.location?.href || "",
        userAgent: globalThis.navigator?.userAgent || "",
        ...(error.stack && { stack: error.stack }),
        ...(context && { context }),
      },
    });
  }, [logEvent, isFeatureEnabled]);

  const logErrorEvent = useCallback((
    name: string,
    message: string,
    context?: Record<string, unknown>,
  ): void => {
    if (!isFeatureEnabled("vercel") && !isFeatureEnabled("supabase")) return;

    logEvent({
      type: "error",
      data: {
        name,
        message,
        timestamp: Date.now(),
        url: globalThis.location?.href || "",
        userAgent: globalThis.navigator?.userAgent || "",
        ...(context && { context }),
      },
    });
  }, [logEvent, isFeatureEnabled]);

  return {
    logError,
    logErrorEvent,
    isEnabled: isFeatureEnabled("vercel") || isFeatureEnabled("supabase"),
  };
};
