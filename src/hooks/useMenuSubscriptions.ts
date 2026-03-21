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

/** Menu tables monitored for real-time changes */
const MENU_TABLES = [
  "drink_categories",
  "drinks",
  "option_categories",
  "option_values",
  "drink_options",
] as const;

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

  // Single consolidated channel for all menu tables (instead of 5 separate channels).
  // The useMenuData hooks already create per-table channels for data refetching;
  // this channel is only for UI tracking (connection status, change history).
  useEffect(() => {
    let channel = supabase.channel("menu_realtime_consolidated");

    for (const table of MENU_TABLES) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          const change: MenuChange = {
            table,
            event: payload.eventType as MenuChange["event"],
            data: payload.new || payload.old,
            timestamp: new Date(),
          };
          handleExternalChange(change);
        },
      );
    }

    channel.subscribe((status) => {
      setConnectionStatus((prev) => ({
        ...prev,
        connected: status === "SUBSCRIBED",
        error: status === "CLOSED" ? "Failed to connect to menu updates" : null,
      }));
    });

    return () => {
      channel.unsubscribe();
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
