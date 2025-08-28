/**
 * Core performance tracking utilities
 *
 * This module provides performance tracking functionality that works gracefully
 * when telemetry is disabled. All methods are safe to call regardless of
 * configuration and will only perform actual tracking when enabled.
 */

import { telemetryConfig } from "../config/telemetryConfig";
import type {
  ComponentPerformance,
  PerformanceMeasurement,
} from "../types/telemetry.types";

/**
 * Performance tracker utility with graceful degradation
 */
export const performanceTracker = {
  /**
   * Mark the start of a performance measurement
   * Safe to call when telemetry is disabled - will be a no-op
   */
  markStart: (name: string): void => {
    if (!telemetryConfig.vercel.performanceTracking) return;

    try {
      globalThis.performance.mark(`${name}-start`);
    } catch (error) {
      // Gracefully handle environments where Performance API is not available
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Performance API not available:", error);
      }
    }
  },

  /**
   * Mark the end of a performance measurement and calculate duration
   * Safe to call when telemetry is disabled - will be a no-op
   */
  markEnd: (
    name: string,
    metadata?: Record<string, unknown>,
  ): PerformanceMeasurement | null => {
    if (!telemetryConfig.vercel.performanceTracking) return null;

    try {
      globalThis.performance.mark(`${name}-end`);
      globalThis.performance.measure(name, `${name}-start`, `${name}-end`);

      const entries = globalThis.performance.getEntriesByName(name, "measure");
      const measurement = entries[entries.length - 1];

      if (measurement) {
        const result: PerformanceMeasurement = {
          name,
          startTime: measurement.startTime,
          duration: measurement.duration,
          endTime: measurement.startTime + measurement.duration,
          ...(metadata && { metadata }),
        };

        // Clean up performance marks to prevent memory leaks
        globalThis.performance.clearMarks(`${name}-start`);
        globalThis.performance.clearMarks(`${name}-end`);
        globalThis.performance.clearMeasures(name);

        return result;
      }
    } catch (error) {
      // Gracefully handle Performance API errors
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Performance measurement failed:", error);
      }
    }

    return null;
  },

  /**
   * Get all current performance metrics
   * Returns empty array when telemetry is disabled
   */
  getMetrics: (): PerformanceMeasurement[] => {
    if (!telemetryConfig.vercel.performanceTracking) return [];

    try {
      const measures = globalThis.performance.getEntriesByType("measure");
      return measures.map((measure) => ({
        name: measure.name,
        startTime: measure.startTime,
        duration: measure.duration,
        endTime: measure.startTime + measure.duration,
      }));
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to get performance metrics:", error);
      }
      return [];
    }
  },

  /**
   * Clear all performance measurements
   * Safe to call when telemetry is disabled
   */
  clearMetrics: (): void => {
    if (!telemetryConfig.vercel.performanceTracking) return;

    try {
      globalThis.performance.clearMarks();
      globalThis.performance.clearMeasures();
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to clear performance metrics:", error);
      }
    }
  },

  /**
   * Measure the execution time of a function
   * Returns the function result and optionally logs performance data
   */
  measureFunction: async <T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, unknown>,
  ): Promise<{ result: T; measurement: PerformanceMeasurement | null }> => {
    performanceTracker.markStart(name);

    try {
      const result = await fn();
      const measurement = performanceTracker.markEnd(name, metadata);
      return { result, measurement };
    } catch (error) {
      // Ensure we clean up even if the function throws
      performanceTracker.markEnd(name, { ...metadata, error: String(error) });
      throw error;
    }
  },
};

/**
 * Component-specific performance tracking utilities
 */
export const componentPerformanceTracker = {
  /**
   * Track component mount performance
   */
  trackMount: (
    componentName: string,
    metadata?: Record<string, unknown>,
  ): ComponentPerformance | null => {
    if (!telemetryConfig.vercel.performanceTracking) return null;

    const measurement = performanceTracker.markEnd(
      `component-${componentName}-mount`,
      metadata,
    );
    if (!measurement) return null;

    return {
      componentName,
      type: "mount",
      duration: measurement.duration,
      timestamp: Date.now(),
      ...(metadata && { metadata }),
    };
  },

  /**
   * Track component update performance
   */
  trackUpdate: (
    componentName: string,
    metadata?: Record<string, unknown>,
  ): ComponentPerformance | null => {
    if (!telemetryConfig.vercel.performanceTracking) return null;

    const measurement = performanceTracker.markEnd(
      `component-${componentName}-update`,
      metadata,
    );
    if (!measurement) return null;

    return {
      componentName,
      type: "update",
      duration: measurement.duration,
      timestamp: Date.now(),
      ...(metadata && { metadata }),
    };
  },

  /**
   * Start tracking component lifecycle event
   */
  startTracking: (
    componentName: string,
    type: "mount" | "update" | "unmount",
  ): void => {
    performanceTracker.markStart(`component-${componentName}-${type}`);
  },
};

/**
 * Utility to check if Performance API is available
 */
export const isPerformanceAPIAvailable = (): boolean => {
  try {
    return typeof globalThis.performance !== "undefined" &&
      typeof globalThis.performance.mark === "function" &&
      typeof globalThis.performance.measure === "function";
  } catch {
    return false;
  }
};
