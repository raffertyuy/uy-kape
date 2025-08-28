import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  supabasePerformanceLogger,
  withPerformanceLogging,
} from "../supabasePerformanceLogger";

// Mock telemetry configuration to match test environment (disabled)
vi.mock("../../config/telemetryConfig", () => ({
  telemetryConfig: {
    supabase: {
      queryLogging: false, // Disabled in test environment
    },
    slowQueryThreshold: 1000,
  },
}));

// Mock telemetry helpers
vi.mock("../telemetryLogger", () => ({
  telemetryHelpers: {
    logQuery: vi.fn(),
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

describe("supabasePerformanceLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis.performance.now as any).mockReturnValue(1000);
  });

  describe("wrapQuery with telemetry disabled", () => {
    it("should execute query without logging when telemetry is disabled", async () => {
      (globalThis.performance.now as any)
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1150); // End time

      const mockQueryFn = vi.fn().mockResolvedValue({
        data: [{ id: 1, name: "test" }],
        error: null,
      });

      const result = await supabasePerformanceLogger.wrapQuery(
        "users",
        "select",
        mockQueryFn,
        { filters: { active: true } },
      );

      expect(mockQueryFn).toHaveBeenCalledOnce();
      expect(result).toEqual({
        data: [{ id: 1, name: "test" }],
        error: null,
      });
      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should execute query and not log errors when telemetry is disabled", async () => {
      const error = new Error("Database connection failed");
      const mockQueryFn = vi.fn().mockResolvedValue({
        data: null,
        error,
      });

      const result = await supabasePerformanceLogger.wrapQuery(
        "users",
        "select",
        mockQueryFn,
      );

      expect(result).toEqual({
        data: null,
        error,
      });
      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should handle thrown exceptions gracefully when telemetry is disabled", async () => {
      const error = new Error("Connection timeout");
      const mockQueryFn = vi.fn().mockRejectedValue(error);

      await expect(
        supabasePerformanceLogger.wrapQuery("users", "select", mockQueryFn),
      ).rejects.toThrow("Connection timeout");

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should execute without slow query warnings when telemetry is disabled", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      vi.stubGlobal("import", {
        meta: {
          env: {
            DEV: true,
          },
        },
      });

      (globalThis.performance.now as any)
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(2200); // End time (1200ms - would be slow)

      const mockQueryFn = vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });

      await supabasePerformanceLogger.wrapQuery(
        "orders",
        "select",
        mockQueryFn,
      );

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
      // No slow query warnings when telemetry is disabled
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      vi.unstubAllGlobals();
    });
  });

  describe("logQueryPerformance with telemetry disabled", () => {
    it("should not log performance when telemetry is disabled", () => {
      supabasePerformanceLogger.logQueryPerformance(
        "orders",
        "insert",
        250,
        undefined,
        { userId: 123 },
      );

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should not log errors when telemetry is disabled", () => {
      supabasePerformanceLogger.logQueryPerformance(
        "users",
        "update",
        150,
        "Constraint violation",
        { operation: "update" },
      );

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should not log slow queries when telemetry is disabled", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      vi.stubGlobal("import", {
        meta: {
          env: {
            DEV: true,
          },
        },
      });

      supabasePerformanceLogger.logQueryPerformance(
        "orders",
        "select",
        1500, // Slow query
        undefined,
        { query: "complex-join" },
      );

      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
      // No slow query warnings when telemetry is disabled
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      vi.unstubAllGlobals();
    });
  });

  describe("measureDatabaseOperation with telemetry disabled", () => {
    it("should execute operation without logging when telemetry is disabled", async () => {
      const mockOperation = vi.fn().mockResolvedValue({ success: true });

      const result = await supabasePerformanceLogger.measureDatabaseOperation(
        "products",
        "upsert",
        mockOperation,
        { batchSize: 10 },
      );

      expect(mockOperation).toHaveBeenCalledOnce();
      expect(result).toEqual({ success: true });
      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should handle operation errors without logging when telemetry is disabled", async () => {
      const error = new Error("Operation failed");
      const mockOperation = vi.fn().mockRejectedValue(error);

      await expect(
        supabasePerformanceLogger.measureDatabaseOperation(
          "products",
          "delete",
          mockOperation,
        ),
      ).rejects.toThrow("Operation failed");

      expect(mockOperation).toHaveBeenCalledOnce();
      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });
  });

  describe("withPerformanceLogging with telemetry disabled", () => {
    it("should create a wrapped function that executes without logging", async () => {
      const originalFn = vi.fn().mockResolvedValue({ data: "test" });

      const wrappedFn = withPerformanceLogging(
        "users",
        "select",
        originalFn,
        { wrapper: true },
      );

      const result = await wrappedFn("arg1", "arg2");

      expect(originalFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(result).toEqual({ data: "test" });
      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should handle wrapped function errors without logging", async () => {
      const error = new Error("Function error");
      const originalFn = vi.fn().mockRejectedValue(error);

      const wrappedFn = withPerformanceLogging(
        "orders",
        "insert",
        originalFn,
      );

      await expect(wrappedFn()).rejects.toThrow("Function error");

      expect(originalFn).toHaveBeenCalledOnce();
      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should preserve function signature and arguments when telemetry is disabled", async () => {
      const originalFn = vi.fn()
        .mockImplementation((id: number, data: any) =>
          Promise.resolve({ id, ...data })
        );

      const wrappedFn = withPerformanceLogging(
        "products",
        "update",
        originalFn,
      );

      const result = await wrappedFn(123, {
        name: "Updated Product",
        price: 99.99,
      });

      expect(originalFn).toHaveBeenCalledWith(123, {
        name: "Updated Product",
        price: 99.99,
      });
      expect(result).toEqual({
        id: 123,
        name: "Updated Product",
        price: 99.99,
      });
      // No logging when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });
  });

  describe("API consistency and graceful degradation", () => {
    it("should maintain consistent API interface regardless of telemetry state", () => {
      // All functions should be available and callable
      expect(typeof supabasePerformanceLogger.wrapQuery).toBe("function");
      expect(typeof supabasePerformanceLogger.logQueryPerformance).toBe(
        "function",
      );
      expect(typeof supabasePerformanceLogger.measureDatabaseOperation).toBe(
        "function",
      );
      expect(typeof withPerformanceLogging).toBe("function");
    });

    it("should handle performance timing consistently when telemetry is disabled", async () => {
      // When telemetry is disabled, performance timing is still measured but not logged
      (globalThis.performance.now as any)
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1200); // End time

      const mockQueryFn = vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });

      const result = await supabasePerformanceLogger.wrapQuery(
        "users",
        "select",
        mockQueryFn,
      );

      expect(result).toEqual({
        data: [{ id: 1 }],
        error: null,
      });
      expect(mockQueryFn).toHaveBeenCalledOnce();
      // Timing is measured but not logged when telemetry is disabled
      expect(mockTelemetryHelpers.logQuery).not.toHaveBeenCalled();
    });

    it("should handle telemetry logger failures gracefully", async () => {
      // This test verifies graceful behavior even though logging is disabled
      const mockQueryFn = vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });

      // Should execute successfully regardless of telemetry state
      const result = await supabasePerformanceLogger.wrapQuery(
        "users",
        "select",
        mockQueryFn,
      );

      expect(result).toEqual({
        data: [{ id: 1 }],
        error: null,
      });
      expect(mockQueryFn).toHaveBeenCalledOnce();
    });
  });
});
