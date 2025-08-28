/**
 * Optional performance instrumentation for Supabase database operations
 *
 * This module provides performance logging wrapper for database operations
 * that only logs when Supabase telemetry is enabled. All methods are safe
 * to call regardless of configuration and will only perform actual logging
 * when enabled.
 */

import { telemetryConfig } from "../config/telemetryConfig";
import { telemetryHelpers } from "./telemetryLogger";

/**
 * Performance wrapper for Supabase query operations
 */
export const supabasePerformanceLogger = {
  /**
   * Wrap a Supabase query with performance logging
   * Safe to call when telemetry is disabled - will execute query without logging
   */
  wrapQuery: async <T>(
    table: string,
    operation: "select" | "insert" | "update" | "delete" | "upsert" | "rpc",
    queryFn: () => Promise<{ data: T | null; error: any }>,
    metadata?: Record<string, unknown>,
  ): Promise<{ data: T | null; error: any }> => {
    const startTime = globalThis.performance.now();

    try {
      const result = await queryFn();
      const duration = globalThis.performance.now() - startTime;

      // Log performance if telemetry is enabled
      if (telemetryConfig.supabase.queryLogging) {
        telemetryHelpers.logQuery(
          table,
          operation,
          duration,
          result.error
            ? String(result.error.message || result.error)
            : undefined,
        );

        // Log slow queries in development
        if (
          import.meta.env.DEV && duration > telemetryConfig.slowQueryThreshold
        ) {
          // eslint-disable-next-line no-console
          console.warn(`Slow query detected (${duration.toFixed(2)}ms):`, {
            table,
            operation,
            duration,
            threshold: telemetryConfig.slowQueryThreshold,
            metadata,
          });
        }
      }

      return result;
    } catch (error) {
      const duration = globalThis.performance.now() - startTime;

      // Log error if telemetry is enabled
      if (telemetryConfig.supabase.queryLogging) {
        telemetryHelpers.logQuery(
          table,
          operation,
          duration,
          String(error),
        );
      }

      throw error;
    }
  },

  /**
   * Log a manual query performance measurement
   * Safe to call when telemetry is disabled - will be a no-op
   */
  logQueryPerformance: (
    table: string,
    operation: "select" | "insert" | "update" | "delete" | "upsert" | "rpc",
    duration: number,
    error?: string,
    metadata?: Record<string, unknown>,
  ): void => {
    if (!telemetryConfig.supabase.queryLogging) return;

    telemetryHelpers.logQuery(table, operation, duration, error);

    // Log slow queries in development
    if (import.meta.env.DEV && duration > telemetryConfig.slowQueryThreshold) {
      // eslint-disable-next-line no-console
      console.warn(`Slow query detected (${duration.toFixed(2)}ms):`, {
        table,
        operation,
        duration,
        threshold: telemetryConfig.slowQueryThreshold,
        metadata,
        ...(error && { error }),
      });
    }
  },

  /**
   * Measure and log the performance of a function that performs database operations
   */
  measureDatabaseOperation: async <T>(
    table: string,
    operation: "select" | "insert" | "update" | "delete" | "upsert" | "rpc",
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<T> => {
    if (!telemetryConfig.supabase.queryLogging) {
      // If telemetry is disabled, just execute the function
      return await fn();
    }

    const startTime = globalThis.performance.now();

    try {
      const result = await fn();
      const duration = globalThis.performance.now() - startTime;

      supabasePerformanceLogger.logQueryPerformance(
        table,
        operation,
        duration,
        undefined,
        metadata,
      );

      return result;
    } catch (error) {
      const duration = globalThis.performance.now() - startTime;

      supabasePerformanceLogger.logQueryPerformance(
        table,
        operation,
        duration,
        String(error),
        metadata,
      );

      throw error;
    }
  },
};

/**
 * Helper function to create a performance-wrapped Supabase client method
 * This can be used to wrap existing service methods without major refactoring
 */
export const withPerformanceLogging = <
  T extends (..._args: any[]) => Promise<any>,
>(
  table: string,
  operation: "select" | "insert" | "update" | "delete" | "upsert" | "rpc",
  fn: T,
  metadata?: Record<string, unknown>,
): T => {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return await supabasePerformanceLogger.measureDatabaseOperation(
      table,
      operation,
      () => fn(...args),
      metadata,
    );
  }) as T;
};
