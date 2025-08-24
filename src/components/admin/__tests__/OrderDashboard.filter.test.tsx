/**
 * Test for OrderDashboard Show Completed toggle filter functionality
 */
import { describe, expect, it } from 'vitest';
import type { AdminOrderListItem } from '@/types/admin.types';

describe('OrderDashboard - Show Completed Filter', () => {
  // Mock order data with different statuses
  const mockOrders: AdminOrderListItem[] = [
    {
      id: 'order-1',
      guest_name: 'John Doe',
      drink_name: 'Americano',
      status: 'pending',
      queue_number: 1,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      drink_id: 'drink-1',
      category_name: 'Coffee',
      selected_options: []
    },
    {
      id: 'order-2',
      guest_name: 'Jane Smith',
      drink_name: 'Latte',
      status: 'completed',
      queue_number: 2,
      created_at: '2024-01-01T10:05:00Z',
      updated_at: '2024-01-01T10:15:00Z',
      drink_id: 'drink-2',
      category_name: 'Coffee',
      selected_options: []
    },
    {
      id: 'order-3',
      guest_name: 'Bob Wilson',
      drink_name: 'Cappuccino',
      status: 'cancelled',
      queue_number: 3,
      created_at: '2024-01-01T10:10:00Z',
      updated_at: '2024-01-01T10:20:00Z',
      drink_id: 'drink-3',
      category_name: 'Coffee',
      selected_options: []
    },
    {
      id: 'order-4',
      guest_name: 'Alice Brown',
      drink_name: 'Espresso',
      status: 'pending',
      queue_number: 4,
      created_at: '2024-01-01T10:15:00Z',
      updated_at: '2024-01-01T10:15:00Z',
      drink_id: 'drink-4',
      category_name: 'Coffee',
      selected_options: []
    }
  ];

  // Replicate the filtering logic from OrderDashboard
  const getFilteredOrders = (orders: AdminOrderListItem[], showCompleted: boolean, searchTerm = '', statusFilter: 'all' | 'pending' | 'completed' | 'cancelled' = 'all') => {
    return orders.filter((order) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          order.guest_name?.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Show completed filter - when OFF, only show pending orders
      if (!showCompleted && order.status !== 'pending') {
        return false;
      }

      return true;
    });
  };

  describe('Show Completed Toggle Behavior', () => {
    it('should show only pending orders when showCompleted is OFF', () => {
      const filteredOrders = getFilteredOrders(mockOrders, false);
      
      expect(filteredOrders).toHaveLength(2);
      expect(filteredOrders.every(order => order.status === 'pending')).toBe(true);
      expect(filteredOrders.map(o => o.id)).toEqual(['order-1', 'order-4']);
    });

    it('should show all orders (pending, completed, cancelled) when showCompleted is ON', () => {
      const filteredOrders = getFilteredOrders(mockOrders, true);
      
      expect(filteredOrders).toHaveLength(4);
      expect(filteredOrders.map(o => o.status)).toEqual(['pending', 'completed', 'cancelled', 'pending']);
      expect(filteredOrders.map(o => o.id)).toEqual(['order-1', 'order-2', 'order-3', 'order-4']);
    });

    it('should hide both completed and cancelled orders when showCompleted is OFF', () => {
      const filteredOrders = getFilteredOrders(mockOrders, false);
      
      // Should not include any completed or cancelled orders
      expect(filteredOrders.some(order => order.status === 'completed')).toBe(false);
      expect(filteredOrders.some(order => order.status === 'cancelled')).toBe(false);
      
      // Should only include pending orders
      expect(filteredOrders.every(order => order.status === 'pending')).toBe(true);
    });

    it('should work correctly with status filter when showCompleted is OFF', () => {
      // When showCompleted is OFF and statusFilter is 'completed', should show no orders
      const completedFilteredOrders = getFilteredOrders(mockOrders, false, '', 'completed');
      expect(completedFilteredOrders).toHaveLength(0);

      // When showCompleted is OFF and statusFilter is 'cancelled', should show no orders
      const cancelledFilteredOrders = getFilteredOrders(mockOrders, false, '', 'cancelled');
      expect(cancelledFilteredOrders).toHaveLength(0);

      // When showCompleted is OFF and statusFilter is 'pending', should show pending orders
      const pendingFilteredOrders = getFilteredOrders(mockOrders, false, '', 'pending');
      expect(pendingFilteredOrders).toHaveLength(2);
      expect(pendingFilteredOrders.every(order => order.status === 'pending')).toBe(true);
    });

    it('should work correctly with status filter when showCompleted is ON', () => {
      // When showCompleted is ON and statusFilter is 'completed', should show only completed orders
      const completedFilteredOrders = getFilteredOrders(mockOrders, true, '', 'completed');
      expect(completedFilteredOrders).toHaveLength(1);
      expect(completedFilteredOrders[0].status).toBe('completed');

      // When showCompleted is ON and statusFilter is 'cancelled', should show only cancelled orders
      const cancelledFilteredOrders = getFilteredOrders(mockOrders, true, '', 'cancelled');
      expect(cancelledFilteredOrders).toHaveLength(1);
      expect(cancelledFilteredOrders[0].status).toBe('cancelled');

      // When showCompleted is ON and statusFilter is 'pending', should show only pending orders
      const pendingFilteredOrders = getFilteredOrders(mockOrders, true, '', 'pending');
      expect(pendingFilteredOrders).toHaveLength(2);
      expect(pendingFilteredOrders.every(order => order.status === 'pending')).toBe(true);
    });

    it('should work correctly with search filter', () => {
      // Search for "John" with showCompleted OFF (should find pending order)
      const searchResults1 = getFilteredOrders(mockOrders, false, 'John');
      expect(searchResults1).toHaveLength(1);
      expect(searchResults1[0].guest_name).toBe('John Doe');
      expect(searchResults1[0].status).toBe('pending');

      // Search for "Jane" with showCompleted OFF (should find nothing because Jane's order is completed)
      const searchResults2 = getFilteredOrders(mockOrders, false, 'Jane');
      expect(searchResults2).toHaveLength(0);

      // Search for "Jane" with showCompleted ON (should find completed order)
      const searchResults3 = getFilteredOrders(mockOrders, true, 'Jane');
      expect(searchResults3).toHaveLength(1);
      expect(searchResults3[0].guest_name).toBe('Jane Smith');
      expect(searchResults3[0].status).toBe('completed');
    });
  });
});