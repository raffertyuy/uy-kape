import { describe, expect, it } from "vitest";
import { isTelemetryEnabled, telemetryConfig } from "../telemetryConfig";

describe("telemetryConfig", () => {
  describe("default test environment configuration", () => {
    it("should have telemetry disabled by default in tests", () => {
      // In test environment, telemetry should be disabled by default
      expect(telemetryConfig.vercel.enabled).toBe(false);
      expect(telemetryConfig.vercel.speedInsights).toBe(false);
      expect(telemetryConfig.vercel.performanceTracking).toBe(false);

      expect(telemetryConfig.supabase.enabled).toBe(false);
      expect(telemetryConfig.supabase.queryLogging).toBe(false);
      expect(telemetryConfig.supabase.connectionMonitoring).toBe(false);

      expect(telemetryConfig.enhancedErrorReporting).toBe(false);
    });

    it("should use default slow query threshold", () => {
      expect(telemetryConfig.slowQueryThreshold).toBe(500);
    });

    it("should return false for isTelemetryEnabled when disabled", () => {
      expect(isTelemetryEnabled()).toBe(false);
    });
  });

  describe("telemetry configuration object structure", () => {
    it("should have correct vercel configuration structure", () => {
      expect(telemetryConfig.vercel).toHaveProperty("enabled");
      expect(telemetryConfig.vercel).toHaveProperty("speedInsights");
      expect(telemetryConfig.vercel).toHaveProperty("performanceTracking");

      expect(typeof telemetryConfig.vercel.enabled).toBe("boolean");
      expect(typeof telemetryConfig.vercel.speedInsights).toBe("boolean");
      expect(typeof telemetryConfig.vercel.performanceTracking).toBe("boolean");
    });

    it("should have correct supabase configuration structure", () => {
      expect(telemetryConfig.supabase).toHaveProperty("enabled");
      expect(telemetryConfig.supabase).toHaveProperty("queryLogging");
      expect(telemetryConfig.supabase).toHaveProperty("connectionMonitoring");

      expect(typeof telemetryConfig.supabase.enabled).toBe("boolean");
      expect(typeof telemetryConfig.supabase.queryLogging).toBe("boolean");
      expect(typeof telemetryConfig.supabase.connectionMonitoring).toBe(
        "boolean",
      );
    });

    it("should have correct general configuration structure", () => {
      expect(telemetryConfig).toHaveProperty("slowQueryThreshold");
      expect(telemetryConfig).toHaveProperty("enhancedErrorReporting");

      expect(typeof telemetryConfig.slowQueryThreshold).toBe("number");
      expect(typeof telemetryConfig.enhancedErrorReporting).toBe("boolean");
    });
  });

  describe("telemetry consistency rules", () => {
    it("should have consistent vercel feature flags", () => {
      const { vercel } = telemetryConfig;
      // All vercel features should be consistent with the master switch
      expect(vercel.speedInsights).toBe(vercel.enabled);
      expect(vercel.performanceTracking).toBe(vercel.enabled);
    });

    it("should have consistent supabase feature flags", () => {
      const { supabase } = telemetryConfig;
      // All supabase features should be consistent with the master switch
      expect(supabase.queryLogging).toBe(supabase.enabled);
      expect(supabase.connectionMonitoring).toBe(supabase.enabled);
    });

    it("should have consistent enhanced error reporting", () => {
      const { vercel, supabase, enhancedErrorReporting } = telemetryConfig;
      // Enhanced error reporting should be enabled if either telemetry system is enabled
      const expectedErrorReporting = vercel.enabled || supabase.enabled;
      expect(enhancedErrorReporting).toBe(expectedErrorReporting);
    });

    it("should have isTelemetryEnabled consistent with config", () => {
      const { vercel, supabase } = telemetryConfig;
      const expectedEnabled = vercel.enabled || supabase.enabled;
      expect(isTelemetryEnabled()).toBe(expectedEnabled);
    });
  });

  describe("configuration validation", () => {
    it("should have numeric slow query threshold", () => {
      expect(typeof telemetryConfig.slowQueryThreshold).toBe("number");
      expect(telemetryConfig.slowQueryThreshold).toBeGreaterThan(0);
      expect(Number.isFinite(telemetryConfig.slowQueryThreshold)).toBe(true);
    });

    it("should have reasonable default values", () => {
      // If telemetry is disabled (default in tests), should use defaults
      if (!isTelemetryEnabled()) {
        expect(telemetryConfig.slowQueryThreshold).toBe(500);
      }
    });
  });
});
