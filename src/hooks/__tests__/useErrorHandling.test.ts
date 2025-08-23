import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

// Hook variable
let useErrorHandling: any;

describe("useErrorHandling", () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock("../../utils/globalErrorHandler", () => ({
      handleGlobalError: vi.fn((error, context) => ({
        code: error?.code || "ERROR",
        message: "Mocked error message",
        details: { context },
        timestamp: new Date(),
        action: context,
      })),
      isRetryableError: vi.fn((error) =>
        error?.message?.includes("network") ||
        error?.message?.includes("timeout")
      ),
      isOffline: vi.fn(() => false),
      withRetry: vi.fn(async (operation, _maxRetries, _delay) => {
        return await operation();
      }),
      getRecoveryStrategy: vi.fn((_category) => ({
        canRetry: true,
        retryDelay: 1000,
        maxRetries: 3,
        message: "Recovery strategy message",
      })),
    }));

    // Import hook after mocking
    const hookModule = await import("../useErrorHandling");
    useErrorHandling = hookModule.useErrorHandling;
  });

  afterAll(() => {
    vi.doUnmock("../../utils/globalErrorHandler");
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with no error state", () => {
    const { result } = renderHook(() => useErrorHandling());

    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.isRetrying).toBe(false);
  });

  it("should handle errors correctly", () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.setError(new Error("Test error"));
    });

    expect(result.current.error).toEqual({
      code: "ERROR",
      message: "Mocked error message",
      details: { context: undefined },
      timestamp: expect.any(Date),
    });
    expect(result.current.isError).toBe(true);
    expect(result.current.isRetrying).toBe(false);
  });

  it("should handle errors with context", () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.setError(new Error("Test error"), "test_action");
    });

    expect(result.current.error?.details).toEqual({ context: "test_action" });
  });

  it("should clear errors", () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.setError(new Error("Test error"));
    });

    expect(result.current.isError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.isRetrying).toBe(false);
  });

  it("should handle retry operations successfully", async () => {
    const { result } = renderHook(() => useErrorHandling());
    const mockOperation = vi.fn().mockResolvedValue("success");

    await act(async () => {
      await result.current.retry(mockOperation);
    });

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result.current.isError).toBe(false);
    expect(result.current.isRetrying).toBe(false);
  });

  it("should handle retry operation failures", async () => {
    const { result } = renderHook(() => useErrorHandling());
    const mockOperation = vi.fn().mockRejectedValue(
      new Error("Operation failed"),
    );

    await act(async () => {
      await result.current.retry(mockOperation);
    });

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe("Mocked error message");
    expect(result.current.isRetrying).toBe(false);
  });

  it("should handle async operations successfully", async () => {
    const { result } = renderHook(() => useErrorHandling());
    const mockOperation = vi.fn().mockResolvedValue("async success");

    let operationResult: string | null = null;

    await act(async () => {
      operationResult = await result.current.handleAsyncOperation(
        mockOperation,
        "async_test",
      );
    });

    expect(operationResult).toBe("async success");
    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result.current.isError).toBe(false);
  });

  it("should handle async operation failures", async () => {
    const { result } = renderHook(() => useErrorHandling());
    const mockOperation = vi.fn().mockRejectedValue(
      new Error("Async operation failed"),
    );

    let operationResult: string | null = "initial";

    await act(async () => {
      operationResult = await result.current.handleAsyncOperation(
        mockOperation,
        "async_fail",
      );
    });

    expect(operationResult).toBeNull();
    expect(result.current.isError).toBe(true);
    expect(result.current.error?.details).toEqual({ context: "async_fail" });
  });

  it("should show retry state during operations", async () => {
    const { result } = renderHook(() => useErrorHandling());
    const slowOperation = vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve("slow success"), 200)
        ),
    );

    let operationPromise: Promise<void> | undefined;

    await act(async () => {
      operationPromise = result.current.retry(slowOperation);
    });

    await waitFor(() => expect(result.current.isRetrying).toBe(true), {
      timeout: 1000,
    });

    await act(async () => {
      await operationPromise;
    });

    await waitFor(() => expect(result.current.isRetrying).toBe(false), {
      timeout: 1000,
    });
  });
});
