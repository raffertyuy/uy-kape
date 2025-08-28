/**
 * TypeScript definitions for telemetry data structures
 *
 * These types define the structure of telemetry data collected throughout
 * the application. All telemetry features are optional and these types
 * are only used when telemetry is enabled.
 */

/**
 * Performance measurement data structure
 */
export interface PerformanceMeasurement {
  /** Name/identifier of the performance measurement */
  name: string;
  /** Start time in milliseconds */
  startTime: number;
  /** Duration in milliseconds */
  duration: number;
  /** End time in milliseconds */
  endTime: number;
  /** Optional metadata associated with the measurement */
  metadata?: Record<string, unknown>;
}

/**
 * Supabase query performance data
 */
export interface QueryPerformance {
  /** Database table being queried */
  table: string;
  /** Type of operation (select, insert, update, delete, upsert) */
  operation: "select" | "insert" | "update" | "delete" | "upsert" | "rpc";
  /** Query execution time in milliseconds */
  duration: number;
  /** Whether the query exceeded the slow query threshold */
  isSlow: boolean;
  /** Timestamp when the query was executed */
  timestamp: number;
  /** Optional query parameters or metadata */
  metadata?: Record<string, unknown>;
  /** Error message if the query failed */
  error?: string;
}

/**
 * Connection quality metrics
 */
export interface ConnectionQuality {
  /** Connection status */
  status: "connected" | "disconnected" | "reconnecting" | "error";
  /** Round-trip time in milliseconds */
  latency?: number;
  /** Number of reconnection attempts */
  reconnectAttempts?: number;
  /** Last successful connection timestamp */
  lastConnected?: number;
  /** Error message if connection failed */
  error?: string;
}

/**
 * Component performance tracking data
 */
export interface ComponentPerformance {
  /** Component name */
  componentName: string;
  /** Performance measurement type */
  type: "mount" | "update" | "unmount" | "render";
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp when measurement was taken */
  timestamp: number;
  /** Optional component props or state data */
  metadata?: Record<string, unknown>;
}

/**
 * Error telemetry context
 */
export interface ErrorTelemetryContext {
  /** Error name/type */
  name: string;
  /** Error message */
  message: string;
  /** Error stack trace */
  stack?: string;
  /** Component where error occurred */
  componentStack?: string;
  /** User agent information */
  userAgent?: string;
  /** Current URL when error occurred */
  url?: string;
  /** Timestamp when error occurred */
  timestamp: number;
  /** Additional context data */
  context?: Record<string, unknown>;
}

/**
 * Network request telemetry data
 */
export interface NetworkTelemetry {
  /** Request URL */
  url: string;
  /** HTTP method */
  method: string;
  /** Response status code */
  status?: number;
  /** Request duration in milliseconds */
  duration: number;
  /** Request size in bytes */
  requestSize?: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Timestamp when request was made */
  timestamp: number;
  /** Error message if request failed */
  error?: string;
}

/**
 * Aggregated telemetry metrics
 */
export interface TelemetryMetrics {
  /** Performance measurements */
  performance: PerformanceMeasurement[];
  /** Database query performance */
  queries: QueryPerformance[];
  /** Connection quality data */
  connections: ConnectionQuality[];
  /** Component performance data */
  components: ComponentPerformance[];
  /** Error telemetry data */
  errors: ErrorTelemetryContext[];
  /** Network request data */
  network: NetworkTelemetry[];
}

/**
 * Telemetry event types for structured logging
 */
export type TelemetryEvent =
  | { type: "performance"; data: PerformanceMeasurement }
  | { type: "query"; data: QueryPerformance }
  | { type: "connection"; data: ConnectionQuality }
  | { type: "component"; data: ComponentPerformance }
  | { type: "error"; data: ErrorTelemetryContext }
  | { type: "network"; data: NetworkTelemetry };

/**
 * Configuration for telemetry features
 */
export interface TelemetryConfiguration {
  /** Whether Vercel telemetry is enabled */
  vercelEnabled: boolean;
  /** Whether Supabase telemetry is enabled */
  supabaseEnabled: boolean;
  /** Whether enhanced error reporting is enabled */
  enhancedErrorReporting: boolean;
  /** Slow query threshold in milliseconds */
  slowQueryThreshold: number;
}

/**
 * Telemetry context for React components
 */
export interface TelemetryContextValue {
  /** Current telemetry configuration */
  config: TelemetryConfiguration;
  /** Function to log telemetry events */
  logEvent: (_event: TelemetryEvent) => void;
  /** Function to get current metrics */
  getMetrics: () => TelemetryMetrics;
  /** Function to clear all metrics */
  clearMetrics: () => void;
}
