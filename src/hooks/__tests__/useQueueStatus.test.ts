import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQueueStatus } from "../useQueueStatus";
import { orderService } from "@/services/orderService";
import { supabase } from "@/lib/supabase";
import type { OrderServiceError, OrderWithDetails } from "@/types/order.types";

// Mock the orderService
vi.mock("@/services/orderService", () => ({
  orderService: {
    getQueuePosition: vi.fn(),
    getOrderWithDetails: vi.fn(),
    getOrdersAheadInQueue: vi.fn(),
  },
}));

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    channel: vi.fn(),
  },
}));

// Mock calculateDynamicEstimatedTime
vi.mock("@/utils/queueUtils", () => ({
  calculateDynamicEstimatedTime: vi.fn(),
}));

import { calculateDynamicEstimatedTime } from "@/utils/queueUtils";

const mockOrderService = vi.mocked(orderService);
const mockSupabase = vi.mocked(supabase);
const mockCalculateDynamicEstimatedTime = vi.mocked(
  calculateDynamicEstimatedTime,
);

describe("useQueueStatus", () => {
  const mockOrderId = "550e8400-e29b-41d4-a716-446655440000";

  const mockOrderDetails: OrderWithDetails = {
    id: mockOrderId,
    guest_name: "Test User",
    drink_id: "drink-1",
    drink_name: "Espresso",
    drink_preparation_time_minutes: 3,
    special_request: null,
    status: "pending",
    queue_number: 2,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    selected_options: [],
  };

  const mockOrdersAhead = [
    { preparation_time_minutes: 3 }, // Another Espresso ahead
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock subscription
    const mockSubscription = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({
        unsubscribe: vi.fn(),
      }),
      unsubscribe: vi.fn(),
    } as any;

    mockSupabase.channel.mockReturnValue(mockSubscription);
    mockCalculateDynamicEstimatedTime.mockReturnValue("6 min");
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("initialization", () => {
    it("should return initial state when no orderId provided", () => {
      const { result } = renderHook(() => useQueueStatus(null));

      expect(result.current.queueStatus).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });

    it("should fetch queue status when orderId is provided", async () => {
      mockOrderService.getQueuePosition.mockResolvedValue(2);
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);
      mockOrderService.getOrdersAheadInQueue.mockResolvedValue(mockOrdersAhead);

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.queueStatus).not.toBeNull();
      });

      expect(mockOrderService.getQueuePosition).toHaveBeenCalledWith(
        mockOrderId,
      );
      expect(mockOrderService.getOrderWithDetails).toHaveBeenCalledWith(
        mockOrderId,
      );
      expect(mockOrderService.getOrdersAheadInQueue).toHaveBeenCalledWith(
        mockOrderId,
      );
    });
  });

  describe("dynamic wait time calculation", () => {
    it("should calculate wait time with preparation times when in queue", async () => {
      mockOrderService.getQueuePosition.mockResolvedValue(2);
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);
      mockOrderService.getOrdersAheadInQueue.mockResolvedValue(mockOrdersAhead);
      mockCalculateDynamicEstimatedTime.mockReturnValue("6 min");

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.queueStatus?.estimatedWaitTime).toBe("6 min");
      });

      // Should include both orders ahead and current order preparation time
      expect(mockCalculateDynamicEstimatedTime).toHaveBeenCalledWith([
        { preparation_time_minutes: 3 }, // Order ahead
        { preparation_time_minutes: 3 }, // Current order
      ]);
    });

    it("should handle zero preparation time correctly", async () => {
      const orderWithZeroPrep = {
        ...mockOrderDetails,
        drink_preparation_time_minutes: 0,
      };
      const ordersAheadWithZero = [
        { preparation_time_minutes: 3 },
        { preparation_time_minutes: 0 }, // Milo
      ];

      mockOrderService.getQueuePosition.mockResolvedValue(3);
      mockOrderService.getOrderWithDetails.mockResolvedValue(orderWithZeroPrep);
      mockOrderService.getOrdersAheadInQueue.mockResolvedValue(
        ordersAheadWithZero,
      );
      mockCalculateDynamicEstimatedTime.mockReturnValue("3 min");

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.queueStatus?.estimatedWaitTime).toBe("3 min");
      });

      expect(mockCalculateDynamicEstimatedTime).toHaveBeenCalledWith([
        { preparation_time_minutes: 3 },
        { preparation_time_minutes: 0 },
        { preparation_time_minutes: 0 }, // Current order
      ]);
    });

    it("should handle null preparation time correctly", async () => {
      const orderWithNullPrep = {
        ...mockOrderDetails,
        drink_preparation_time_minutes: null,
      };
      const ordersAheadWithNull = [
        { preparation_time_minutes: 3 },
        { preparation_time_minutes: null }, // Cappuccino
      ];

      mockOrderService.getQueuePosition.mockResolvedValue(3);
      mockOrderService.getOrderWithDetails.mockResolvedValue(orderWithNullPrep);
      mockOrderService.getOrdersAheadInQueue.mockResolvedValue(
        ordersAheadWithNull,
      );
      mockCalculateDynamicEstimatedTime.mockReturnValue("11 min");

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.queueStatus?.estimatedWaitTime).toBe("11 min");
      });

      expect(mockCalculateDynamicEstimatedTime).toHaveBeenCalledWith([
        { preparation_time_minutes: 3 },
        { preparation_time_minutes: null },
        { preparation_time_minutes: null }, // Current order
      ]);
    });

    it("should handle ready state for completed orders", async () => {
      const completedOrder: OrderWithDetails = {
        ...mockOrderDetails,
        status: "completed" as const,
      };

      mockOrderService.getQueuePosition.mockResolvedValue(0);
      mockOrderService.getOrderWithDetails.mockResolvedValue(completedOrder);

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.queueStatus?.estimatedWaitTime).toBe(
          "Order completed!",
        );
      });

      expect(result.current.queueStatus?.isReady).toBe(true);
      expect(result.current.queueStatus?.orderStatus).toBe("completed");
    });

    it("should show preparing message for position 0 pending orders", async () => {
      mockOrderService.getQueuePosition.mockResolvedValue(0);
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.queueStatus?.estimatedWaitTime).toBe(
          "Preparing your order...",
        );
      });

      expect(result.current.queueStatus?.isReady).toBe(false);
      expect(result.current.queueStatus?.position).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should handle order not found error", async () => {
      mockOrderService.getQueuePosition.mockResolvedValue(1);
      mockOrderService.getOrderWithDetails.mockResolvedValue(null);

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(result.current.error?.message).toBe("Order not found");
      expect(result.current.error?.type).toBe("network");
    });

    it("should handle orderService errors", async () => {
      const serviceError: OrderServiceError = {
        type: "database",
        message: "Database connection failed",
      };

      mockOrderService.getQueuePosition.mockRejectedValue(serviceError);

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.error).toEqual(serviceError);
      });
    });

    it("should handle generic errors", async () => {
      mockOrderService.getQueuePosition.mockRejectedValue(
        new Error("Network timeout"),
      );

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.error?.type).toBe("network");
        expect(result.current.error?.message).toBe("Network timeout");
      });
    });

    it("should clear errors using clearError action", async () => {
      const serviceError: OrderServiceError = {
        type: "database",
        message: "Database error",
      };

      mockOrderService.getQueuePosition.mockRejectedValue(serviceError);

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("refresh functionality", () => {
    it("should refresh status when refreshStatus is called", async () => {
      mockOrderService.getQueuePosition.mockResolvedValue(2);
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);
      mockOrderService.getOrdersAheadInQueue.mockResolvedValue(mockOrdersAhead);

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.queueStatus).not.toBeNull();
      });

      // Clear mocks to verify refresh call
      vi.clearAllMocks();

      // Call refresh
      await result.current.refreshStatus();

      expect(mockOrderService.getQueuePosition).toHaveBeenCalledWith(
        mockOrderId,
      );
      expect(mockOrderService.getOrderWithDetails).toHaveBeenCalledWith(
        mockOrderId,
      );
    });

    it("should handle loading state during refresh", async () => {
      let resolvePromise: (_value: number) => void;
      const promise = new Promise<number>((resolve) => {
        resolvePromise = resolve;
      });

      mockOrderService.getQueuePosition.mockReturnValue(promise);
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);
      mockOrderService.getOrdersAheadInQueue.mockResolvedValue(mockOrdersAhead);

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!(2);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("real-time subscriptions", () => {
    it("should setup real-time subscriptions when orderId is provided", () => {
      renderHook(() => useQueueStatus(mockOrderId));

      expect(mockSupabase.channel).toHaveBeenCalledWith(`order-${mockOrderId}`);
      expect(mockSupabase.channel).toHaveBeenCalledWith("queue-updates");
    });

    it("should not setup subscriptions when orderId is null", () => {
      renderHook(() => useQueueStatus(null));

      expect(mockSupabase.channel).not.toHaveBeenCalled();
    });

    it("should cleanup subscriptions on unmount", () => {
      const mockUnsubscribe = vi.fn();
      const mockSubscriptionResult = {
        unsubscribe: mockUnsubscribe,
      };
      const mockSubscription = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue(mockSubscriptionResult),
      } as any;

      mockSupabase.channel.mockReturnValue(mockSubscription);

      const { unmount } = renderHook(() => useQueueStatus(mockOrderId));

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should reset state when orderId changes to null", async () => {
      // Setup mocks for initial load
      mockOrderService.getQueuePosition.mockResolvedValue(2);
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);
      mockOrderService.getOrdersAheadInQueue.mockResolvedValue(mockOrdersAhead);
      mockCalculateDynamicEstimatedTime.mockReturnValue("6 min");

      const { result, rerender } = renderHook(
        ({ orderId }: { orderId: string | null }) => useQueueStatus(orderId),
        {
          initialProps: { orderId: mockOrderId },
        },
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.queueStatus).not.toBeNull();
      });

      // Change to null
      rerender({ orderId: null as any });

      expect(result.current.queueStatus).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });

    it("should handle empty orders ahead array", async () => {
      mockOrderService.getQueuePosition.mockResolvedValue(1);
      mockOrderService.getOrderWithDetails.mockResolvedValue(mockOrderDetails);
      mockOrderService.getOrdersAheadInQueue.mockResolvedValue([]);
      mockCalculateDynamicEstimatedTime.mockReturnValue("3 min");

      const { result } = renderHook(() => useQueueStatus(mockOrderId));

      await waitFor(() => {
        expect(result.current.queueStatus?.estimatedWaitTime).toBe("3 min");
      });

      // Should still include current order
      expect(mockCalculateDynamicEstimatedTime).toHaveBeenCalledWith([
        { preparation_time_minutes: 3 }, // Only current order
      ]);
    });
  });
});
