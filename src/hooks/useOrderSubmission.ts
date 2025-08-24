import { useCallback, useState } from "react";
import type {
  GuestOrderForm,
  OrderServiceError,
  OrderSubmissionResult,
} from "@/types/order.types";
import { orderService } from "@/services/orderService";

interface UseOrderSubmissionReturn {
  // Submission state
  isSubmitting: boolean;
  isSuccess: boolean;
  result: OrderSubmissionResult | null;
  error: OrderServiceError | null;

  // Actions
  submitGuestOrder: (
    _orderData: GuestOrderForm,
  ) => Promise<{ success: boolean; result?: OrderSubmissionResult }>;
  resetSubmission: () => void;
  clearError: () => void;

  // Status helpers
  canSubmit: boolean;
  shouldShowSuccess: boolean;
  shouldShowError: boolean;
}

export function useOrderSubmission(): UseOrderSubmissionReturn {
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [result, setResult] = useState<OrderSubmissionResult | null>(null);
  const [error, setError] = useState<OrderServiceError | null>(null);

  // Submit order action
  const submitGuestOrder = useCallback(
    async (
      orderData: GuestOrderForm,
    ): Promise<{ success: boolean; result?: OrderSubmissionResult }> => {
      setIsSubmitting(true);
      setError(null);
      setIsSuccess(false);
      setResult(null);

      try {
        const submissionResult = await orderService.submitOrder(orderData);
        setResult(submissionResult);
        setIsSuccess(true);
        return { success: true, result: submissionResult };
      } catch (err) {
        if (err && typeof err === "object" && "type" in err) {
          // It's an OrderServiceError
          setError(err as OrderServiceError);
        } else {
          // Fallback error
          setError({
            type: "network",
            message: err instanceof Error
              ? err.message
              : "Failed to submit order",
          });
        }
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  // Reset submission state
  const resetSubmission = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setResult(null);
    setError(null);
  }, []);

  // Clear error only
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed status helpers
  const canSubmit = !isSubmitting && !isSuccess;
  const shouldShowSuccess = isSuccess && result !== null;
  const shouldShowError = error !== null && !isSubmitting;

  return {
    // Submission state
    isSubmitting,
    isSuccess,
    result,
    error,

    // Actions
    submitGuestOrder,
    resetSubmission,
    clearError,

    // Status helpers
    canSubmit,
    shouldShowSuccess,
    shouldShowError,
  };
}

export default useOrderSubmission;
