import { useState, useEffect } from 'react';
import { adminOrderService } from '../services/adminOrderService';
import type { AdminOrderListItem } from '../types/admin.types';

export const useRealtimeOrders = () => {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple function without useCallback
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminOrderService.getAllOrders();
      setOrders(response.orders);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Single useEffect that runs only once
  useEffect(() => {
    // Fetch initial orders
    fetchOrders();
  }, []); // Empty dependency array - runs only once

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};