import { appConfig } from "@/config/app.config";

// Helper function to calculate estimated time based on position (legacy)
export const calculateEstimatedTime = (
  position: number,
  averageTimePerOrder?: number,
): string => {
  const waitTime = averageTimePerOrder ?? appConfig.waitTimePerOrder;

  if (position <= 0) return "Ready";

  const minutes = position * waitTime;

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

// New helper function to calculate estimated time based on preparation times of orders ahead
export const calculateDynamicEstimatedTime = (
  ordersAhead: Array<{ preparation_time_minutes: number | null }>,
): string => {
  if (ordersAhead.length === 0) return "Ready";

  // Sum up preparation times, using fallback for drinks without specific times
  const totalMinutes = ordersAhead.reduce((total, order) => {
    const prepTime = order.preparation_time_minutes ??
      appConfig.waitTimePerOrder;
    return total + prepTime;
  }, 0);

  if (totalMinutes === 0) return "Ready";

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

// Helper function to format queue position display
export const formatQueuePosition = (
  position: number,
  total?: number,
): string => {
  if (position <= 0) return "Not in queue";
  return total ? `${position} of ${total}` : `#${position}`;
};

// Helper function to determine queue urgency level
export const getQueueUrgency = (
  position: number,
  waitTime: number,
): "normal" | "high" | "urgent" => {
  if (waitTime > 30) return "urgent";
  if (waitTime > 15 || position <= 3) return "high";
  return "normal";
};
