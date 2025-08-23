import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGuestOrderActions } from "../useGuestOrderActions";
import { orderService } from "@/services/orderService";
import type { GuestCancellationResult } from "@/types/order.types";

// Mock the orderService
vi.mock("@/services/orderService");

const mockOrderService = vi.mocked(orderService);

describe("useGuestOrderActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useGuestOrderActions());

      expect(result.current.isCancelling).toBe(false);
      expect(result.current.cancelError).toBe(null);
      expect(typeof result.current.cancelOrder).toBe("function");
      expect(typeof result.current.clearError).toBe("function");
    });
  });

  describe("cancelOrder", () => {
    it("should successfully cancel an order", async () => {
      const mockResult: GuestCancellationResult = { success: true };
      mockOrderService.cancelGuestOrder.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useGuestOrderActions());

      let cancelResult: GuestCancellationResult;
      await act(async () => {
        cancelResult = await result.current.cancelOrder(
          "order-123",
          "John Doe",
        );
      });

      expect(mockOrderService.cancelGuestOrder).toHaveBeenCalledWith(
        "order-123",
        "John Doe",
      );
      expect(cancelResult!).toEqual(mockResult);
      expect(result.current.isCancelling).toBe(false);
      expect(result.current.cancelError).toBe(null);
    });

    it("should handle cancellation errors from service", async () => {
      const mockResult: GuestCancellationResult = {
        success: false,
        error: {
          type: "validation",
          message: "Order is too old to cancel",
        },
      };
      mockOrderService.cancelGuestOrder.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useGuestOrderActions());

      let cancelResult: GuestCancellationResult;
      await act(async () => {
        cancelResult = await result.current.cancelOrder(
          "order-123",
          "John Doe",
        );
      });

      expect(cancelResult!).toEqual(mockResult);
      expect(result.current.cancelError).toBe("Order is too old to cancel");
      expect(result.current.isCancelling).toBe(false);
    });

    it("should handle service throwing an error", async () => {
      const mockError = new Error("Network error");
      mockOrderService.cancelGuestOrder.mockRejectedValue(mockError);

      const { result } = renderHook(() => useGuestOrderActions());

      let cancelResult: GuestCancellationResult;
      await act(async () => {
        cancelResult = await result.current.cancelOrder(
          "order-123",
          "John Doe",
        );
      });

      expect(cancelResult!.success).toBe(false);
      expect(cancelResult!.error?.message).toBe("Network error");
      expect(result.current.cancelError).toBe("Network error");
      expect(result.current.isCancelling).toBe(false);
    });

    it("should handle unknown error types", async () => {
      const unknownError = "Some unknown error";
      mockOrderService.cancelGuestOrder.mockRejectedValue(unknownError);

      const { result } = renderHook(() => useGuestOrderActions());

      let cancelResult: GuestCancellationResult;
      await act(async () => {
        cancelResult = await result.current.cancelOrder(
          "order-123",
          "John Doe",
        );
      });

      expect(cancelResult!.success).toBe(false);
      expect(cancelResult!.error?.message).toBe("An unexpected error occurred");
      expect(result.current.cancelError).toBe("An unexpected error occurred");
      expect(result.current.isCancelling).toBe(false);
    });

    it("should set isCancelling to true during operation", async () => {
      let resolvePromise: (_value: GuestCancellationResult) => void;
      const mockPromise = new Promise<GuestCancellationResult>((resolve) => {
        resolvePromise = resolve;
      });
      mockOrderService.cancelGuestOrder.mockReturnValue(mockPromise);

      const { result } = renderHook(() => useGuestOrderActions());

      // Start the cancellation
      act(() => {
        result.current.cancelOrder("order-123", "John Doe");
      });

      // Should be cancelling
      expect(result.current.isCancelling).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ success: true });
        await mockPromise;
      });

      // Should no longer be cancelling
      expect(result.current.isCancelling).toBe(false);
    });

    it("should clear error when starting new cancellation", async () => {
      // First, set an error
      const mockResult: GuestCancellationResult = {
        success: false,
        error: {
          type: "validation",
          message: "First error",
        },
      };
      mockOrderService.cancelGuestOrder.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useGuestOrderActions());

      await act(async () => {
        await result.current.cancelOrder("order-123", "John Doe");
      });

      expect(result.current.cancelError).toBe("First error");

      // Now start a new cancellation - should clear the error
      mockOrderService.cancelGuestOrder.mockResolvedValueOnce({
        success: true,
      });

      await act(async () => {
        await result.current.cancelOrder("order-456", "Jane Doe");
      });

      expect(result.current.cancelError).toBe(null);
    });
  });

  describe("clearError", () => {
    it("should clear the error state", async () => {
      // First, set an error
      const mockResult: GuestCancellationResult = {
        success: false,
        error: {
          type: "validation",
          message: "Test error",
        },
      };
      mockOrderService.cancelGuestOrder.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useGuestOrderActions());

      await act(async () => {
        await result.current.cancelOrder("order-123", "John Doe");
      });

      expect(result.current.cancelError).toBe("Test error");

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.cancelError).toBe(null);
    });
  });

  describe("State Management", () => {
    it("should maintain state consistency during multiple operations", async () => {
      const { result } = renderHook(() => useGuestOrderActions());

      // Start with clean state
      expect(result.current.isCancelling).toBe(false);
      expect(result.current.cancelError).toBe(null);

      // First operation - success
      mockOrderService.cancelGuestOrder.mockResolvedValueOnce({
        success: true,
      });

      await act(async () => {
        await result.current.cancelOrder("order-1", "User 1");
      });

      expect(result.current.isCancelling).toBe(false);
      expect(result.current.cancelError).toBe(null);

      // Second operation - error
      mockOrderService.cancelGuestOrder.mockResolvedValueOnce({
        success: false,
        error: { type: "validation", message: "Error message" },
      });

      await act(async () => {
        await result.current.cancelOrder("order-2", "User 2");
      });

      expect(result.current.isCancelling).toBe(false);
      expect(result.current.cancelError).toBe("Error message");

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.cancelError).toBe(null);
    });
  });
});
