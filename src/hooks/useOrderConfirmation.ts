import { useCallback, useEffect, useState } from "react";
import { useQueueStatus } from "./useQueueStatus";
import { orderService } from "@/services/orderService";
import type {
  OrderServiceError,
  OrderSubmissionResult,
  OrderWithDetails,
} from "@/types/order.types";

interface UseOrderConfirmationReturn {
  // Order confirmation data
  orderResult: OrderSubmissionResult | null;
  orderDetails: OrderWithDetails | null;

  // Queue status integration
  queueStatus: ReturnType<typeof useQueueStatus>["queueStatus"];
  isConnected: ReturnType<typeof useQueueStatus>["isConnected"];

  // Loading states
  isLoading: boolean;

  // Error handling
  error: OrderServiceError | null;

  // Actions
  refreshOrder: () => Promise<void>;
  clearError: () => void;
}

export function useOrderConfirmation(
  orderId: string | null,
): UseOrderConfirmationReturn {
  // State
  const [orderResult, setOrderResult] = useState<OrderSubmissionResult | null>(
    null,
  );
  const [orderDetails, setOrderDetails] = useState<OrderWithDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<OrderServiceError | null>(null);

  // Queue status integration
  const queueStatusHook = useQueueStatus(orderId);

  // Fetch order confirmation data
  const fetchOrderData = useCallback(
    async (orderIdToFetch: string): Promise<void> => {
      try {
        setError(null);
        setIsLoading(true);

        // Enhanced validation for orderId format
        if (!orderIdToFetch || orderIdToFetch.trim().length === 0) {
          throw {
            type: "validation",
            message: "Order ID is required",
          } as OrderServiceError;
        }

        // Check for valid UUID format (basic UUID pattern validation)
        const uuidPattern =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(orderIdToFetch.trim())) {
          throw {
            type: "validation",
            message:
              "Invalid order ID format. Please check your order ID and try again.",
          } as OrderServiceError;
        }

        // Get order details
        const details = await orderService.getOrderWithDetails(orderIdToFetch);

        if (!details) {
          throw {
            type: "database",
            message:
              "Order not found. Please check your order ID or contact support.",
          } as OrderServiceError;
        }

        setOrderDetails(details);

        // Create order result from details if not already set
        if (!orderResult) {
          const result: OrderSubmissionResult = {
            order_id: details.id,
            queue_number: details.queue_number,
            ...(queueStatusHook.queueStatus?.estimatedWaitTime && {
              estimated_wait_time:
                queueStatusHook.queueStatus.estimatedWaitTime,
            }),
          };
          setOrderResult(result);
        }
      } catch (err) {
        // Enhanced error handling with specific error types
        if (err && typeof err === "object" && "type" in err) {
          setError(err as OrderServiceError);
        } else if (err instanceof Error) {
          // Network or other standard errors
          if (err.message.includes("fetch")) {
            setError({
              type: "network",
              message:
                "Unable to connect to server. Please check your internet connection.",
            });
          } else if (err.message.includes("not found")) {
            setError({
              type: "database",
              message:
                "Order not found. It may have been completed or cancelled.",
            });
          } else {
            setError({
              type: "unknown",
              message: err.message,
            });
          }
        } else {
          setError({
            type: "unknown",
            message:
              "An unexpected error occurred while loading your order confirmation.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [orderResult, queueStatusHook.queueStatus?.estimatedWaitTime],
  );

  // Refresh order action
  const refreshOrder = useCallback(async (): Promise<void> => {
    if (orderId === null) return;
    await fetchOrderData(orderId);
  }, [orderId, fetchOrderData]);

  // Clear error action
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch when orderId changes
  useEffect(() => {
    if (orderId === null) {
      setOrderResult(null);
      setOrderDetails(null);
      setError(null);
      return;
    }

    fetchOrderData(orderId);
  }, [orderId, fetchOrderData]);

  // Update order result when queue status changes
  useEffect(() => {
    if (orderDetails && queueStatusHook.queueStatus?.estimatedWaitTime) {
      const estimatedWaitTime = queueStatusHook.queueStatus.estimatedWaitTime;
      setOrderResult((prev) =>
        prev
          ? {
            ...prev,
            estimated_wait_time: estimatedWaitTime,
          }
          : null
      );
    }
  }, [orderDetails, queueStatusHook.queueStatus]);

  return {
    // Order confirmation data
    orderResult,
    orderDetails,

    // Queue status integration
    queueStatus: queueStatusHook.queueStatus,
    isConnected: queueStatusHook.isConnected,

    // Loading states
    isLoading: isLoading || queueStatusHook.isLoading,

    // Error handling
    error: error || queueStatusHook.error,

    // Actions
    refreshOrder,
    clearError: () => {
      clearError();
      queueStatusHook.clearError();
    },
  };
}

export default useOrderConfirmation;
