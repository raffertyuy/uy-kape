import { useState } from "react";
import { orderService } from "@/services/orderService";
import type { GuestCancellationResult } from "@/types/order.types";

interface UseGuestOrderActionsResult {
  cancelOrder: (
    _orderId: string,
    _guestName: string,
  ) => Promise<GuestCancellationResult>;
  isCancelling: boolean;
  cancelError: string | null;
  clearError: () => void;
}

/**
 * Hook for guest order actions like cancellation
 */
export function useGuestOrderActions(): UseGuestOrderActionsResult {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const cancelOrder = async (
    _orderId: string,
    _guestName: string,
  ): Promise<GuestCancellationResult> => {
    setIsCancelling(true);
    setCancelError(null);

    try {
      const result = await orderService.cancelGuestOrder(_orderId, _guestName);

      if (!result.success && result.error) {
        setCancelError(result.error.message);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "An unexpected error occurred";
      setCancelError(errorMessage);

      return {
        success: false,
        error: {
          type: "unknown",
          message: errorMessage,
          details: error,
        },
      };
    } finally {
      setIsCancelling(false);
    }
  };

  const clearError = () => {
    setCancelError(null);
  };

  return {
    cancelOrder,
    isCancelling,
    cancelError,
    clearError,
  };
}
