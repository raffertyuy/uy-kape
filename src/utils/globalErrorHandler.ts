import type { ErrorCategory, ErrorDetails } from "../hooks/useErrorHandling";
import { telemetryHelpers } from "./telemetryLogger";
import { isTelemetryEnabled } from "../config/telemetryConfig";

export interface GlobalErrorConfig {
  enableLogging: boolean;
  logLevel: "error" | "warn" | "info";
  enableDevDetails: boolean;
}

export interface RecoveryStrategy {
  type: "retry" | "reload" | "redirect" | "manual";
  action?: () => void;
  url?: string;
  message?: string;
}

// Default configuration based on environment
const defaultConfig: GlobalErrorConfig = {
  enableLogging: true,
  logLevel: "error",
  enableDevDetails: import.meta.env.VITE_IS_DEV === "true",
};

let globalConfig: GlobalErrorConfig = { ...defaultConfig };

// Utility to safely check if we're offline
const getOnlineStatus = (): boolean => {
  if (typeof window === "undefined") return true;
  return window.navigator ? window.navigator.onLine : true;
};

// Utility to safely get user agent
const getUserAgent = (): string => {
  if (typeof window === "undefined") return "server";
  return window.navigator ? window.navigator.userAgent : "unknown";
};

export const configureGlobalErrorHandler = (
  config: Partial<GlobalErrorConfig>,
) => {
  globalConfig = { ...globalConfig, ...config };
};

export const categorizeError = (error: any): ErrorCategory => {
  // Network-related errors
  if (
    error?.name === "NetworkError" ||
    error?.message?.includes("fetch") ||
    error?.message?.includes("network") ||
    error?.code === "NETWORK_ERROR" ||
    !getOnlineStatus()
  ) {
    return "network";
  }

  // HTTP error responses
  if (error?.status || error?.response?.status) {
    const status = error.status || error.response.status;

    // Server errors (5xx)
    if (status >= 500) {
      return "network"; // Treat server errors as network issues for user experience
    }

    // Authentication/authorization errors (401, 403)
    if (status === 401 || status === 403) {
      return "permission";
    }

    // Conflict errors (409)
    if (status === 409) {
      return "conflict";
    }

    // Bad request/validation errors (400-499)
    if (status >= 400 && status < 500) {
      return "validation";
    }
  }

  // Supabase-specific errors
  if (error?.code?.startsWith("PGRST")) {
    if (error.code === "PGRST301") return "permission";
    if (error.code === "PGRST116") return "conflict";
    return "validation";
  }

  // Validation-specific errors
  if (
    error?.name === "ValidationError" ||
    error?.message?.includes("validation") ||
    error?.message?.includes("invalid")
  ) {
    return "validation";
  }

  return "unknown";
};

export const getUserFriendlyMessage = (
  error: any,
  category: ErrorCategory,
): string => {
  // Check for custom user message first
  if (error?.userMessage) {
    return error.userMessage;
  }

  switch (category) {
    case "network":
      if (!getOnlineStatus()) {
        return "You appear to be offline. Please check your internet connection and try again.";
      }
      if (error?.status >= 500) {
        return "Our coffee servers are having trouble right now. Please try again in a moment.";
      }
      return "Unable to connect to our servers. Please check your internet connection and try again.";

    case "permission":
      if (error?.status === 401) {
        return "Your session has expired. Please log in again to continue.";
      }
      return "You do not have permission to perform this action. Please contact your administrator.";

    case "validation":
      // Try to extract meaningful validation message
      if (error?.message && !error.message.includes("fetch")) {
        return error.message;
      }
      return "The information you entered is invalid. Please check your input and try again.";

    case "conflict":
      return "This item was modified by someone else. Please refresh and try again.";

    default:
      // For unknown errors, try to provide the original message if it's user-friendly
      if (
        error?.message && error.message.length < 100 &&
        !error.message.includes("fetch")
      ) {
        return error.message;
      }
      return "Something unexpected happened. Please try again or contact support if the problem persists.";
  }
};

export const getRecoveryStrategy = (
  errorCategory: ErrorCategory,
  error?: any,
): RecoveryStrategy => {
  switch (errorCategory) {
    case "network":
      if (!getOnlineStatus()) {
        return {
          type: "manual",
          message:
            "Please check your internet connection and try again when you're back online.",
        };
      }
      return {
        type: "retry",
        message: "Try the action again in a moment.",
      };

    case "permission":
      if (error?.status === 401) {
        return {
          type: "redirect",
          url: "/",
          message: "Please log in again to continue.",
        };
      }
      return {
        type: "manual",
        message: "Contact your administrator for access.",
      };

    case "validation":
      return {
        type: "manual",
        message: "Please correct the highlighted fields and try again.",
      };

    case "conflict":
      return {
        type: "reload",
        message: "Refresh the page to get the latest information.",
      };

    default:
      return {
        type: "retry",
        message:
          "Try the action again, or refresh the page if the problem persists.",
      };
  }
};

export const handleGlobalError = (
  error: any,
  context?: string,
): ErrorDetails => {
  const category = categorizeError(error);
  const userMessage = getUserFriendlyMessage(error, category);

  const errorDetails: ErrorDetails = {
    code: error?.code || error?.name || error?.status?.toString(),
    message: userMessage,
    details: globalConfig.enableDevDetails
      ? {
        originalError: error,
        stack: error?.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: getUserAgent(),
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      }
      : undefined,
    timestamp: new Date(),
    ...(context && { action: context }),
  };

  // Log error to telemetry if enabled (optional feature)
  if (isTelemetryEnabled()) {
    try {
      telemetryHelpers.logError(
        error instanceof Error
          ? error
          : new Error(error?.message || "Unknown error"),
        {
          category,
          userMessage,
          originalCode: error?.code,
          originalStatus: error?.status,
          handlerContext: context,
          ...(globalConfig.enableDevDetails && {
            url: typeof window !== "undefined"
              ? window.location.href
              : "unknown",
            userAgent: getUserAgent(),
          }),
        },
      );
    } catch (telemetryError) {
      // Telemetry logging should never affect error handling
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to log error to telemetry:", telemetryError);
      }
    }
  }

  // Log error based on configuration
  if (globalConfig.enableLogging) {
    const logData = {
      category,
      context,
      userMessage,
      originalError: error,
      ...(globalConfig.enableDevDetails && {
        stack: error?.stack,
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        userAgent: getUserAgent(),
      }),
    };

    switch (globalConfig.logLevel) {
      case "info":
        // eslint-disable-next-line no-console
        console.info("Global Error (Info):", logData);
        break;
      case "warn":
        // eslint-disable-next-line no-console
        console.warn("Global Error (Warning):", logData);
        break;
      case "error":
      default:
        // eslint-disable-next-line no-console
        console.error("Global Error:", logData);
        break;
    }
  }

  return errorDetails;
};

// Utility function to wrap async operations with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string,
): Promise<{ data: T | null; error: ErrorDetails | null }> => {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const errorDetails = handleGlobalError(error, context);
    return { data: null, error: errorDetails };
  }
};

// Utility function to handle errors with automatic retry
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  _context?: string,
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const category = categorizeError(error);

      // Don't retry validation or permission errors
      if (category === "validation" || category === "permission") {
        throw error;
      }

      // Don't retry if we're on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
};

// Utility to detect if we're offline
export const isOffline = (): boolean => {
  return !getOnlineStatus();
};

// Utility to check if an error is retryable
export const isRetryableError = (error: any): boolean => {
  const category = categorizeError(error);
  return category === "network";
};
