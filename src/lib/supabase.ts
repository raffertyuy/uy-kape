import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { testConnectivity, retryNetworkOperation, isNetworkError } from '@/utils/networkUtils';
import { validateEnvironmentConfig } from '@/config/environment';

// Validate environment configuration on load
const configValidation = validateEnvironmentConfig();
if (!configValidation.isValid) {
  console.error('❌ Environment Configuration Errors:');
  configValidation.errors.forEach(error => console.error(`  • ${error}`));
  
  // In development, also show warnings
  if (import.meta.env.MODE === 'development' && configValidation.warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    configValidation.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Detect test environments
const isVitest = Boolean((import.meta as any)?.vitest);
const isTestEnv = import.meta.env.VITE_IS_TEST === "true" || isVitest;

// Resolve credentials with safe fallbacks in test runs
let resolvedUrl = supabaseUrl;
let resolvedAnonKey = supabaseAnonKey;

if ((!resolvedUrl || !resolvedAnonKey) && isTestEnv) {
  resolvedUrl = "http://localhost:54321";
  resolvedAnonKey = "test-anon-key";
}

if (!resolvedUrl || !resolvedAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient<Database>(resolvedUrl, resolvedAnonKey);

// Connection health check utilities
export interface SupabaseHealthCheck {
  isHealthy: boolean
  latency: number | null
  error: string | null
  timestamp: Date
}

// Check Supabase connection health
export const checkSupabaseHealth = async (timeout: number = 5000): Promise<SupabaseHealthCheck> => {
  const startTime = Date.now()
  
  try {
    // Test a simple query to check connectivity
    const { error } = await supabase
      .from('drink_categories')
      .select('id')
      .limit(1)
      .maybeSingle()
    
    const latency = Date.now() - startTime
    
    // If there's a network-related error
    if (error && isNetworkError(error)) {
      return {
        isHealthy: false,
        latency: null,
        error: 'Network connectivity issue',
        timestamp: new Date()
      }
    }
    
    // If there's a timeout (longer than expected)
    if (latency > timeout) {
      return {
        isHealthy: false,
        latency,
        error: 'Connection timeout',
        timestamp: new Date()
      }
    }
    
    return {
      isHealthy: true,
      latency,
      error: null,
      timestamp: new Date()
    }
    
  } catch (error) {
    return {
      isHealthy: false,
      latency: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }
  }
}

// Test basic connectivity to Supabase domain
export const testSupabaseConnectivity = async (): Promise<boolean> => {
  try {
    const url = new URL(resolvedUrl)
    return await testConnectivity(`${url.origin}/rest/v1/`)
  } catch {
    return false
  }
}

// Retry wrapper for Supabase operations
export const withRetry = <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  return retryNetworkOperation(
    operation,
    maxAttempts,
    1000, // Base delay of 1 second
    (error) => {
      // Retry only on network errors
      return isNetworkError(error)
    }
  )
}
