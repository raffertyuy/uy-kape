import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { orderService } from "../orderService";

// Mock the supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "@/lib/supabase";

describe("orderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cancelGuestOrder", () => {
    it("should successfully cancel a pending order", async () => {
      const mockOrder = {
        id: "123",
        guest_name: "Test Guest",
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // Mock the chain for fetching order
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockOrder,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Mock the chain for updating order
      const mockUpdateEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
      (supabase.from as Mock)
        .mockReturnValueOnce({ select: mockSelect }) // First call for fetching
        .mockReturnValueOnce({ update: mockUpdate }); // Second call for updating

      const result = await orderService.cancelGuestOrder("123", "Test Guest");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail when order is not found", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      const result = await orderService.cancelGuestOrder("123", "Test Guest");

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Order not found");
    });

    it("should fail when guest name does not match", async () => {
      const mockOrder = {
        id: "123",
        guest_name: "Different Guest",
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockOrder,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      const result = await orderService.cancelGuestOrder("123", "Test Guest");

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("You can only cancel your own orders");
    });

    it("should fail when order is already completed", async () => {
      const mockOrder = {
        id: "123",
        guest_name: "Test Guest",
        status: "completed",
        created_at: new Date().toISOString(),
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockOrder,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      const result = await orderService.cancelGuestOrder("123", "Test Guest");

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe(
        "Cannot cancel order with status: completed. Only pending orders can be cancelled.",
      );
    });

    it("should fail when order is already cancelled", async () => {
      const mockOrder = {
        id: "123",
        guest_name: "Test Guest",
        status: "cancelled",
        created_at: new Date().toISOString(),
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockOrder,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      const result = await orderService.cancelGuestOrder("123", "Test Guest");

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe(
        "Cannot cancel order with status: cancelled. Only pending orders can be cancelled.",
      );
    });

    it("should fail when order is too old to cancel", async () => {
      // Create an order that's 35 minutes old (past 30 minute limit)
      const oldDate = new Date(Date.now() - 35 * 60 * 1000).toISOString();
      const mockOrder = {
        id: "123",
        guest_name: "Test Guest",
        status: "pending",
        created_at: oldDate,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockOrder,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      const result = await orderService.cancelGuestOrder("123", "Test Guest");

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe(
        "Order is too old to cancel. Please contact staff for assistance.",
      );
    });

    it("should handle database update errors", async () => {
      const mockOrder = {
        id: "123",
        guest_name: "Test Guest",
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // Mock successful fetch
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockOrder,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Mock failed update
      const mockUpdateEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database update failed" },
      });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
      (supabase.from as Mock)
        .mockReturnValueOnce({ select: mockSelect }) // First call for fetching
        .mockReturnValueOnce({ update: mockUpdate }); // Second call for updating

      const result = await orderService.cancelGuestOrder("123", "Test Guest");

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Failed to update order status");
    });
  });
});
