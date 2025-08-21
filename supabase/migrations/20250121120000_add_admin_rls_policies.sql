-- Migration: Add Admin RLS Policies for Menu Management
-- Timestamp: 2025-01-21 12:00:00
-- Description: Enable admin CRUD operations for menu management system
--   * Allow INSERT, UPDATE, DELETE on drink_categories, drinks, option_categories, option_values, drink_options
--   * Maintain read access for all users
--   * Prepare for future authentication-based admin policies

BEGIN;

-- =====================================================
-- DRINK CATEGORIES: Add admin CRUD policies
-- =====================================================

-- Allow all users to insert drink categories (temporary until auth is implemented)
CREATE POLICY "Enable insert for all users" ON drink_categories
  FOR INSERT WITH CHECK (true);

-- Allow all users to update drink categories (temporary until auth is implemented)
CREATE POLICY "Enable update for all users" ON drink_categories
  FOR UPDATE USING (true);

-- Allow all users to delete drink categories (temporary until auth is implemented)
CREATE POLICY "Enable delete for all users" ON drink_categories
  FOR DELETE USING (true);

-- =====================================================
-- DRINKS: Add admin CRUD policies
-- =====================================================

-- Allow all users to insert drinks (temporary until auth is implemented)
CREATE POLICY "Enable insert for all users" ON drinks
  FOR INSERT WITH CHECK (true);

-- Allow all users to update drinks (temporary until auth is implemented)
CREATE POLICY "Enable update for all users" ON drinks
  FOR UPDATE USING (true);

-- Allow all users to delete drinks (temporary until auth is implemented)
CREATE POLICY "Enable delete for all users" ON drinks
  FOR DELETE USING (true);

-- =====================================================
-- OPTION CATEGORIES: Add admin CRUD policies
-- =====================================================

-- Allow all users to insert option categories (temporary until auth is implemented)
CREATE POLICY "Enable insert for all users" ON option_categories
  FOR INSERT WITH CHECK (true);

-- Allow all users to update option categories (temporary until auth is implemented)
CREATE POLICY "Enable update for all users" ON option_categories
  FOR UPDATE USING (true);

-- Allow all users to delete option categories (temporary until auth is implemented)
CREATE POLICY "Enable delete for all users" ON option_categories
  FOR DELETE USING (true);

-- =====================================================
-- OPTION VALUES: Add admin CRUD policies
-- =====================================================

-- Allow all users to insert option values (temporary until auth is implemented)
CREATE POLICY "Enable insert for all users" ON option_values
  FOR INSERT WITH CHECK (true);

-- Allow all users to update option values (temporary until auth is implemented)
CREATE POLICY "Enable update for all users" ON option_values
  FOR UPDATE USING (true);

-- Allow all users to delete option values (temporary until auth is implemented)
CREATE POLICY "Enable delete for all users" ON option_values
  FOR DELETE USING (true);

-- =====================================================
-- DRINK OPTIONS: Add admin CRUD policies
-- =====================================================

-- Allow all users to insert drink options (temporary until auth is implemented)
CREATE POLICY "Enable insert for all users" ON drink_options
  FOR INSERT WITH CHECK (true);

-- Allow all users to update drink options (temporary until auth is implemented)
CREATE POLICY "Enable update for all users" ON drink_options
  FOR UPDATE USING (true);

-- Allow all users to delete drink options (temporary until auth is implemented)
CREATE POLICY "Enable delete for all users" ON drink_options
  FOR DELETE USING (true);

-- =====================================================
-- COMMENTS FOR FUTURE IMPROVEMENTS
-- =====================================================

-- TODO: Replace temporary permissive policies with authentication-based policies
-- Example for future implementation:
-- 
-- CREATE POLICY "Enable admin insert on drink_categories" ON drink_categories
--   FOR INSERT WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.uid() = users.id 
--       AND users.role = 'admin'
--     )
--   );
--
-- This would require:
-- 1. Supabase Auth setup with user management
-- 2. User roles table or metadata
-- 3. Admin authentication flow in the frontend
-- 4. Session management for admin users

COMMIT;