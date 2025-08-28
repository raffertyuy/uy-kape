/**
 * Optional connection quality tracking utilities
 *
 * This module provides connection quality monitoring that only operates
 * when Supabase telemetry is enabled. All tracking is optional and
 * gracefully handles cases where telemetry is disabled.
 */

import { telemetryConfig } from "../config/telemetryConfig";
import { telemetryHelpers } from "./telemetryLogger";

/**
 * Connection quality metrics
 */
interface ConnectionQualityMetrics {
  /** Total number of connection attempts */
  connectionAttempts: number;
  /** Number of successful connections */
  successfulConnections: number;
  /** Number of failed connections */
  failedConnections: number;
  /** Number of reconnection attempts */
  reconnectionAttempts: number;
  /** Average connection latency (ms) */
  averageLatency: number;
  /** Last connection timestamp */
  lastConnection: number | null;
  /** Current connection status */
  status: "connected" | "disconnected" | "reconnecting" | "error";
}

/**
 * Connection quality tracker with graceful degradation
 */
export const connectionQualityTracker = {
  // Internal metrics storage (only used when telemetry enabled)
  _metrics: {
    connectionAttempts: 0,
    successfulConnections: 0,
    failedConnections: 0,
    reconnectionAttempts: 0,
    latencyMeasurements: [] as number[],
    lastConnection: null as number | null,
    status: "disconnected" as
      | "connected"
      | "disconnected"
      | "reconnecting"
      | "error",
  },

  /**
   * Track a connection attempt
   * Safe to call when telemetry is disabled - will be a no-op
   */
  trackConnectionAttempt: (): number => {
    if (!telemetryConfig.supabase.connectionMonitoring) return Date.now();

    connectionQualityTracker._metrics.connectionAttempts++;
    return Date.now();
  },

  /**
   * Track a successful connection
   * Safe to call when telemetry is disabled - will be a no-op
   */
  trackConnectionSuccess: (
    attemptStartTime: number,
    latency?: number,
  ): void => {
    if (!telemetryConfig.supabase.connectionMonitoring) return;

    connectionQualityTracker._metrics.successfulConnections++;
    connectionQualityTracker._metrics.lastConnection = Date.now();
    connectionQualityTracker._metrics.status = "connected";

    // Track latency if provided
    if (latency !== undefined) {
      connectionQualityTracker._metrics.latencyMeasurements.push(latency);

      // Keep only recent measurements (last 100)
      if (connectionQualityTracker._metrics.latencyMeasurements.length > 100) {
        connectionQualityTracker._metrics.latencyMeasurements =
          connectionQualityTracker._metrics.latencyMeasurements.slice(-100);
      }
    } else if (attemptStartTime) {
      // Calculate latency from attempt start time
      const calculatedLatency = Date.now() - attemptStartTime;
      connectionQualityTracker._metrics.latencyMeasurements.push(
        calculatedLatency,
      );
    }

    // Log to telemetry system
    telemetryHelpers.logConnection(
      "connected",
      latency || (attemptStartTime ? Date.now() - attemptStartTime : undefined),
    );
  },

  /**
   * Track a failed connection
   * Safe to call when telemetry is disabled - will be a no-op
   */
  trackConnectionFailure: (error?: string): void => {
    if (!telemetryConfig.supabase.connectionMonitoring) return;

    connectionQualityTracker._metrics.failedConnections++;
    connectionQualityTracker._metrics.status = "error";

    // Log to telemetry system
    telemetryHelpers.logConnection("error", undefined, error);
  },

  /**
   * Track a reconnection attempt
   * Safe to call when telemetry is disabled - will be a no-op
   */
  trackReconnectionAttempt: (): void => {
    if (!telemetryConfig.supabase.connectionMonitoring) return;

    connectionQualityTracker._metrics.reconnectionAttempts++;
    connectionQualityTracker._metrics.status = "reconnecting";

    // Log to telemetry system
    telemetryHelpers.logConnection("reconnecting");
  },

  /**
   * Track connection disconnection
   * Safe to call when telemetry is disabled - will be a no-op
   */
  trackDisconnection: (): void => {
    if (!telemetryConfig.supabase.connectionMonitoring) return;

    connectionQualityTracker._metrics.status = "disconnected";

    // Log to telemetry system
    telemetryHelpers.logConnection("disconnected");
  },

  /**
   * Get current connection quality metrics
   * Returns empty metrics when telemetry is disabled
   */
  getMetrics: (): ConnectionQualityMetrics => {
    if (!telemetryConfig.supabase.connectionMonitoring) {
      return {
        connectionAttempts: 0,
        successfulConnections: 0,
        failedConnections: 0,
        reconnectionAttempts: 0,
        averageLatency: 0,
        lastConnection: null,
        status: "disconnected",
      };
    }

    const { latencyMeasurements, ...baseMetrics } =
      connectionQualityTracker._metrics;
    const averageLatency = latencyMeasurements.length > 0
      ? latencyMeasurements.reduce((sum, latency) => sum + latency, 0) /
        latencyMeasurements.length
      : 0;

    return {
      ...baseMetrics,
      averageLatency,
    };
  },

  /**
   * Get connection health score (0-100)
   * Returns 0 when telemetry is disabled
   */
  getHealthScore: (): number => {
    if (!telemetryConfig.supabase.connectionMonitoring) return 0;

    const metrics = connectionQualityTracker.getMetrics();

    if (metrics.connectionAttempts === 0) return 0;

    // Calculate success rate (0-70 points)
    const successRate = metrics.successfulConnections /
      metrics.connectionAttempts;
    const successScore = successRate * 70;

    // Calculate latency score (0-30 points)
    const avgLatency = metrics.averageLatency;
    let latencyScore = 30;
    if (avgLatency > 1000) latencyScore = 10; // Very slow
    else if (avgLatency > 500) latencyScore = 20; // Slow
    else if (avgLatency > 200) latencyScore = 25; // Fair

    return Math.round(successScore + latencyScore);
  },

  /**
   * Reset all metrics
   * Safe to call when telemetry is disabled
   */
  resetMetrics: (): void => {
    if (!telemetryConfig.supabase.connectionMonitoring) return;

    connectionQualityTracker._metrics = {
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0,
      reconnectionAttempts: 0,
      latencyMeasurements: [],
      lastConnection: null,
      status: "disconnected",
    };
  },

  /**
   * Get connection status summary for display
   */
  getStatusSummary: () => {
    if (!telemetryConfig.supabase.connectionMonitoring) {
      return {
        status: "unknown" as const,
        healthScore: 0,
        message: "Connection monitoring disabled",
      };
    }

    const metrics = connectionQualityTracker.getMetrics();
    const healthScore = connectionQualityTracker.getHealthScore();

    let message = "Connection status unknown";

    if (metrics.connectionAttempts > 0) {
      const successRate = Math.round(
        (metrics.successfulConnections / metrics.connectionAttempts) * 100,
      );
      message = `${successRate}% success rate, ${
        Math.round(metrics.averageLatency)
      }ms avg latency`;
    }

    return {
      status: metrics.status,
      healthScore,
      message,
      lastConnection: metrics.lastConnection,
    };
  },
};

/**
 * Helper function to measure connection latency
 * Returns 0 when telemetry is disabled
 */
export const measureConnectionLatency = async (
  testFunction: () => Promise<any>,
): Promise<number> => {
  if (!telemetryConfig.supabase.connectionMonitoring) {
    await testFunction();
    return 0;
  }

  const startTime = globalThis.performance.now();

  try {
    await testFunction();
    return globalThis.performance.now() - startTime;
  } catch (error) {
    const latency = globalThis.performance.now() - startTime;
    connectionQualityTracker.trackConnectionFailure(String(error));
    return latency;
  }
};

/**
 * Higher-order function to wrap connection operations with quality tracking
 */
export const withConnectionTracking = <
  T extends (..._args: any[]) => Promise<any>,
>(
  fn: T,
  operationName?: string,
): T => {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const attemptTime = connectionQualityTracker.trackConnectionAttempt();

    try {
      const result = await fn(...args);

      // For Supabase operations, check if result indicates success
      if (result && typeof result === "object" && "error" in result) {
        if (result.error) {
          connectionQualityTracker.trackConnectionFailure(
            `${operationName || "operation"}: ${result.error.message}`,
          );
        } else {
          connectionQualityTracker.trackConnectionSuccess(attemptTime);
        }
      } else {
        connectionQualityTracker.trackConnectionSuccess(attemptTime);
      }

      return result;
    } catch (error) {
      connectionQualityTracker.trackConnectionFailure(
        `${operationName || "operation"}: ${String(error)}`,
      );
      throw error;
    }
  }) as T;
};
