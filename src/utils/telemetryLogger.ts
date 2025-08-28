/**
 * Safe logging utility that respects telemetry configuration
 *
 * This module provides logging utilities that only operate when telemetry
 * is enabled and gracefully handle cases where telemetry is disabled.
 * All logging is optional and does not affect core application functionality.
 */

import { isTelemetryEnabled, telemetryConfig } from "../config/telemetryConfig";
import type {
  TelemetryEvent,
  TelemetryMetrics,
} from "../types/telemetry.types";

/**
 * In-memory telemetry data store
 * Only populated when telemetry is enabled
 */
const telemetryStore: TelemetryMetrics = {
  performance: [],
  queries: [],
  connections: [],
  components: [],
  errors: [],
  network: [],
};

/**
 * Safe telemetry logger that respects configuration
 */
export const telemetryLogger = {
  /**
   * Log a telemetry event
   * Safe to call when telemetry is disabled - will be a no-op
   */
  logEvent: (event: TelemetryEvent): void => {
    if (!isTelemetryEnabled()) return;

    try {
      switch (event.type) {
        case "performance":
          if (telemetryConfig.vercel.performanceTracking) {
            telemetryStore.performance.push(event.data);
          }
          break;
        case "query":
          if (telemetryConfig.supabase.queryLogging) {
            telemetryStore.queries.push(event.data);
          }
          break;
        case "connection":
          if (telemetryConfig.supabase.connectionMonitoring) {
            telemetryStore.connections.push(event.data);
          }
          break;
        case "component":
          if (telemetryConfig.vercel.performanceTracking) {
            telemetryStore.components.push(event.data);
          }
          break;
        case "error":
          if (telemetryConfig.enhancedErrorReporting) {
            telemetryStore.errors.push(event.data);
          }
          break;
        case "network":
          if (telemetryConfig.vercel.performanceTracking) {
            telemetryStore.network.push(event.data);
          }
          break;
        default:
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn("Unknown telemetry event type:", event);
          }
      }

      // Prevent memory leaks by limiting stored events
      limitStoredEvents();
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to log telemetry event:", error);
      }
    }
  },

  /**
   * Get current telemetry metrics
   * Returns empty metrics object when telemetry is disabled
   */
  getMetrics: (): TelemetryMetrics => {
    if (!isTelemetryEnabled()) {
      return {
        performance: [],
        queries: [],
        connections: [],
        components: [],
        errors: [],
        network: [],
      };
    }

    return {
      performance: [...telemetryStore.performance],
      queries: [...telemetryStore.queries],
      connections: [...telemetryStore.connections],
      components: [...telemetryStore.components],
      errors: [...telemetryStore.errors],
      network: [...telemetryStore.network],
    };
  },

  /**
   * Clear all telemetry metrics
   * Safe to call when telemetry is disabled
   */
  clearMetrics: (): void => {
    if (!isTelemetryEnabled()) return;

    telemetryStore.performance.length = 0;
    telemetryStore.queries.length = 0;
    telemetryStore.connections.length = 0;
    telemetryStore.components.length = 0;
    telemetryStore.errors.length = 0;
    telemetryStore.network.length = 0;
  },

  /**
   * Get metrics for a specific category
   */
  getCategoryMetrics: <T extends keyof TelemetryMetrics>(
    category: T,
  ): TelemetryMetrics[T] => {
    if (!isTelemetryEnabled()) {
      return [] as unknown as TelemetryMetrics[T];
    }

    return [...telemetryStore[category]] as TelemetryMetrics[T];
  },

  /**
   * Get metrics summary with counts and basic statistics
   */
  getMetricsSummary: () => {
    if (!isTelemetryEnabled()) {
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

    const perfMetrics = telemetryStore.performance;
    const queryMetrics = telemetryStore.queries;
    const connMetrics = telemetryStore.connections;
    const compMetrics = telemetryStore.components;
    const errorMetrics = telemetryStore.errors;
    const networkMetrics = telemetryStore.network;

    return {
      enabled: true,
      performance: {
        count: perfMetrics.length,
        avgDuration: perfMetrics.length > 0
          ? perfMetrics.reduce((sum, m) => sum + m.duration, 0) /
            perfMetrics.length
          : 0,
      },
      queries: {
        count: queryMetrics.length,
        slowQueries: queryMetrics.filter((q) => q.isSlow).length,
        avgDuration: queryMetrics.length > 0
          ? queryMetrics.reduce((sum, q) => sum + q.duration, 0) /
            queryMetrics.length
          : 0,
      },
      connections: {
        count: connMetrics.length,
        errors: connMetrics.filter((c) => c.status === "error").length,
      },
      components: {
        count: compMetrics.length,
        avgDuration: compMetrics.length > 0
          ? compMetrics.reduce((sum, c) => sum + c.duration, 0) /
            compMetrics.length
          : 0,
      },
      errors: {
        count: errorMetrics.length,
      },
      network: {
        count: networkMetrics.length,
        errors: networkMetrics.filter((n) => n.error).length,
        avgDuration: networkMetrics.length > 0
          ? networkMetrics.reduce((sum, n) => sum + n.duration, 0) /
            networkMetrics.length
          : 0,
      },
    };
  },
};

/**
 * Prevent memory leaks by limiting the number of stored events
 * Keeps the most recent events for each category
 */
const limitStoredEvents = (): void => {
  const maxEvents = 1000; // Maximum events per category

  if (telemetryStore.performance.length > maxEvents) {
    telemetryStore.performance = telemetryStore.performance.slice(-maxEvents);
  }
  if (telemetryStore.queries.length > maxEvents) {
    telemetryStore.queries = telemetryStore.queries.slice(-maxEvents);
  }
  if (telemetryStore.connections.length > maxEvents) {
    telemetryStore.connections = telemetryStore.connections.slice(-maxEvents);
  }
  if (telemetryStore.components.length > maxEvents) {
    telemetryStore.components = telemetryStore.components.slice(-maxEvents);
  }
  if (telemetryStore.errors.length > maxEvents) {
    telemetryStore.errors = telemetryStore.errors.slice(-maxEvents);
  }
  if (telemetryStore.network.length > maxEvents) {
    telemetryStore.network = telemetryStore.network.slice(-maxEvents);
  }
};

/**
 * Helper functions for common telemetry operations
 */
export const telemetryHelpers = {
  /**
   * Log a performance measurement
   */
  logPerformance: (
    name: string,
    duration: number,
    metadata?: Record<string, unknown>,
  ): void => {
    telemetryLogger.logEvent({
      type: "performance",
      data: {
        name,
        startTime: Date.now() - duration,
        duration,
        endTime: Date.now(),
        ...(metadata && { metadata }),
      },
    });
  },

  /**
   * Log a query performance measurement
   */
  logQuery: (
    table: string,
    operation: string,
    duration: number,
    error?: string,
  ): void => {
    telemetryLogger.logEvent({
      type: "query",
      data: {
        table,
        operation: operation as
          | "select"
          | "insert"
          | "update"
          | "delete"
          | "upsert"
          | "rpc",
        duration,
        isSlow: duration > telemetryConfig.slowQueryThreshold,
        timestamp: Date.now(),
        ...(error && { error }),
      },
    });
  },

  /**
   * Log a connection status change
   */
  logConnection: (
    status: "connected" | "disconnected" | "reconnecting" | "error",
    latency?: number,
    error?: string,
  ): void => {
    telemetryLogger.logEvent({
      type: "connection",
      data: {
        status,
        ...(latency && { latency }),
        ...(error && { error }),
        ...(status === "connected" && { lastConnected: Date.now() }),
      },
    });
  },

  /**
   * Log an error with context
   */
  logError: (error: Error, context?: Record<string, unknown>): void => {
    telemetryLogger.logEvent({
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
  },
};
