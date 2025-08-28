/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GUEST_PASSWORD: string;
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_GUEST_BYPASS_PASSWORD?: string;
  readonly VITE_WAIT_TIME_PER_ORDER?: string;
  readonly VITE_ERROR_HANDLING_PANEL?: string;
  readonly VITE_VERCEL_TELEMETRY_ENABLED?: string;
  readonly VITE_SUPABASE_TELEMETRY_ENABLED?: string;
  readonly VITE_SLOW_QUERY_THRESHOLD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
