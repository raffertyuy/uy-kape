import { useCallback, useState } from "react";

/**
 * Browser notification service for order updates
 * Handles permission requests, notification display, and audio alerts
 */

export interface NotificationOptions {
  /**
   * Title of the notification
   */
  title: string;
  /**
   * Body text of the notification
   */
  body: string;
  /**
   * Icon to display (URL or data URI)
   */
  icon?: string;
  /**
   * Tag for grouping notifications
   */
  tag?: string;
  /**
   * Whether to require user interaction to dismiss
   */
  requireInteraction?: boolean;
  /**
   * Custom data to attach to notification
   */
  data?: unknown;
  /**
   * Whether to play audio alert
   */
  playAudio?: boolean;
  /**
   * Audio alert type
   */
  audioType?: "new-order" | "order-ready" | "order-completed" | "error";
}

export interface NotificationServiceInterface {
  /**
   * Check if notifications are supported
   */
  isSupported: boolean;
  /**
   * Current permission status
   */
  permission: string;
  /**
   * Request notification permission
   */
  requestPermission(): Promise<string>;
  /**
   * Show a notification
   */
  showNotification(_options: NotificationOptions): Promise<any>;
  /**
   * Play audio alert
   */
  playAudio(_type?: NotificationOptions["audioType"]): Promise<void>;
  /**
   * Clear all notifications with a specific tag
   */
  clearNotifications(_tag?: string): void;
  /**
   * Check if notifications are enabled in settings
   */
  areNotificationsEnabled(): boolean;
  /**
   * Enable/disable notifications
   */
  setNotificationsEnabled(_enabled: boolean): void;
}

class BrowserNotificationService implements NotificationServiceInterface {
  private settingsKey = "uy-kape-notifications-enabled";

  get isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  get permission(): string {
    return this.isSupported ? window.Notification.permission : "denied";
  }

  async requestPermission(): Promise<string> {
    if (!this.isSupported) {
      return "denied";
    }

    // If already granted or denied, return current status
    if (this.permission !== "default") {
      return this.permission;
    }

    try {
      const permission = await window.Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return "denied";
    }
  }

  async showNotification(options: NotificationOptions): Promise<any> {
    // Check if notifications are enabled
    if (!this.areNotificationsEnabled()) {
      return null;
    }

    // Ensure we have permission
    if (this.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return null;
      }
    }

    try {
      // Play audio first if requested
      if (options.playAudio && options.audioType) {
        await this.playAudio(options.audioType);
      }

      // Create notification with proper type handling
      const notificationOptions: any = {
        body: options.body,
        icon: options.icon || "/logo-192.png",
        badge: "/logo-192.png",
      };

      // Only add optional properties if they're defined
      if (options.tag) {
        notificationOptions.tag = options.tag;
      }
      if (typeof options.requireInteraction === "boolean") {
        notificationOptions.requireInteraction = options.requireInteraction;
      }
      if (options.data) {
        notificationOptions.data = options.data;
      }

      const notification = new window.Notification(
        options.title,
        notificationOptions,
      );

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error("Failed to show notification:", error);
      return null;
    }
  }

  async playAudio(
    type: NotificationOptions["audioType"] = "new-order",
  ): Promise<void> {
    try {
      // Create a simple audio beep using Web Audio API
      if (typeof window !== "undefined" && "AudioContext" in window) {
        const AudioContext = window.AudioContext ||
          (window as any).webkitAudioContext;
        const context = new AudioContext();

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        // Different frequencies for different types
        const frequency = this.getFrequencyForType(type);
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          context.currentTime + 0.3,
        );

        oscillator.start();
        oscillator.stop(context.currentTime + 0.3);
      }
    } catch (error) {
      console.warn("Could not play audio alert:", error);
    }
  }

  clearNotifications(_tag?: string): void {
    // Note: There's no standard way to programmatically close notifications
    // This is a limitation of the Notification API
    if (import.meta.env.VITE_IS_DEV === "true") {
      // eslint-disable-next-line no-console
      console.info(`Clearing notifications${_tag ? ` with tag: ${_tag}` : ""}`);
    }
  }

  areNotificationsEnabled(): boolean {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(this.settingsKey);
    return stored !== null ? JSON.parse(stored) : true; // Default to enabled
  }

  setNotificationsEnabled(enabled: boolean): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.settingsKey, JSON.stringify(enabled));
    }
  }

  private getFrequencyForType(type?: string): number {
    switch (type) {
      case "new-order":
        return 800; // High, attention-getting
      case "order-ready":
        return 600; // Medium, pleasant
      case "order-completed":
        return 400; // Low, completion
      case "error":
        return 300; // Low, concerning
      default:
        return 600;
    }
  }
}

// Create singleton instance
export const notificationService = new BrowserNotificationService();

/**
 * React hook for managing notifications
 */
export function useNotifications() {
  const [permission, setPermission] = useState<string>(
    notificationService.permission,
  );
  const [enabled, setEnabled] = useState(
    notificationService.areNotificationsEnabled(),
  );

  const requestPermission = useCallback(async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    return newPermission;
  }, []);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    return notificationService.showNotification(options);
  }, []);

  const toggleNotifications = useCallback((enabled: boolean) => {
    notificationService.setNotificationsEnabled(enabled);
    setEnabled(enabled);
  }, []);

  return {
    isSupported: notificationService.isSupported,
    permission,
    enabled,
    requestPermission,
    showNotification,
    toggleNotifications,
    playAudio: notificationService.playAudio.bind(notificationService),
  };
}

/**
 * Specific notification helpers for order events
 */
export const orderNotifications = {
  newOrder: (orderNumber: string, customerName: string, items: number) => ({
    title: `New Order #${orderNumber}`,
    body: `${customerName} ordered ${items} item${items > 1 ? "s" : ""}`,
    tag: "new-order",
    requireInteraction: true,
    playAudio: true,
    audioType: "new-order" as const,
    data: { type: "new-order", orderNumber },
  }),

  orderReady: (orderNumber: string, customerName: string) => ({
    title: `Order #${orderNumber} Ready`,
    body: `${customerName}'s order is ready for pickup`,
    tag: "order-ready",
    requireInteraction: false,
    playAudio: true,
    audioType: "order-ready" as const,
    data: { type: "order-ready", orderNumber },
  }),

  orderCompleted: (orderNumber: string, customerName: string) => ({
    title: `Order #${orderNumber} Completed`,
    body: `${customerName}'s order has been completed`,
    tag: "order-completed",
    requireInteraction: false,
    playAudio: false,
    audioType: "order-completed" as const,
    data: { type: "order-completed", orderNumber },
  }),

  connectionError: () => ({
    title: "Connection Problem",
    body: "Lost connection to order system. Check your internet connection.",
    tag: "connection-error",
    requireInteraction: false,
    playAudio: true,
    audioType: "error" as const,
    data: { type: "error", category: "connection" },
  }),

  systemError: (message: string) => ({
    title: "System Error",
    body: message,
    tag: "system-error",
    requireInteraction: false,
    playAudio: true,
    audioType: "error" as const,
    data: { type: "error", category: "system" },
  }),
};

export default notificationService;
