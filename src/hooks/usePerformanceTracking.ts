/**
 * React hook for component-level performance monitoring
 *
 * This hook provides performance tracking capabilities for React components
 * that only operate when telemetry is enabled. All tracking is optional
 * and gracefully handles cases where telemetry is disabled.
 */

import { useCallback, useEffect, useRef } from "react";
import {
  componentPerformanceTracker,
  performanceTracker,
} from "../utils/performanceTracker";
import { telemetryLogger } from "../utils/telemetryLogger";
import { telemetryConfig } from "../config/telemetryConfig";
import type { ComponentPerformance } from "../types/telemetry.types";

/**
 * Configuration options for performance tracking
 */
interface UsePerformanceTrackingOptions {
  /** Component name for tracking (defaults to 'Component') */
  componentName?: string;
  /** Whether to track mount performance */
  trackMount?: boolean;
  /** Whether to track update performance */
  trackUpdate?: boolean;
  /** Whether to track unmount performance */
  trackUnmount?: boolean;
  /** Additional metadata to include with performance measurements */
  metadata?: Record<string, unknown>;
  /** Custom threshold for slow operation warnings (ms) */
  slowThreshold?: number;
}

/**
 * Performance tracking hook return value
 */
interface UsePerformanceTrackingReturn {
  /** Manually start tracking a custom operation */
  startTracking: (_operationName: string) => void;
  /** Manually end tracking a custom operation */
  endTracking: (
    _operationName: string,
    _metadata?: Record<string, unknown>,
  ) => ComponentPerformance | null;
  /** Track the performance of an async function */
  trackFunction: <T>(
    _name: string,
    _fn: () => Promise<T> | T,
    _metadata?: Record<string, unknown>,
  ) => Promise<{ result: T; measurement: ComponentPerformance | null }>;
  /** Get current performance metrics for this component */
  getMetrics: () => ComponentPerformance[];
  /** Check if performance tracking is enabled */
  isEnabled: boolean;
}

/**
 * Hook for component-level performance monitoring
 *
 * @param options - Configuration options for performance tracking
 * @returns Performance tracking utilities
 */
export const usePerformanceTracking = (
  options: UsePerformanceTrackingOptions = {},
): UsePerformanceTrackingReturn => {
  const {
    componentName = "Component",
    trackMount = true,
    trackUpdate = false,
    trackUnmount = false,
    metadata,
    slowThreshold = telemetryConfig.slowQueryThreshold,
  } = options;

  const mountTimeRef = useRef<number | null>(null);
  const updateCountRef = useRef<number>(0);
  const componentMetricsRef = useRef<ComponentPerformance[]>([]);

  // Track component mount
  useEffect(() => {
    if (!telemetryConfig.vercel.performanceTracking || !trackMount) return;

    mountTimeRef.current = globalThis.performance.now();
    componentPerformanceTracker.startTracking(componentName, "mount");

    // Capture current reference for cleanup
    const currentMetricsRef = componentMetricsRef.current;

    return () => {
      if (mountTimeRef.current) {
        const mountMetric = componentPerformanceTracker.trackMount(
          componentName,
          {
            ...metadata,
            mountTime: mountTimeRef.current,
          },
        );

        if (mountMetric) {
          currentMetricsRef.push(mountMetric);

          // Log to telemetry system
          telemetryLogger.logEvent({
            type: "component",
            data: mountMetric,
          });

          // Warn about slow mounts in development
          if (import.meta.env.DEV && mountMetric.duration > slowThreshold) {
            // eslint-disable-next-line no-console
            console.warn(
              `Slow component mount (${mountMetric.duration.toFixed(2)}ms):`,
              {
                component: componentName,
                duration: mountMetric.duration,
                threshold: slowThreshold,
              },
            );
          }
        }
      }
    };
  }, [componentName, trackMount, metadata, slowThreshold]);

  // Track component updates
  useEffect(() => {
    if (!telemetryConfig.vercel.performanceTracking || !trackUpdate) return;

    updateCountRef.current += 1;

    if (updateCountRef.current > 1) { // Skip first render (mount)
      componentPerformanceTracker.startTracking(componentName, "update");

      const updateMetric = componentPerformanceTracker.trackUpdate(
        componentName,
        {
          ...metadata,
          updateCount: updateCountRef.current,
        },
      );

      if (updateMetric) {
        componentMetricsRef.current.push(updateMetric);

        // Log to telemetry system
        telemetryLogger.logEvent({
          type: "component",
          data: updateMetric,
        });

        // Warn about slow updates in development
        if (import.meta.env.DEV && updateMetric.duration > slowThreshold) {
          // eslint-disable-next-line no-console
          console.warn(
            `Slow component update (${updateMetric.duration.toFixed(2)}ms):`,
            {
              component: componentName,
              duration: updateMetric.duration,
              updateCount: updateCountRef.current,
              threshold: slowThreshold,
            },
          );
        }
      }
    }
  });

  // Track component unmount
  useEffect(() => {
    if (!telemetryConfig.vercel.performanceTracking || !trackUnmount) return;

    // Capture current reference for cleanup
    const currentMetricsRef = componentMetricsRef.current;

    return () => {
      componentPerformanceTracker.startTracking(componentName, "unmount");

      // Note: We can't track unmount completion time because the component is gone
      // This is just for demonstration - in practice, unmount tracking is limited
      const unmountMetric: ComponentPerformance = {
        componentName,
        type: "unmount",
        duration: 0, // Unmount is instantaneous from our perspective
        timestamp: Date.now(),
        metadata: {
          ...metadata,
          totalUpdates: updateCountRef.current,
        },
      };

      currentMetricsRef.push(unmountMetric);

      // Log to telemetry system
      telemetryLogger.logEvent({
        type: "component",
        data: unmountMetric,
      });
    };
  }, [componentName, trackUnmount, metadata]);

  // Manual tracking functions
  const startTracking = useCallback((operationName: string): void => {
    if (!telemetryConfig.vercel.performanceTracking) return;
    performanceTracker.markStart(`${componentName}-${operationName}`);
  }, [componentName]);

  const endTracking = useCallback((
    operationName: string,
    customMetadata?: Record<string, unknown>,
  ): ComponentPerformance | null => {
    if (!telemetryConfig.vercel.performanceTracking) return null;

    const measurement = performanceTracker.markEnd(
      `${componentName}-${operationName}`,
      customMetadata,
    );
    if (!measurement) return null;

    const componentMetric: ComponentPerformance = {
      componentName,
      type: "render", // Custom operations treated as render-related
      duration: measurement.duration,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        ...customMetadata,
        operationName,
      },
    };

    componentMetricsRef.current.push(componentMetric);

    // Log to telemetry system
    telemetryLogger.logEvent({
      type: "component",
      data: componentMetric,
    });

    return componentMetric;
  }, [componentName, metadata]);

  const trackFunction = useCallback(async <T>(
    name: string,
    fn: () => Promise<T> | T,
    customMetadata?: Record<string, unknown>,
  ): Promise<{ result: T; measurement: ComponentPerformance | null }> => {
    if (!telemetryConfig.vercel.performanceTracking) {
      const result = await fn();
      return { result, measurement: null };
    }

    const { result, measurement } = await performanceTracker.measureFunction(
      `${componentName}-${name}`,
      fn,
      customMetadata,
    );

    let componentMetric: ComponentPerformance | null = null;

    if (measurement) {
      componentMetric = {
        componentName,
        type: "render",
        duration: measurement.duration,
        timestamp: Date.now(),
        metadata: {
          ...metadata,
          ...customMetadata,
          functionName: name,
        },
      };

      componentMetricsRef.current.push(componentMetric);

      // Log to telemetry system
      telemetryLogger.logEvent({
        type: "component",
        data: componentMetric,
      });
    }

    return { result, measurement: componentMetric };
  }, [componentName, metadata]);

  const getMetrics = useCallback((): ComponentPerformance[] => {
    return [...componentMetricsRef.current];
  }, []);

  return {
    startTracking,
    endTracking,
    trackFunction,
    getMetrics,
    isEnabled: telemetryConfig.vercel.performanceTracking,
  };
};
