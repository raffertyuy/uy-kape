import { useCallback, useEffect, useState } from "react";
import { adminOrderService } from "@/services/adminOrderService";
import type {
  AdminOrderError,
  OrderStatistics,
  QueueManagement,
} from "@/types/admin.types";

interface UseOrderStatsState {
  statistics: OrderStatistics | null;
  queueManagement: QueueManagement | null;
  loading: boolean;
  error: AdminOrderError | null;
  lastUpdated: Date | null;
}

interface UseOrderStatsOptions {
  dateRange?: { from: string; to: string };
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseOrderStatsReturn extends UseOrderStatsState {
  refetch: () => Promise<void>;
  refetchStatistics: () => Promise<void>;
  refetchQueueManagement: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing order statistics and queue management data
 * Provides real-time statistics calculation and display with automatic refresh
 */
export const useOrderStats = (
  options: UseOrderStatsOptions = {},
): UseOrderStatsReturn => {
  const {
    dateRange,
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute default
  } = options;

  const [state, setState] = useState<UseOrderStatsState>({
    statistics: null,
    queueManagement: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  // Fetch statistics
  const refetchStatistics = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const statistics = await adminOrderService.getOrderStatistics(dateRange);

      setState((prev) => ({
        ...prev,
        statistics,
        lastUpdated: new Date(),
        error: null,
      }));
    } catch (error) {
      console.error("Failed to fetch order statistics:", error);
      setState((prev) => ({
        ...prev,
        error: error as AdminOrderError,
      }));
    }
  }, [dateRange]);

  // Fetch queue management data
  const refetchQueueManagement = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const queueManagement = await adminOrderService.getQueueManagement();

      setState((prev) => ({
        ...prev,
        queueManagement,
        lastUpdated: new Date(),
        error: null,
      }));
    } catch (error) {
      console.error("Failed to fetch queue management data:", error);
      setState((prev) => ({
        ...prev,
        error: error as AdminOrderError,
      }));
    }
  }, []);

  // Fetch all data
  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      await Promise.all([
        refetchStatistics(),
        refetchQueueManagement(),
      ]);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [refetchStatistics, refetchQueueManagement]);

  // Clear error state
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const intervalId = window.setInterval(refetch, refreshInterval);

      return () => {
        window.clearInterval(intervalId);
      };
    }
  }, [autoRefresh, refreshInterval, refetch]);

  // Initial data fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Refetch when date range changes
  useEffect(() => {
    if (dateRange) {
      refetchStatistics();
    }
  }, [dateRange, refetchStatistics]);

  return {
    statistics: state.statistics,
    queueManagement: state.queueManagement,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    refetch,
    refetchStatistics,
    refetchQueueManagement,
    clearError,
  };
};

// Helper function to format statistics for display
export const formatStatistics = (stats: OrderStatistics | null) => {
  if (!stats) return null;

  return {
    totalOrders: stats.total_pending + stats.total_completed +
      stats.total_cancelled,
    pendingOrders: stats.total_pending,
    completedOrders: stats.total_completed,
    cancelledOrders: stats.total_cancelled,
    averageWaitTime: `${stats.average_wait_time} min`,
    ordersToday: stats.orders_today,
    peakHour: stats.peak_hours.length > 0
      ? `${stats.peak_hours[0].hour}:00 (${stats.peak_hours[0].count} orders)`
      : "No data",
    completionRate: stats.total_completed + stats.total_cancelled > 0
      ? Math.round(
        (stats.total_completed /
          (stats.total_completed + stats.total_cancelled)) * 100,
      )
      : 0,
  };
};

// Helper function to format queue management data
export const formatQueueManagement = (queue: QueueManagement | null) => {
  if (!queue) return null;

  const estimatedTime = new Date(queue.estimated_completion_time);
  const now = new Date();
  const timeDiff = estimatedTime.getTime() - now.getTime();
  const minutesRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60)));

  return {
    totalOrders: queue.total_orders,
    currentPosition: queue.current_position,
    estimatedWaitTime: `${minutesRemaining} min`,
    averageProcessingTime: `${queue.average_processing_time} min/order`,
    estimatedCompletionTime: estimatedTime.toLocaleTimeString(),
  };
};
