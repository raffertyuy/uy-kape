-- Migration: Add app_settings table for global application configuration
-- This table stores key/value pairs for app-wide feature flags and settings.
-- The hacked_mode key controls the Easter egg theme for all users.

CREATE TABLE app_settings (
  key        TEXT        PRIMARY KEY
, value      TEXT        NOT NULL
, updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default values
INSERT INTO app_settings (key, value) VALUES ('hacked_mode', 'false')
  ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: anyone (anon + authenticated) can read settings
CREATE POLICY "app_settings_select" ON app_settings
  FOR SELECT USING (true);

-- Policy: any role (anon + authenticated) can update settings
-- The admin area is protected by a client-side password; no Supabase auth is used.
CREATE POLICY "app_settings_update" ON app_settings
  FOR UPDATE USING (true) WITH CHECK (true);

-- Trigger to keep updated_at current on writes
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
