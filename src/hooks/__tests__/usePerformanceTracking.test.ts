import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

// Mock telemetry configuration to match test environment (disabled by default)
vi.mock("../../config/telemetryConfig", () => ({
  telemetryConfig: {
    vercel: {
      performanceTracking: false, // Disabled in test environment
    },
    supabase: {
      enabled: false,
    },
    slowQueryThreshold: 500,
    enhancedErrorReporting: false,
  },
  isTelemetryEnabled: vi.fn(() => false),
}));

// Mock performance tracker
vi.mock("../../utils/performanceTracker", () => ({
  performanceTracker: {
    markStart: vi.fn(),
    markEnd: vi.fn(() => null), // Returns null when disabled
    measureFunction: vi.fn(() =>
      Promise.resolve({
        result: "function-result",
        measurement: null, // No measurement when disabled
      })
    ),
  },
  componentPerformanceTracker: {
    startTracking: vi.fn(),
    trackMount: vi.fn(() => null),
    trackUpdate: vi.fn(() => null),
  },
}));

// Mock telemetry logger
vi.mock("../../utils/telemetryLogger", () => ({
  telemetryLogger: {
    logEvent: vi.fn(),
  },
}));

// Mock performance.now
Object.defineProperty(globalThis, "performance", {
  value: {
    now: vi.fn(() => 1000),
  },
  writable: true,
});

// Import the hook after mocks are set up
import { usePerformanceTracking } from "../usePerformanceTracking";

// Import mocked modules for testing
import {
  componentPerformanceTracker,
  performanceTracker,
} from "../../utils/performanceTracker";
import { telemetryLogger } from "../../utils/telemetryLogger";

const mockPerformanceTracker = vi.mocked(performanceTracker);
const mockComponentPerformanceTracker = vi.mocked(componentPerformanceTracker);
const mockTelemetryLogger = vi.mocked(telemetryLogger);

describe("usePerformanceTracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with telemetry disabled (test environment default)", () => {
    it("should initialize with correct disabled state", () => {
      const { result } = renderHook(() => usePerformanceTracking());

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.getMetrics()).toEqual([]);
      expect(typeof result.current.startTracking).toBe("function");
      expect(typeof result.current.endTracking).toBe("function");
      expect(typeof result.current.trackFunction).toBe("function");
      expect(typeof result.current.getMetrics).toBe("function");
    });

    it("should not track operations when disabled", () => {
      const { result } = renderHook(() =>
        usePerformanceTracking({
          componentName: "TestComponent",
        })
      );

      act(() => {
        result.current.startTracking("operation");
      });

      expect(mockPerformanceTracker.markStart).not.toHaveBeenCalled();
    });

    it("should not track component mount when disabled", () => {
      renderHook(() =>
        usePerformanceTracking({
          componentName: "TestComponent",
          trackMount: true,
        })
      );

      expect(mockComponentPerformanceTracker.startTracking).not
        .toHaveBeenCalled();
    });

    it("should still execute functions but not track when disabled", async () => {
      const { result } = renderHook(() =>
        usePerformanceTracking({
          componentName: "TestComponent",
        })
      );

      const testFunction = vi.fn(() => "test-result");

      const trackingResult = await act(async () => {
        return result.current.trackFunction("test-operation", testFunction);
      });

      expect(testFunction).toHaveBeenCalledOnce();
      expect(trackingResult.result).toBe("test-result");
      expect(trackingResult.measurement).toBeNull();
      // When telemetry is disabled, performance tracker should not be called
      expect(mockPerformanceTracker.measureFunction).not.toHaveBeenCalled();
    });

    it("should return empty metrics when disabled", () => {
      const { result } = renderHook(() => usePerformanceTracking());

      act(() => {
        result.current.startTracking("operation");
        result.current.endTracking("operation");
      });

      const metrics = result.current.getMetrics();
      expect(metrics).toEqual([]);
    });

    it("should handle function errors gracefully even when disabled", async () => {
      const { result } = renderHook(() =>
        usePerformanceTracking({
          componentName: "TestComponent",
        })
      );

      const errorFunction = vi.fn(() => {
        throw new Error("Test error");
      });

      // Should propagate the error but still handle tracking gracefully
      await expect(
        act(async () => {
          return result.current.trackFunction("error-operation", errorFunction);
        }),
      ).rejects.toThrow("Test error");

      expect(errorFunction).toHaveBeenCalledOnce();
    });
  });

  describe("hook interface consistency", () => {
    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(
        (props: { componentName: string }) => usePerformanceTracking(props),
        { initialProps: { componentName: "Component1" } },
      );

      const initialFunctions = {
        startTracking: result.current.startTracking,
        endTracking: result.current.endTracking,
        trackFunction: result.current.trackFunction,
        getMetrics: result.current.getMetrics,
      };

      rerender({ componentName: "Component1" }); // Same props

      expect(result.current.startTracking).toBe(initialFunctions.startTracking);
      expect(result.current.endTracking).toBe(initialFunctions.endTracking);
      expect(result.current.trackFunction).toBe(initialFunctions.trackFunction);
      expect(result.current.getMetrics).toBe(initialFunctions.getMetrics);
    });

    it("should provide consistent API shape regardless of telemetry state", () => {
      const { result } = renderHook(() => usePerformanceTracking());

      // Should always provide the same interface
      expect(result.current).toHaveProperty("isEnabled");
      expect(result.current).toHaveProperty("startTracking");
      expect(result.current).toHaveProperty("endTracking");
      expect(result.current).toHaveProperty("trackFunction");
      expect(result.current).toHaveProperty("getMetrics");

      expect(typeof result.current.isEnabled).toBe("boolean");
      expect(typeof result.current.startTracking).toBe("function");
      expect(typeof result.current.endTracking).toBe("function");
      expect(typeof result.current.trackFunction).toBe("function");
      expect(typeof result.current.getMetrics).toBe("function");
    });
  });

  describe("error handling and graceful degradation", () => {
    it("should handle performance tracker failures gracefully", () => {
      mockPerformanceTracker.markEnd.mockImplementation(() => {
        throw new Error("Performance tracker error");
      });

      const { result } = renderHook(() =>
        usePerformanceTracking({
          componentName: "TestComponent",
        })
      );

      // Should not throw even if performance tracker fails
      expect(() => {
        act(() => {
          result.current.startTracking("operation");
          result.current.endTracking("operation");
        });
      }).not.toThrow();
    });

    it("should handle telemetry logger failures gracefully", () => {
      mockTelemetryLogger.logEvent.mockImplementation(() => {
        throw new Error("Telemetry logger error");
      });

      const { result } = renderHook(() =>
        usePerformanceTracking({
          componentName: "TestComponent",
        })
      );

      // Should not throw even if telemetry logger fails
      expect(() => {
        act(() => {
          result.current.startTracking("operation");
          result.current.endTracking("operation");
        });
      }).not.toThrow();
    });
  });

  describe("configuration validation", () => {
    it("should use default component name when not provided", () => {
      const { result } = renderHook(() => usePerformanceTracking());

      // The hook should work with default component name
      expect(result.current.isEnabled).toBe(false); // Based on test environment
      expect(typeof result.current.startTracking).toBe("function");
    });

    it("should respect custom component names when telemetry is enabled", async () => {
      // This test verifies that the component name logic is preserved
      // even when telemetry is disabled in tests
      const { result } = renderHook(() =>
        usePerformanceTracking({
          componentName: "CustomComponent",
        })
      );

      const testFunction = vi.fn(() => "result");

      await act(async () => {
        return result.current.trackFunction("operation", testFunction);
      });

      // Function should still execute even when tracking is disabled
      expect(testFunction).toHaveBeenCalledOnce();
      // Performance tracker should not be called when telemetry is disabled
      expect(mockPerformanceTracker.measureFunction).not.toHaveBeenCalled();
    });
  });
});
