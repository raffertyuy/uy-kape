import type { OrderStatus } from "@/types/order.types";

export const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: "⏳",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200",
  },
  completed: {
    label: "Completed",
    icon: "🎉",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: "❌",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-200",
  },
} as const;

// Helper function to get status color class
export const getStatusColorClass = (
  status: OrderStatus,
  variant: "bg" | "text" | "border" = "bg",
) => {
  const config = STATUS_CONFIG[status];
  if (!config) return "";

  switch (variant) {
    case "bg":
      return config.bgColor;
    case "text":
      return config.textColor;
    case "border":
      return config.borderColor;
    default:
      return config.bgColor;
  }
};

// Helper function to check if status is actionable
export const isStatusActionable = (status: OrderStatus): boolean => {
  return status === "pending";
};

// Helper function to get next possible statuses
export const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case "pending":
      return ["completed", "cancelled"];
    case "completed":
    case "cancelled":
    default:
      return [];
  }
};
