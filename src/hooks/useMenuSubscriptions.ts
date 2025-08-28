import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { telemetryHelpers } from "@/utils/telemetryLogger";
import { telemetryConfig } from "@/config/telemetryConfig";

export interface MenuChange {
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE";
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

export const useMenuSubscriptions = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastUpdate: null,
    error: null,
  });

  const [recentChanges, setRecentChanges] = useState<MenuChange[]>([]);
  const [conflictItems, setConflictItems] = useState<Set<string>>(new Set());

  // Track external changes (not from current user)
  const handleExternalChange = useCallback((change: MenuChange) => {
    // Add to recent changes (keep last 10)
    setRecentChanges((prev) => [change, ...prev].slice(0, 10));

    // Update connection status
    setConnectionStatus((prev) => ({
      ...prev,
      lastUpdate: new Date(),
      error: null,
    }));

    // Log connection status for telemetry (optional)
    if (telemetryConfig.supabase.connectionMonitoring) {
      telemetryHelpers.logConnection("connected");
    }
  }, []);

  // Subscribe to drink categories changes
  useEffect(() => {
    const subscription = supabase
      .channel("drink_categories_realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "drink_categories",
      }, (payload) => {
        const change: MenuChange = {
          table: "drink_categories",
          event: payload.eventType as any,
          data: payload.new || payload.old,
          timestamp: new Date(),
        };
        handleExternalChange(change);
      })
      .subscribe((status) => {
        setConnectionStatus((prev) => ({
          ...prev,
          connected: status === "SUBSCRIBED",
          error: status === "CLOSED"
            ? "Failed to connect to drink categories"
            : null,
        }));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleExternalChange]);

  // Subscribe to drinks changes
  useEffect(() => {
    const subscription = supabase
      .channel("drinks_realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "drinks",
      }, (payload) => {
        const change: MenuChange = {
          table: "drinks",
          event: payload.eventType as any,
          data: payload.new || payload.old,
          timestamp: new Date(),
        };
        handleExternalChange(change);
      })
      .subscribe((status) => {
        setConnectionStatus((prev) => ({
          ...prev,
          connected: status === "SUBSCRIBED",
          error: status === "CLOSED" ? "Failed to connect to drinks" : null,
        }));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleExternalChange]);

  // Subscribe to option categories changes
  useEffect(() => {
    const subscription = supabase
      .channel("option_categories_realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "option_categories",
      }, (payload) => {
        const change: MenuChange = {
          table: "option_categories",
          event: payload.eventType as any,
          data: payload.new || payload.old,
          timestamp: new Date(),
        };
        handleExternalChange(change);
      })
      .subscribe((status) => {
        setConnectionStatus((prev) => ({
          ...prev,
          connected: status === "SUBSCRIBED",
          error: status === "CLOSED"
            ? "Failed to connect to option categories"
            : null,
        }));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleExternalChange]);

  // Subscribe to option values changes
  useEffect(() => {
    const subscription = supabase
      .channel("option_values_realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "option_values",
      }, (payload) => {
        const change: MenuChange = {
          table: "option_values",
          event: payload.eventType as any,
          data: payload.new || payload.old,
          timestamp: new Date(),
        };
        handleExternalChange(change);
      })
      .subscribe((status) => {
        setConnectionStatus((prev) => ({
          ...prev,
          connected: status === "SUBSCRIBED",
          error: status === "CLOSED"
            ? "Failed to connect to option values"
            : null,
        }));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleExternalChange]);

  // Subscribe to drink options changes
  useEffect(() => {
    const subscription = supabase
      .channel("drink_options_realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "drink_options",
      }, (payload) => {
        const change: MenuChange = {
          table: "drink_options",
          event: payload.eventType as any,
          data: payload.new || payload.old,
          timestamp: new Date(),
        };
        handleExternalChange(change);
      })
      .subscribe((status) => {
        setConnectionStatus((prev) => ({
          ...prev,
          connected: status === "SUBSCRIBED",
          error: status === "CLOSED"
            ? "Failed to connect to drink options"
            : null,
        }));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleExternalChange]);

  // Add conflict detection
  const markAsConflicted = useCallback((itemId: string) => {
    setConflictItems((prev) => new Set(prev).add(itemId));
  }, []);

  const resolveConflict = useCallback((itemId: string) => {
    setConflictItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  // Clear old changes
  const clearRecentChanges = useCallback(() => {
    setRecentChanges([]);
  }, []);

  return {
    connectionStatus,
    recentChanges,
    conflictItems,
    markAsConflicted,
    resolveConflict,
    clearRecentChanges,
  };
};
