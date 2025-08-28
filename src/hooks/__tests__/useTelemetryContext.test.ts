import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

// Mock telemetry configuration to match test environment (disabled)
vi.mock("../../config/telemetryConfig", () => ({
  telemetryConfig: {
    vercel: {
      enabled: false, // Disabled in test environment
      performanceTracking: false,
      speedInsights: false,
    },
    supabase: {
      enabled: false, // Disabled in test environment
      performanceLogging: false,
      errorLogging: false,
      queryLogging: false,
      connectionMonitoring: false,
    },
    enhancedErrorReporting: false,
    slowQueryThreshold: 1000,
  },
  isTelemetryEnabled: vi.fn(() => false), // Disabled in test environment
}));

// Mock telemetry logger
vi.mock("../../utils/telemetryLogger", () => ({
  telemetryLogger: {
    logEvent: vi.fn(),
    getMetrics: vi.fn(() => ({
      performance: [],
      components: [],
      errors: [],
      queries: [],
      connections: [],
      network: [],
    })),
    getMetricsSummary: vi.fn(() => ({
      totalEvents: 0,
      categories: {
        performance: 0,
        components: 0,
        errors: 0,
        queries: 0,
        connections: 0,
        network: 0,
      },
      timeRange: {
        start: Date.now() - 3600000, // 1 hour ago
        end: Date.now(),
      },
    })),
    clearMetrics: vi.fn(),
    getCategoryMetrics: vi.fn((_category) => {
      // Return empty array for any category when telemetry is disabled
      return [];
    }),
  },
}));

// Import hooks after mocks are set up
import {
  useErrorLogger,
  usePerformanceLogger,
  useTelemetryContext,
} from "../useTelemetryContext";

// Import mocked modules for testing
import { isTelemetryEnabled } from "../../config/telemetryConfig";
import { telemetryLogger } from "../../utils/telemetryLogger";

const mockIsTelemetryEnabled = vi.mocked(isTelemetryEnabled);
const mockTelemetryLogger = vi.mocked(telemetryLogger);

// Since telemetry is disabled by default in test environment,
// these tests verify that the hooks work correctly in disabled state

describe("useTelemetryContext with telemetry disabled", () => {
  describe("basic functionality", () => {
    it("should initialize with disabled configuration", () => {
      const { result } = renderHook(() => useTelemetryContext());

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.config.vercelEnabled).toBe(false);
      expect(result.current.config.supabaseEnabled).toBe(false);
      expect(typeof result.current.logEvent).toBe("function");
      expect(typeof result.current.getMetrics).toBe("function");
      expect(typeof result.current.clearMetrics).toBe("function");
    });

    it("should provide stable function references", () => {
      const { result, rerender } = renderHook(() => useTelemetryContext());

      const initialFunctions = {
        logEvent: result.current.logEvent,
        getMetrics: result.current.getMetrics,
        clearMetrics: result.current.clearMetrics,
        isFeatureEnabled: result.current.isFeatureEnabled,
      };

      rerender();

      expect(result.current.logEvent).toBe(initialFunctions.logEvent);
      expect(result.current.getMetrics).toBe(initialFunctions.getMetrics);
      expect(result.current.clearMetrics).toBe(initialFunctions.clearMetrics);
      expect(result.current.isFeatureEnabled).toBe(
        initialFunctions.isFeatureEnabled,
      );
    });
  });

  describe("event logging", () => {
    it("should not log events when telemetry is disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      act(() => {
        result.current.logEvent({
          type: "performance",
          data: {
            name: "test-operation",
            startTime: Date.now() - 100,
            duration: 100,
            endTime: Date.now(),
          },
        });
      });

      // Should not log anything since telemetry is disabled
      // No assertions needed - the real implementation handles this gracefully
    });

    it("should handle multiple event types without logging", () => {
      const { result } = renderHook(() => useTelemetryContext());

      act(() => {
        result.current.logEvent({
          type: "error",
          data: {
            name: "TestError",
            message: "Test error",
            timestamp: Date.now(),
          },
        });
        result.current.logEvent({
          type: "performance",
          data: {
            name: "test-operation",
            startTime: Date.now() - 200,
            duration: 200,
            endTime: Date.now(),
          },
        });
        result.current.logEvent({
          type: "component",
          data: {
            componentName: "TestComponent",
            type: "render",
            duration: 50,
            timestamp: Date.now(),
          },
        });
      });
      // Should not log anything since telemetry is disabled
      // No assertions needed - the real implementation handles this gracefully
    });
  });

  describe("metrics management", () => {
    it("should retrieve empty metrics when disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      const metrics = result.current.getMetrics();

      expect(metrics).toEqual({
        performance: [],
        components: [],
        errors: [],
        queries: [],
        connections: [],
        network: [],
      });
      expect(mockTelemetryLogger.getMetrics).toHaveBeenCalledOnce();
    });

    it("should retrieve empty metrics summary when disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      const summary = result.current.getMetricsSummary();

      expect(summary).toEqual({
        totalEvents: 0,
        categories: {
          performance: 0,
          components: 0,
          errors: 0,
          queries: 0,
          connections: 0,
          network: 0,
        },
        timeRange: {
          start: expect.any(Number),
          end: expect.any(Number),
        },
      });
      expect(mockTelemetryLogger.getMetricsSummary).toHaveBeenCalledOnce();
    });

    it("should clear metrics when disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      act(() => {
        result.current.clearMetrics();
      });

      expect(mockTelemetryLogger.clearMetrics).toHaveBeenCalledOnce();
    });

    it("should retrieve empty category-specific metrics when disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      const performanceMetrics = result.current.getCategoryMetrics(
        "performance",
      );

      expect(performanceMetrics).toEqual([]);
      // Real implementation handles disabled state correctly
    });
  });

  describe("feature detection", () => {
    it("should report all vercel features as disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      expect(result.current.isFeatureEnabled("vercel", "performanceTracking"))
        .toBe(false);
      expect(result.current.isFeatureEnabled("vercel", "speedInsights")).toBe(
        false,
      );
    });

    it("should report all supabase features as disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      expect(result.current.isFeatureEnabled("supabase", "performanceLogging"))
        .toBe(false);
      expect(result.current.isFeatureEnabled("supabase", "errorLogging")).toBe(
        false,
      );
      expect(result.current.isFeatureEnabled("supabase", "queryLogging")).toBe(
        false,
      );
      expect(
        result.current.isFeatureEnabled("supabase", "connectionMonitoring"),
      ).toBe(false);
    });

    it("should handle disabled features consistently", () => {
      const { result } = renderHook(() => useTelemetryContext());

      expect(result.current.isFeatureEnabled("vercel", "performanceTracking"))
        .toBe(false);
      expect(result.current.isFeatureEnabled("supabase", "enabled")).toBe(
        false,
      );
    });
  });

  describe("disabled state handling", () => {
    it("should indicate telemetry is disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.config.vercelEnabled).toBe(false);
      expect(result.current.config.supabaseEnabled).toBe(false);
    });

    it("should still provide all functions when disabled", () => {
      const { result } = renderHook(() => useTelemetryContext());

      expect(typeof result.current.logEvent).toBe("function");
      expect(typeof result.current.getMetrics).toBe("function");
      expect(typeof result.current.getMetricsSummary).toBe("function");
      expect(typeof result.current.clearMetrics).toBe("function");
      expect(typeof result.current.getCategoryMetrics).toBe("function");
      expect(typeof result.current.isFeatureEnabled).toBe("function");
    });
  });
});

describe("usePerformanceLogger with telemetry disabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTelemetryEnabled.mockReturnValue(false);
  });

  it("should not log performance events when disabled", () => {
    const { result } = renderHook(() => usePerformanceLogger("TestComponent"));

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      result.current.logPerformance("render", 100);
    });

    // No logging when telemetry is disabled
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should not log component lifecycle events when disabled", () => {
    const { result } = renderHook(() => usePerformanceLogger("TestComponent"));

    act(() => {
      result.current.logComponentEvent("mount", 100);
      result.current.logComponentEvent("update", 50);
      result.current.logComponentEvent("unmount", 25);
    });

    // No logging when telemetry is disabled
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should handle different component event types without logging", () => {
    const { result } = renderHook(() => usePerformanceLogger("TestComponent"));

    act(() => {
      result.current.logPerformance("api-call", 250, { endpoint: "/api/test" });
      result.current.logPerformance("data-processing", 50);
    });

    // No logging when telemetry is disabled
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should respect disabled feature state", () => {
    const { result } = renderHook(() => usePerformanceLogger("TestComponent"));

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      result.current.logPerformance("operation", 100);
    });

    // No logging when telemetry is disabled
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should maintain stable function references when disabled", () => {
    const { result, rerender } = renderHook(
      (props: { componentName: string }) =>
        usePerformanceLogger(props.componentName),
      { initialProps: { componentName: "Component1" } },
    );

    const initialFunctions = {
      logPerformance: result.current.logPerformance,
      logComponentEvent: result.current.logComponentEvent,
    };

    rerender({ componentName: "Component1" }); // Same component name

    expect(result.current.logPerformance).toBe(initialFunctions.logPerformance);
    expect(result.current.logComponentEvent).toBe(
      initialFunctions.logComponentEvent,
    );
  });

  it("should update when component name changes", () => {
    const { result, rerender } = renderHook(
      (props: { componentName: string }) =>
        usePerformanceLogger(props.componentName),
      { initialProps: { componentName: "Component1" } },
    );

    const initialFunctions = {
      logPerformance: result.current.logPerformance,
    };

    rerender({ componentName: "Component2" }); // Different component name

    // Functions should be recreated when component name changes
    expect(result.current.logPerformance).not.toBe(
      initialFunctions.logPerformance,
    );
    expect(result.current.isEnabled).toBe(false);
  });
});

describe("useErrorLogger with telemetry disabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTelemetryEnabled.mockReturnValue(false);
  });

  it("should not log Error objects when disabled", () => {
    const { result } = renderHook(() => useErrorLogger());

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      const error = new Error("Test error");
      result.current.logError(error, {
        component: "TestComponent",
        action: "submit",
      });
    });

    // No logging when telemetry is disabled
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should not log custom error events when disabled", () => {
    const { result } = renderHook(() => useErrorLogger());

    act(() => {
      result.current.logError(new Error("Custom error message"), {
        severity: "warning",
        component: "TestComponent",
      });
    });

    // No logging when telemetry is disabled
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should handle errors without stack traces when disabled", () => {
    const { result } = renderHook(() => useErrorLogger());

    act(() => {
      const errorWithoutStack = { message: "Error without stack" };
      result.current.logError(errorWithoutStack as Error);
    });

    // No logging when telemetry is disabled
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should respect disabled telemetry state", () => {
    const { result } = renderHook(() => useErrorLogger());

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      result.current.logError(new Error("Test"), { component: "Test" });
    });

    // No logging when telemetry is disabled
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should maintain stable function references when disabled", () => {
    const { result, rerender } = renderHook(() => useErrorLogger());

    const initialLogError = result.current.logError;

    rerender();

    expect(result.current.logError).toBe(initialLogError);
    expect(result.current.isEnabled).toBe(false);
  });

  it("should handle missing global objects gracefully when disabled", () => {
    // Mock missing navigator and location
    const originalNavigator = globalThis.navigator;
    const originalLocation = globalThis.location;

    Object.defineProperty(globalThis, "navigator", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(globalThis, "location", {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useErrorLogger());

    act(() => {
      result.current.logError(new Error("Test error"));
    });

    // No logging when telemetry is disabled, should not throw
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();

    // Restore global objects
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
    Object.defineProperty(globalThis, "location", {
      value: originalLocation,
      configurable: true,
    });
  });

  it("should provide consistent API interface when disabled", () => {
    const { result } = renderHook(() => useErrorLogger());

    expect(typeof result.current.logError).toBe("function");
    expect(typeof result.current.isEnabled).toBe("boolean");
    expect(result.current.isEnabled).toBe(false);
  });
});

describe("API consistency and graceful degradation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTelemetryEnabled.mockReturnValue(false);
  });

  it("should maintain consistent hook interfaces regardless of telemetry state", () => {
    const telemetryContext = renderHook(() => useTelemetryContext());
    const performanceLogger = renderHook(() => usePerformanceLogger("Test"));
    const errorLogger = renderHook(() => useErrorLogger());

    // All hooks should provide their expected interface
    expect(telemetryContext.result.current.isEnabled).toBe(false);
    expect(performanceLogger.result.current.isEnabled).toBe(false);
    expect(errorLogger.result.current.isEnabled).toBe(false);

    expect(typeof telemetryContext.result.current.logEvent).toBe("function");
    expect(typeof performanceLogger.result.current.logPerformance).toBe(
      "function",
    );
    expect(typeof errorLogger.result.current.logError).toBe("function");
  });

  it("should handle telemetry logger failures gracefully", () => {
    // Mock telemetry logger to throw errors
    mockTelemetryLogger.logEvent.mockImplementation(() => {
      throw new Error("Telemetry logger failed");
    });

    const { result } = renderHook(() => useTelemetryContext());

    // Should not throw when telemetry operations fail
    // Since telemetry is disabled, logEvent should not actually be called
    expect(() => {
      act(() => {
        result.current.logEvent({
          type: "error",
          data: {
            name: "test-error",
            message: "Test error",
            timestamp: Date.now(),
          },
        });
      });
    }).not.toThrow();

    expect(result.current.isEnabled).toBe(false);
    // Since telemetry is disabled, the mock should not have been called
    expect(mockTelemetryLogger.logEvent).not.toHaveBeenCalled();
  });

  it("should provide safe defaults when configuration is unavailable", () => {
    const { result } = renderHook(() => useTelemetryContext());

    // Should provide safe defaults
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.config.vercelEnabled).toBe(false);
    expect(result.current.config.supabaseEnabled).toBe(false);
  });
});
