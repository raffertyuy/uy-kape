import type { Database } from "./database.types";

// Database types
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
export type OrderOptions = Database["public"]["Tables"]["order_options"]["Row"];
export type OrderOptionsInsert =
  Database["public"]["Tables"]["order_options"]["Insert"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];

// Guest order form interface
export interface GuestOrderForm {
  guest_name: string;
  drink_id: string;
  special_request?: string;
  selected_options: Record<string, string>; // option_category_id -> option_value_id
}

// Order creation request interface
export interface CreateOrderRequest {
  guest_name: string;
  drink_id: string;
  special_request?: string;
  selected_options: Record<string, string>; // option_category_id -> option_value_id
}

// Order submission result
export interface OrderSubmissionResult {
  order_id: string;
  queue_number: number;
  estimated_wait_time?: string;
}

// Order with detailed information
export interface OrderWithDetails {
  id: string;
  guest_name: string;
  drink_id: string;
  drink_name?: string;
  category_name?: string;
  special_request?: string | null;
  status: OrderStatus;
  queue_number: number;
  selected_options: OrderOptionsDetail[];
  created_at: string;
  updated_at: string;
}

// Option detail for display
export interface OrderOptionsDetail {
  option_category_id: string;
  option_category_name: string;
  option_value_id: string;
  option_value_name: string;
}

// Queue status information
export interface QueueStatus {
  position: number;
  estimated_wait_minutes?: number;
  status: OrderStatus;
}

// Order form validation errors
export interface OrderFormErrors {
  guest_name?: string;
  drink_id?: string;
  options?: Record<string, string>;
  general?: string;
}

// Order service error types
export interface OrderServiceError {
  type: "validation" | "network" | "database" | "permission" | "unknown";
  message: string;
  details?: unknown;
}

// Order operation result type
export type OrderOperationResult<T> =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; data: T }
  | { state: "error"; error: OrderServiceError };

// Guest order cancellation result type
export interface GuestCancellationResult {
  success: boolean;
  error?: OrderServiceError;
}
