import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

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
