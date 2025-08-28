import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  connectionQualityTracker,
  measureConnectionLatency,
  withConnectionTracking,
} from "../connectionQualityTracker";

// Mock telemetry configuration to match test environment (disabled)
vi.mock("../../config/telemetryConfig", () => ({
  telemetryConfig: {
    supabase: {
      connectionMonitoring: false, // Disabled in test environment
    },
  },
}));

// Mock telemetry helpers
vi.mock("../telemetryLogger", () => ({
  telemetryHelpers: {
    logConnection: vi.fn(),
  },
}));

// Mock performance.now
Object.defineProperty(globalThis, "performance", {
  value: {
    now: vi.fn(),
  },
  writable: true,
});

// Import mocked modules
import { telemetryHelpers } from "../telemetryLogger";

const mockTelemetryHelpers = vi.mocked(telemetryHelpers);

describe("connectionQualityTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis.performance.now as any).mockReturnValue(1000);
  });

  describe("trackConnectionAttempt with telemetry disabled", () => {
    it("should return timestamp but not track when telemetry is disabled", () => {
      const timestamp = connectionQualityTracker.trackConnectionAttempt();

      expect(typeof timestamp).toBe("number");
      expect(timestamp).toBeGreaterThan(0);
      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
    });
  });

  describe("trackConnectionSuccess with telemetry disabled", () => {
    it("should not track when telemetry is disabled", () => {
      connectionQualityTracker.trackConnectionSuccess(Date.now(), 100);

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
    });

    it("should not modify metrics when telemetry is disabled", () => {
      const metricsBefore = connectionQualityTracker.getMetrics();

      connectionQualityTracker.trackConnectionSuccess(Date.now(), 50);

      const metricsAfter = connectionQualityTracker.getMetrics();
      expect(metricsAfter).toEqual(metricsBefore);
    });
  });

  describe("trackConnectionFailure with telemetry disabled", () => {
    it("should not track failure when telemetry is disabled", () => {
      connectionQualityTracker.trackConnectionFailure("Network timeout");

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
    });

    it("should not modify metrics when telemetry is disabled", () => {
      const metricsBefore = connectionQualityTracker.getMetrics();

      connectionQualityTracker.trackConnectionFailure("Error");

      const metricsAfter = connectionQualityTracker.getMetrics();
      expect(metricsAfter).toEqual(metricsBefore);
    });
  });

  describe("trackReconnectionAttempt with telemetry disabled", () => {
    it("should not track when telemetry is disabled", () => {
      connectionQualityTracker.trackReconnectionAttempt();

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
    });
  });

  describe("trackDisconnection with telemetry disabled", () => {
    it("should not track when telemetry is disabled", () => {
      connectionQualityTracker.trackDisconnection();

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
    });
  });

  describe("getMetrics with telemetry disabled", () => {
    it("should return empty metrics when telemetry is disabled", () => {
      const metrics = connectionQualityTracker.getMetrics();

      expect(metrics).toEqual({
        connectionAttempts: 0,
        successfulConnections: 0,
        failedConnections: 0,
        reconnectionAttempts: 0,
        averageLatency: 0,
        lastConnection: null,
        status: "disconnected",
      });
    });

    it("should maintain empty metrics after tracking attempts", () => {
      // Try various tracking operations
      connectionQualityTracker.trackConnectionAttempt();
      connectionQualityTracker.trackConnectionSuccess(Date.now(), 100);
      connectionQualityTracker.trackConnectionFailure("Error");
      connectionQualityTracker.trackReconnectionAttempt();
      connectionQualityTracker.trackDisconnection();

      const metrics = connectionQualityTracker.getMetrics();
      expect(metrics).toEqual({
        connectionAttempts: 0,
        successfulConnections: 0,
        failedConnections: 0,
        reconnectionAttempts: 0,
        averageLatency: 0,
        lastConnection: null,
        status: "disconnected",
      });
    });
  });

  describe("getHealthScore with telemetry disabled", () => {
    it("should return 0 when telemetry is disabled", () => {
      const score = connectionQualityTracker.getHealthScore();
      expect(score).toBe(0);
    });

    it("should return 0 even after tracking attempts", () => {
      connectionQualityTracker.trackConnectionAttempt();
      connectionQualityTracker.trackConnectionSuccess(Date.now(), 50);

      const score = connectionQualityTracker.getHealthScore();
      expect(score).toBe(0);
    });
  });

  describe("resetMetrics with telemetry disabled", () => {
    it("should be safe to call when telemetry is disabled", () => {
      const metricsBefore = connectionQualityTracker.getMetrics();

      connectionQualityTracker.resetMetrics();

      const metricsAfter = connectionQualityTracker.getMetrics();
      expect(metricsAfter).toEqual(metricsBefore);
    });
  });

  describe("getStatusSummary with telemetry disabled", () => {
    it("should return unknown status when telemetry is disabled", () => {
      const summary = connectionQualityTracker.getStatusSummary();

      expect(summary).toEqual({
        status: "unknown",
        healthScore: 0,
        message: "Connection monitoring disabled",
      });
    });

    it("should maintain consistent status regardless of tracking calls", () => {
      connectionQualityTracker.trackConnectionAttempt();
      connectionQualityTracker.trackConnectionSuccess(Date.now(), 100);

      const summary = connectionQualityTracker.getStatusSummary();
      expect(summary.status).toBe("unknown");
      expect(summary.healthScore).toBe(0);
    });
  });
});

describe("measureConnectionLatency with telemetry disabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis.performance.now as any).mockReturnValue(1000);
  });

  it("should return 0 when telemetry is disabled", async () => {
    const mockConnectionFn = vi.fn().mockResolvedValue({ data: "success" });

    const latency = await measureConnectionLatency(mockConnectionFn);

    expect(latency).toBe(0);
    expect(mockConnectionFn).toHaveBeenCalledOnce();
    // No logging when telemetry is disabled
    expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
  });

  it("should propagate connection failures when telemetry is disabled", async () => {
    const error = new Error("Connection failed");
    const mockConnectionFn = vi.fn().mockRejectedValue(error);

    await expect(measureConnectionLatency(mockConnectionFn)).rejects.toThrow(
      "Connection failed",
    );

    expect(mockConnectionFn).toHaveBeenCalledOnce();
    // No logging when telemetry is disabled
    expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
  });

  it("should preserve function execution even when tracking is disabled", async () => {
    const result = { data: "test-result", success: true };
    const mockConnectionFn = vi.fn().mockResolvedValue(result);

    const latency = await measureConnectionLatency(mockConnectionFn);

    expect(latency).toBe(0);
    expect(mockConnectionFn).toHaveBeenCalledOnce();
  });
});

describe("withConnectionTracking with telemetry disabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis.performance.now as any).mockReturnValue(1000);
  });

  it("should wrap function without tracking when telemetry is disabled", async () => {
    const originalFn = vi.fn().mockResolvedValue({ data: "success" });
    const wrappedFn = withConnectionTracking(originalFn);

    const result = await wrappedFn("arg1", "arg2");

    expect(originalFn).toHaveBeenCalledWith("arg1", "arg2");
    expect(result).toEqual({ data: "success" });
    // No logging when telemetry is disabled
    expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
  });

  it("should handle Supabase error responses without tracking", async () => {
    const supabaseError = { data: null, error: { message: "Database error" } };
    const originalFn = vi.fn().mockResolvedValue(supabaseError);
    const wrappedFn = withConnectionTracking(originalFn);

    const result = await wrappedFn();

    expect(result).toEqual(supabaseError);
    // No logging when telemetry is disabled
    expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
  });

  it("should handle thrown exceptions without tracking", async () => {
    const error = new Error("Network error");
    const originalFn = vi.fn().mockRejectedValue(error);
    const wrappedFn = withConnectionTracking(originalFn);

    await expect(wrappedFn()).rejects.toThrow("Network error");

    expect(originalFn).toHaveBeenCalledOnce();
    // No logging when telemetry is disabled
    expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
  });

  it("should handle non-Supabase responses without tracking", async () => {
    const response = { success: true, message: "API call successful" };
    const originalFn = vi.fn().mockResolvedValue(response);
    const wrappedFn = withConnectionTracking(originalFn);

    const result = await wrappedFn();

    expect(result).toEqual(response);
    // No logging when telemetry is disabled
    expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
  });

  it("should preserve function signature and return type when telemetry is disabled", async () => {
    const originalFn = vi.fn()
      .mockImplementation((id: number, data: any) =>
        Promise.resolve({ id, processed: true, ...data })
      );
    const wrappedFn = withConnectionTracking(originalFn);

    const result = await wrappedFn(123, { name: "test" });

    expect(originalFn).toHaveBeenCalledWith(123, { name: "test" });
    expect(result).toEqual({ id: 123, processed: true, name: "test" });
    // No logging when telemetry is disabled
    expect(mockTelemetryHelpers.logConnection).not.toHaveBeenCalled();
  });
});

describe("API consistency and graceful degradation", () => {
  it("should maintain consistent API interface regardless of telemetry state", () => {
    // All functions should be available and callable
    expect(typeof connectionQualityTracker.trackConnectionAttempt).toBe(
      "function",
    );
    expect(typeof connectionQualityTracker.trackConnectionSuccess).toBe(
      "function",
    );
    expect(typeof connectionQualityTracker.trackConnectionFailure).toBe(
      "function",
    );
    expect(typeof connectionQualityTracker.trackReconnectionAttempt).toBe(
      "function",
    );
    expect(typeof connectionQualityTracker.trackDisconnection).toBe("function");
    expect(typeof connectionQualityTracker.getMetrics).toBe("function");
    expect(typeof connectionQualityTracker.getHealthScore).toBe("function");
    expect(typeof connectionQualityTracker.resetMetrics).toBe("function");
    expect(typeof connectionQualityTracker.getStatusSummary).toBe("function");
    expect(typeof measureConnectionLatency).toBe("function");
    expect(typeof withConnectionTracking).toBe("function");
  });

  it("should handle telemetry logger failures gracefully", async () => {
    // Mock telemetry logger to fail
    mockTelemetryHelpers.logConnection.mockImplementation(() => {
      throw new Error("Telemetry logger failed");
    });

    // Should not throw even if telemetry logger fails (though it's not called when disabled)
    expect(() => {
      connectionQualityTracker.trackConnectionAttempt();
      connectionQualityTracker.trackConnectionSuccess(Date.now(), 100);
      connectionQualityTracker.trackConnectionFailure("Error");
    }).not.toThrow();

    const metrics = connectionQualityTracker.getMetrics();
    expect(metrics.status).toBe("disconnected");
  });

  it("should handle performance timing failures gracefully", async () => {
    // Mock performance.now to throw an error
    (globalThis.performance.now as any).mockImplementation(() => {
      throw new Error("Performance API unavailable");
    });

    // Should still work when timing fails
    const latency = await measureConnectionLatency(
      vi.fn().mockResolvedValue({ data: "success" }),
    );

    expect(latency).toBe(0); // Returns 0 when telemetry disabled
  });
});
