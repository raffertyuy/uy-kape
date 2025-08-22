import { useCallback, useRef, useState } from "react";
import type { AdminOrderListItem } from "../types/admin.types";

export interface OrderOperationOptions {
  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;
  /**
   * Base delay between retries in milliseconds
   */
  retryDelay?: number;
  /**
   * Whether to use exponential backoff for retries
   */
  exponentialBackoff?: boolean;
  /**
   * Callback for when an operation succeeds after retries
   */
  onRetrySuccess?: (_attempts: number) => void;
  /**
   * Callback for when an operation fails after all retries
   */
  onRetryFailure?: (_error: Error, _attempts: number) => void;
}

export interface OrderOperationState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  lastAttemptAt: Date | null;
}

export interface UseOrderOperationsReturn {
  /**
   * Current operation state
   */
  operationState: OrderOperationState;
  /**
   * Execute an order operation with error handling and retry logic
   */
  executeOperation: <T>(
    _operation: () => Promise<T>,
    _options?: OrderOperationOptions,
  ) => Promise<T>;
  /**
   * Reset the operation state
   */
  resetOperation: () => void;
  /**
   * Check if the operation can be retried
   */
  canRetry: boolean;
  /**
   * Manually retry the last failed operation
   */
  retryLastOperation: () => Promise<void>;
}

/**
 * Hook for handling order operations with comprehensive error handling and retry logic
 * Provides a consistent interface for executing order-related operations with built-in
 * error handling, loading states, and automatic retry mechanisms.
 */
export function useOrderOperations(): UseOrderOperationsReturn {
  const [operationState, setOperationState] = useState<OrderOperationState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    lastAttemptAt: null,
  });

  // Store the last operation for manual retry
  const lastOperationRef = useRef<
    {
      operation: () => Promise<any>;
      options: OrderOperationOptions;
    } | null
  >(null);

  const resetOperation = useCallback(() => {
    setOperationState({
      isLoading: false,
      error: null,
      retryCount: 0,
      lastAttemptAt: null,
    });
    lastOperationRef.current = null;
  }, []);

  const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const calculateRetryDelay = (
    attempt: number,
    baseDelay: number,
    exponentialBackoff: boolean,
  ): number => {
    if (!exponentialBackoff) {
      return baseDelay;
    }
    return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
  };

  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: OrderOperationOptions = {},
  ): Promise<T> => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      exponentialBackoff = true,
      onRetrySuccess,
      onRetryFailure,
    } = options;

    // Store operation for potential manual retry
    lastOperationRef.current = { operation, options };

    setOperationState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      lastAttemptAt: new Date(),
    }));

    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const result = await operation();

        // Success - reset state and call success callback if this was a retry
        setOperationState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          retryCount: attempt,
        }));

        if (attempt > 0 && onRetrySuccess) {
          onRetrySuccess(attempt);
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        setOperationState((prev) => ({
          ...prev,
          retryCount: attempt,
          lastAttemptAt: new Date(),
        }));

        // If we've exhausted all retries, break out of the loop
        if (attempt > maxRetries) {
          break;
        }

        // Calculate delay for next retry
        const delay = calculateRetryDelay(
          attempt,
          retryDelay,
          exponentialBackoff,
        );

        // Log retry attempt in development
        if (import.meta.env.VITE_IS_DEV === "true") {
          console.warn(
            `Order operation failed (attempt ${attempt}/${maxRetries + 1}). ` +
              `Retrying in ${delay}ms...`,
            lastError,
          );
        }

        // Wait before retrying
        await sleep(delay);
      }
    }

    // All retries exhausted - update state and call failure callback
    const finalError = lastError ||
      new Error("Operation failed with unknown error");
    setOperationState((prev) => ({
      ...prev,
      isLoading: false,
      error: finalError,
    }));

    if (onRetryFailure) {
      onRetryFailure(finalError, attempt - 1);
    }

    throw finalError;
  }, []);

  const retryLastOperation = useCallback(async (): Promise<void> => {
    if (!lastOperationRef.current) {
      throw new Error("No operation to retry");
    }

    const { operation, options } = lastOperationRef.current;
    await executeOperation(operation, options);
  }, [executeOperation]);

  const canRetry = operationState.error !== null &&
    lastOperationRef.current !== null;

  return {
    operationState,
    executeOperation,
    resetOperation,
    canRetry,
    retryLastOperation,
  };
}

/**
 * Specialized hook for order status updates with optimistic updates
 */
export function useOrderStatusOperations() {
  const {
    executeOperation,
    operationState,
    resetOperation,
    canRetry,
    retryLastOperation,
  } = useOrderOperations();

  const updateOrderStatus = useCallback(async (
    orderId: string,
    newStatus: AdminOrderListItem["status"],
    updateFunction: (
      _orderId: string,
      _status: AdminOrderListItem["status"],
    ) => Promise<void>,
  ) => {
    return executeOperation(
      () => updateFunction(orderId, newStatus),
      {
        maxRetries: 2,
        retryDelay: 1500,
        exponentialBackoff: true,
        onRetrySuccess: (attempts) => {
          // Log success in development mode
          if (import.meta.env.VITE_IS_DEV === "true") {
            // eslint-disable-next-line no-console
            console.info(
              `Order status update succeeded after ${attempts} retries`,
            );
          }
        },
        onRetryFailure: (error, attempts) => {
          console.error(
            `Order status update failed after ${attempts} retries:`,
            error,
          );
        },
      },
    );
  }, [executeOperation]);

  return {
    updateOrderStatus,
    operationState,
    resetOperation,
    canRetry,
    retryLastOperation,
  };
}

/**
 * Hook for batch order operations with progress tracking
 */
export function useBatchOrderOperations() {
  const [batchProgress, setBatchProgress] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    errors: [] as Error[],
  });

  const executeBatchOperation = useCallback(async <T>(
    items: T[],
    operation: (_item: T) => Promise<void>,
    _options: OrderOperationOptions = {},
  ) => {
    setBatchProgress({
      total: items.length,
      completed: 0,
      failed: 0,
      errors: [],
    });

    const results = await Promise.allSettled(
      items.map(async (item) => {
        try {
          await operation(item);
          setBatchProgress((prev) => ({
            ...prev,
            completed: prev.completed + 1,
          }));
        } catch (error) {
          const errorObj = error instanceof Error
            ? error
            : new Error(String(error));
          setBatchProgress((prev) => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [...prev.errors, errorObj],
          }));
          throw errorObj;
        }
      }),
    );

    return results;
  }, []);

  const resetBatchProgress = useCallback(() => {
    setBatchProgress({
      total: 0,
      completed: 0,
      failed: 0,
      errors: [],
    });
  }, []);

  return {
    batchProgress,
    executeBatchOperation,
    resetBatchProgress,
  };
}

/**
 * Utility function to determine error type for better error handling
 */
export function getErrorType(
  error: Error,
): "network" | "database" | "permission" | "unknown" {
  const message = error.message.toLowerCase();

  if (
    message.includes("network") || message.includes("fetch") ||
    message.includes("connection")
  ) {
    return "network";
  }

  if (
    message.includes("database") || message.includes("supabase") ||
    message.includes("postgresql")
  ) {
    return "database";
  }

  if (
    message.includes("permission") || message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    return "permission";
  }

  return "unknown";
}
