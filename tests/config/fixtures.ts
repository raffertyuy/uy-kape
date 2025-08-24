/**
 * Common test fixtures and mock data
 * Shared across unit and integration tests
 */

import type { Database } from "../../src/types/database.types";

// Database table row types
export type DrinkCategory =
  Database["public"]["Tables"]["drink_categories"]["Row"];
export type Drink = Database["public"]["Tables"]["drinks"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OptionCategory =
  Database["public"]["Tables"]["option_categories"]["Row"];
export type OptionValue = Database["public"]["Tables"]["option_values"]["Row"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];

// Common interface types
export interface GuestInfo {
  customerName: string;
  phoneNumber?: string;
  specialRequests?: string | null;
}

// ===== DRINK CATEGORIES =====
export const mockDrinkCategories: DrinkCategory[] = [
  {
    id: "cat-1",
    name: "Coffee",
    description: "Hot and cold coffee beverages",
    is_active: true,
    display_order: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Tea",
    description: "Various tea selections",
    is_active: true,
    display_order: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-3",
    name: "Specialty Drinks",
    description: "Unique house specialties",
    is_active: true,
    display_order: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// ===== DRINKS =====
export const mockDrinks: Drink[] = [
  {
    id: "drink-1",
    name: "Americano",
    description: "Classic espresso with hot water",
    category_id: "cat-1",
    is_active: true,
    display_order: 1,
    preparation_time_minutes: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "drink-2",
    name: "Latte",
    description: "Rich espresso with steamed milk",
    category_id: "cat-1",
    is_active: true,
    display_order: 2,
    preparation_time_minutes: 5,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "drink-3",
    name: "Green Tea",
    description: "Fresh green tea leaves",
    category_id: "cat-2",
    is_active: true,
    display_order: 1,
    preparation_time_minutes: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// ===== GUEST INFO =====
export const mockGuestInfo: GuestInfo = {
  customerName: "John Doe",
  phoneNumber: "+639123456789",
  specialRequests: "Extra hot, please!",
};

// ===== ORDERS =====
export const mockOrders: Order[] = [
  {
    id: "order-1",
    guest_name: "John Doe",
    drink_id: "drink-1",
    status: "pending",
    queue_number: 1,
    special_request: "Extra hot, please!",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
  {
    id: "order-2",
    guest_name: "Jane Smith",
    drink_id: "drink-2",
    status: "completed",
    queue_number: 2,
    special_request: null,
    created_at: "2024-01-01T10:05:00Z",
    updated_at: "2024-01-01T10:10:00Z",
  },
  {
    id: "order-3",
    guest_name: "Bob Wilson",
    drink_id: "drink-3",
    status: "completed",
    queue_number: 3,
    special_request: "Takeaway",
    created_at: "2024-01-01T09:30:00Z",
    updated_at: "2024-01-01T09:45:00Z",
  },
];

// ===== OPTION CATEGORIES =====
export const mockOptionCategories: OptionCategory[] = [
  {
    id: "opt-cat-1",
    name: "Size",
    description: "Choose your drink size",
    is_required: true,
    display_order: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "opt-cat-2",
    name: "Milk Type",
    description: "Choose your preferred milk",
    is_required: false,
    display_order: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// ===== OPTION VALUES =====
export const mockOptionValues: OptionValue[] = [
  {
    id: "opt-val-1",
    option_category_id: "opt-cat-1",
    name: "Small",
    description: null,
    is_active: true,
    display_order: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "opt-val-2",
    option_category_id: "opt-cat-1",
    name: "Medium",
    description: null,
    is_active: true,
    display_order: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "opt-val-3",
    option_category_id: "opt-cat-2",
    name: "Regular Milk",
    description: null,
    is_active: true,
    display_order: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "opt-val-4",
    option_category_id: "opt-cat-2",
    name: "Oat Milk",
    description: null,
    is_active: true,
    display_order: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// ===== TEST HELPERS =====

/**
 * Creates a minimal drink for testing
 */
export const createMockDrink = (overrides: Partial<Drink> = {}): Drink => ({
  id: "mock-drink-id",
  name: "Mock Drink",
  description: "A test drink",
  category_id: "cat-1",
  is_active: true,
  display_order: 1,
  preparation_time_minutes: 3,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

/**
 * Creates a minimal order for testing
 */
export const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "mock-order-id",
  guest_name: "Test Customer",
  drink_id: "drink-1",
  status: "pending",
  queue_number: 1,
  special_request: null,
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
  ...overrides,
});

/**
 * Creates a minimal guest info for testing
 */
export const createMockGuestInfo = (
  overrides: Partial<GuestInfo> = {},
): GuestInfo => ({
  customerName: "Test Customer",
  phoneNumber: "+639123456789",
  specialRequests: null,
  ...overrides,
});

/**
 * Creates a minimal drink category for testing
 */
export const createMockDrinkCategory = (
  overrides: Partial<DrinkCategory> = {},
): DrinkCategory => ({
  id: "mock-category-id",
  name: "Mock Category",
  description: "A test category",
  is_active: true,
  display_order: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

/**
 * Waits for a specified amount of time (useful for debounce testing)
 */
export const waitFor = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates mock error objects for testing error handling
 */
export const createMockError = (message = "Test error", code?: string) => {
  const error = new Error(message);
  if (code) {
    (error as Error & { code?: string }).code = code;
  }
  return error;
};
