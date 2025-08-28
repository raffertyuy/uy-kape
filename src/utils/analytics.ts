/**
 * Google Analytics utility functions
 */

/**
 * Track a custom event in Google Analytics
 * @param eventName - The name of the event
 * @param parameters - Additional parameters for the event
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>,
): void => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
};

/**
 * Track page views in Google Analytics
 * @param pagePath - The page path
 * @param pageTitle - The page title (optional)
 */
export const trackPageView = (
  pagePath: string,
  pageTitle?: string,
): void => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-BWBRSYQ1TK", {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

/**
 * Microsoft Clarity utility functions
 */

/**
 * Track custom events in Microsoft Clarity
 * @param eventName - The name of the event
 * @param customData - Additional data for the event
 */
export const trackClarityEvent = (
  eventName: string,
  customData?: Record<string, unknown>,
): void => {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("event", eventName, customData);
  }
};

/**
 * Set custom tags in Microsoft Clarity for user segmentation
 * @param key - The tag key
 * @param value - The tag value
 */
export const setClarityTag = (key: string, value: string | number): void => {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("set", key, value);
  }
};

/**
 * Identify a user in Microsoft Clarity
 * @param userId - The user identifier
 * @param sessionId - Optional session identifier
 * @param pageId - Optional page identifier
 */
export const identifyClarityUser = (
  userId: string,
  sessionId?: string,
  pageId?: string,
): void => {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("identify", userId, sessionId, pageId);
  }
};

/**
 * Track user interactions with the coffee ordering system
 */
export const trackCoffeeEvent = {
  orderPlaced: (
    drinkName: string,
    quantity: number,
    specialRequest?: string,
  ) => {
    const eventData = {
      drink_name: drinkName,
      quantity,
      has_special_request: !!specialRequest,
    };

    // Track in Google Analytics
    trackEvent("order_placed", eventData);

    // Track in Microsoft Clarity
    trackClarityEvent("order_placed", {
      drinkName,
      quantity,
      hasSpecialRequest: !!specialRequest,
    });
  },

  drinkViewed: (drinkName: string, category: string) => {
    const eventData = {
      drink_name: drinkName,
      category,
    };

    // Track in Google Analytics
    trackEvent("drink_viewed", eventData);

    // Track in Microsoft Clarity
    trackClarityEvent("drink_viewed", {
      drinkName,
      category,
    });
  },

  menuCategoryChanged: (category: string) => {
    const eventData = {
      category,
    };

    // Track in Google Analytics
    trackEvent("menu_category_changed", eventData);

    // Track in Microsoft Clarity
    trackClarityEvent("menu_category_changed", {
      category,
    });
  },

  orderCompleted: (orderId: string, totalItems: number) => {
    const eventData = {
      order_id: orderId,
      total_items: totalItems,
    };

    // Track in Google Analytics
    trackEvent("order_completed", eventData);

    // Track in Microsoft Clarity
    trackClarityEvent("order_completed", {
      orderId,
      totalItems,
    });
  },

  guestAccess: () => {
    const eventData = {
      access_type: "guest_mode",
    };

    // Track in Google Analytics
    trackEvent("guest_access", eventData);

    // Track in Microsoft Clarity
    trackClarityEvent("guest_access", {
      accessType: "guest_mode",
    });

    // Set user tag in Clarity for segmentation
    setClarityTag("user_type", "guest");
  },

  adminAccess: () => {
    const eventData = {
      access_type: "admin_mode",
    };

    // Track in Google Analytics
    trackEvent("admin_access", eventData);

    // Track in Microsoft Clarity
    trackClarityEvent("admin_access", {
      accessType: "admin_mode",
    });

    // Set user tag in Clarity for segmentation
    setClarityTag("user_type", "admin");
  },
};
