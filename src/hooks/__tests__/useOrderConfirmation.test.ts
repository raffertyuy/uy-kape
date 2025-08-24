import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOrderConfirmation } from "../useOrderConfirmation";
import { orderService } from "@/services/orderService";
import type { OrderServiceError, OrderWithDetails } from "@/types/order.types";

// Mock the orderService
vi.mock("@/services/orderService", () => ({
  orderService: {
    getOrderWithDetails: vi.fn(),
    getQueuePosition: vi.fn(),
  },
}));

// Mock the useQueueStatus hook
vi.mock("../useQueueStatus", () => ({
  useQueueStatus: vi.fn(),
}));

import { useQueueStatus } from "../useQueueStatus";

const mockUseQueueStatus = vi.mocked(useQueueStatus);
const mockOrderService = vi.mocked(orderService);

describe("useOrderConfirmation", () => {
  const mockOrderDetails: OrderWithDetails = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    guest_name: "Test User",
    drink_id: "drink-1",
    drink_name: "Test Coffee",
    special_request: "Extra hot",
    status: "pending",
    queue_number: 5,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    selected_options: [],
  };

  const mockQueueStatus = {
    queueStatus: {
      position: 3,
      estimatedWaitTime: "15 minutes",
      isReady: false,
      orderStatus: "pending" as const,
    },
    isLoading: false,
    error: null,
    refreshStatus: vi.fn(),
    clearError: vi.fn(),
    isConnected: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQueueStatus.mockReturnValue(mockQueueStatus);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("with valid order ID", () => {
    it("should fetch order details for valid order ID", async () => {
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);

      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440000")
      );

      expect(result.current.isLoading).toBe(true);
      expect(mockOrderService.getOrderWithDetails).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.orderDetails).toEqual(mockOrderDetails);
      expect(result.current.orderResult).toEqual({
        order_id: "550e8400-e29b-41d4-a716-446655440000",
        queue_number: 5,
        estimated_wait_time: "15 minutes",
      });
      expect(result.current.error).toBeNull();
    });

    it("should integrate with queue status hook", async () => {
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);

      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440000")
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockUseQueueStatus).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );
      expect(result.current.queueStatus).toEqual(mockQueueStatus.queueStatus);
      expect(result.current.isConnected).toBe(true);
    });

    it("should provide refresh functionality", async () => {
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);

      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440000")
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Reset mock call count
      mockOrderService.getOrderWithDetails.mockClear();

      // Call refresh
      await result.current.refreshOrder();

      expect(mockOrderService.getOrderWithDetails).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );
    });
  });

  describe("with invalid order ID", () => {
    it("should handle order not found error", async () => {
      const notFoundError: OrderServiceError = {
        type: "database",
        message:
          "Order not found. Please check your order ID or contact support.",
      };
      mockOrderService.getOrderWithDetails.mockRejectedValue(notFoundError);

      // Use a valid UUID format that will pass validation but fail at service level
      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440001")
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(notFoundError);
      expect(result.current.orderDetails).toBeNull();
      expect(result.current.orderResult).toBeNull();
    });

    it("should handle validation error for invalid order ID format", async () => {
      const { result } = renderHook(() => useOrderConfirmation("short"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        type: "validation",
        message:
          "Invalid order ID format. Please check your order ID and try again.",
      });
      expect(result.current.orderDetails).toBeNull();
    });

    it("should handle empty order ID", async () => {
      const { result } = renderHook(() => useOrderConfirmation(""));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        type: "validation",
        message: "Order ID is required",
      });
      expect(result.current.orderDetails).toBeNull();
    });

    it("should handle malformed UUID format", async () => {
      const { result } = renderHook(() => useOrderConfirmation("123-abc-def"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        type: "validation",
        message:
          "Invalid order ID format. Please check your order ID and try again.",
      });
      expect(result.current.orderDetails).toBeNull();
    });

    it("should handle network errors", async () => {
      const networkError = new Error("fetch failed");
      mockOrderService.getOrderWithDetails.mockRejectedValue(networkError);

      // Use a valid UUID format
      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440002")
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        type: "network",
        message:
          "Unable to connect to server. Please check your internet connection.",
      });
    });

    it("should handle unknown errors", async () => {
      const unknownError = new Error("Unknown error");
      mockOrderService.getOrderWithDetails.mockRejectedValue(unknownError);

      // Use a valid UUID format
      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440003")
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        type: "unknown",
        message: "Unknown error",
      });
    });
  });

  describe("with null order ID", () => {
    it("should not fetch data when order ID is null", () => {
      const { result } = renderHook(() => useOrderConfirmation(null));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.orderDetails).toBeNull();
      expect(result.current.orderResult).toBeNull();
      expect(result.current.error).toBeNull();
      expect(mockOrderService.getOrderWithDetails).not.toHaveBeenCalled();
    });

    it("should clear data when order ID changes to null", async () => {
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);

      const { result, rerender } = renderHook<
        ReturnType<typeof useOrderConfirmation>,
        { orderId: string | null }
      >(
        ({ orderId }) => useOrderConfirmation(orderId),
        { initialProps: { orderId: "550e8400-e29b-41d4-a716-446655440000" } },
      );

      await waitFor(() => {
        expect(result.current.orderDetails).toEqual(mockOrderDetails);
      });

      // Change to null
      rerender({ orderId: null });

      expect(result.current.orderDetails).toBeNull();
      expect(result.current.orderResult).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should provide clearError functionality", async () => {
      const error: OrderServiceError = {
        type: "network",
        message: "Network error",
      };
      mockOrderService.getOrderWithDetails.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440004")
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      result.current.clearError();

      expect(mockQueueStatus.clearError).toHaveBeenCalled();
    });
  });

  describe("queue status integration", () => {
    it("should update order result when queue status changes", async () => {
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);

      const { result, rerender } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440000")
      );

      await waitFor(() => {
        expect(result.current.orderResult?.estimated_wait_time).toBe(
          "15 minutes",
        );
      });

      // Update queue status
      const updatedQueueStatus = {
        ...mockQueueStatus,
        queueStatus: {
          ...mockQueueStatus.queueStatus,
          estimatedWaitTime: "10 minutes",
        },
      };
      mockUseQueueStatus.mockReturnValue(updatedQueueStatus);

      rerender();

      await waitFor(() => {
        expect(result.current.orderResult?.estimated_wait_time).toBe(
          "10 minutes",
        );
      });
    });

    it("should handle queue status errors", () => {
      const queueError: OrderServiceError = {
        type: "network",
        message: "Queue status error",
      };

      mockUseQueueStatus.mockReturnValue({
        ...mockQueueStatus,
        error: queueError,
      });

      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440000")
      );

      expect(result.current.error).toEqual(queueError);
    });

    it("should combine loading states from order details and queue status", () => {
      mockUseQueueStatus.mockReturnValue({
        ...mockQueueStatus,
        isLoading: true,
      });

      const { result } = renderHook(() =>
        useOrderConfirmation("550e8400-e29b-41d4-a716-446655440000")
      );

      expect(result.current.isLoading).toBe(true);
    });
  });
});
