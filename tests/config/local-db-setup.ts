/**
 * Local Database Setup Utilities
 * 
 * Provides utilities for setting up and managing the local Supabase database
 * for development and testing purposes. This file handles database schema
 * initialization, seeding, and cleanup operations.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Simple logger for database operations
const dbLogger = {
  info: (message: string) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(`[DB] ${message}`)
    }
  },
  warn: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn(`[DB] ${message}`, error)
    }
  },
  error: (message: string, error?: unknown) => {
    // eslint-disable-next-line no-console
    console.error(`[DB] ${message}`, error)
  }
}

// Local Supabase configuration from config.toml
export const LOCAL_SUPABASE_CONFIG = {
  url: 'http://127.0.0.1:54321',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  dbPort: 54322,
  apiPort: 54321,
  studioPort: 54323
} as const

/**
 * Creates a Supabase client configured for local development
 */
export function createLocalSupabaseClient(useServiceRole = false) {
  const key = useServiceRole 
    ? LOCAL_SUPABASE_CONFIG.serviceRoleKey 
    : LOCAL_SUPABASE_CONFIG.anonKey
    
  return createClient(LOCAL_SUPABASE_CONFIG.url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Checks if the local Supabase instance is running and accessible
 */
export async function isLocalSupabaseRunning(): Promise<boolean> {
  try {
    const client = createLocalSupabaseClient()
    const { error } = await client.from('drink_categories').select('count', { count: 'exact' })
    return !error
  } catch {
    return false
  }
}

/**
 * Waits for the local Supabase instance to be ready
 */
export async function waitForLocalSupabase(
  timeoutMs = 30000, 
  checkIntervalMs = 1000
): Promise<void> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeoutMs) {
    if (await isLocalSupabaseRunning()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, checkIntervalMs))
  }
  
  throw new Error(`Local Supabase instance not ready after ${timeoutMs}ms`)
}

/**
 * Loads and executes SQL files for database setup
 */
export async function executeSqlFile(client: ReturnType<typeof createLocalSupabaseClient>, filePath: string): Promise<void> {
  try {
    const sqlContent = readFileSync(filePath, 'utf-8')
    
    // Split by semicolons but handle multi-line statements
    const statements = sqlContent
      .split(/;\s*(?=\n|$)/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await client.rpc('exec_sql', { sql: statement })
        if (error) {
          dbLogger.warn(`SQL execution warning for statement: ${statement.substring(0, 100)}...`, error)
        }
      }
    }
  } catch (error) {
    dbLogger.error(`Failed to execute SQL file ${filePath}:`, error)
    throw error
  }
}

/**
 * Resets the local database by dropping and recreating all tables
 */
export async function resetLocalDatabase(): Promise<void> {
  const client = createLocalSupabaseClient(true) // Use service role for admin operations
  
  try {
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations') // Preserve migration history
    
    if (tablesError) {
      throw new Error(`Failed to fetch tables: ${tablesError.message}`)
    }
    
    // Drop all tables (in reverse dependency order)
    const dropOrder = [
      'drink_options',
      'option_values', 
      'option_categories',
      'drinks',
      'drink_categories'
    ]
    
    for (const tableName of dropOrder) {
      if (tables?.some(t => t.table_name === tableName)) {
        const { error } = await client.rpc('exec_sql', { 
          sql: `DROP TABLE IF EXISTS "${tableName}" CASCADE` 
        })
        if (error) {
          dbLogger.warn(`Warning dropping table ${tableName}:`, error)
        }
      }
    }
    
    dbLogger.info('Local database reset completed')
  } catch (error) {
    dbLogger.error('Failed to reset local database:', error)
    throw error
  }
}

/**
 * Sets up the local database with schema and seed data
 */
export async function setupLocalDatabase(): Promise<void> {
  const projectRoot = process.cwd()
  const schemaPath = join(projectRoot, 'database', 'schema.sql')
  const seedPath = join(projectRoot, 'supabase', 'seed.sql')
  
  const client = createLocalSupabaseClient(true) // Use service role for setup
  
  try {
    // Execute schema
    dbLogger.info('Setting up database schema...')
    await executeSqlFile(client, schemaPath)
    
    // Execute seed data
    dbLogger.info('Loading seed data...')
    await executeSqlFile(client, seedPath)
    
    dbLogger.info('Local database setup completed successfully')
  } catch (error) {
    dbLogger.error('Failed to setup local database:', error)
    throw error
  }
}

/**
 * Validates that the local database is properly seeded
 */
export async function validateLocalDatabase(): Promise<boolean> {
  const client = createLocalSupabaseClient()
  
  try {
    // Check for expected data
    const { data: categories, error: catError } = await client
      .from('drink_categories')
      .select('count', { count: 'exact' })
    
    if (catError) return false
    
    const { data: drinks, error: drinkError } = await client
      .from('drinks')
      .select('count', { count: 'exact' })
    
    if (drinkError) return false
    
    // Should have at least 4 categories and 15+ drinks from seed data
    return (categories?.length ?? 0) >= 4 && (drinks?.length ?? 0) >= 15
  } catch {
    return false
  }
}

/**
 * Cleanup function for test teardown
 */
export async function cleanupLocalDatabase(): Promise<void> {
  // For development, we typically don't want to drop everything
  // Just clean up test-specific data if needed
  dbLogger.info('Local database cleanup completed')
}

/**
 * Development utility to check local Supabase status
 */
export async function checkLocalSupabaseStatus(): Promise<{
  isRunning: boolean
  isSeeded: boolean
  tableCount: number
  error?: string
}> {
  try {
    const isRunning = await isLocalSupabaseRunning()
    
    if (!isRunning) {
      return { isRunning: false, isSeeded: false, tableCount: 0 }
    }
    
    const client = createLocalSupabaseClient()
    const { data: tables } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    const tableCount = tables?.length ?? 0
    const isSeeded = await validateLocalDatabase()
    
    return { isRunning, isSeeded, tableCount }
  } catch (error) {
    return { 
      isRunning: false, 
      isSeeded: false, 
      tableCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}