/**
 * Database Activity Script
 * 
 * This script pings the Supabase database to keep it active and prevent
 * automatic disabling on the free plan (which occurs after 7 days of inactivity).
 * 
 * Required environment variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_ANON_KEY: Supabase anonymous key (read-only operations)
 * 
 * Usage:
 * - Locally: Set environment variables and run `npm run ping-database`
 * - GitHub Actions: Runs automatically via scheduled workflow
 */

/* eslint-env node */
/* eslint-disable no-console */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from scripts/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

async function pingDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables');
    console.error('   Required: SUPABASE_URL and SUPABASE_ANON_KEY');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔄 Pinging database...');
  console.log(`   URL: ${supabaseUrl}`);
  
  let hasError = false;
  
  // Query drinks table
  try {
    const { error: drinksError } = await supabase
      .from('drinks')
      .select('id')
      .limit(1);
    
    if (drinksError) {
      console.error('❌ Error querying drinks table:', drinksError.message);
      hasError = true;
    } else {
      console.log('✓ Successfully queried drinks table');
    }
  } catch (error) {
    console.error('❌ Exception querying drinks table:', error.message);
    hasError = true;
  }
  
  // Query orders table
  try {
    const { error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (ordersError) {
      console.error('❌ Error querying orders table:', ordersError.message);
      hasError = true;
    } else {
      console.log('✓ Successfully queried orders table');
    }
  } catch (error) {
    console.error('❌ Exception querying orders table:', error.message);
    hasError = true;
  }
  
  if (hasError) {
    console.log('\n❌ Database ping completed with errors');
    process.exit(1);
  } else {
    console.log('\n✅ Database ping completed successfully');
  }
}

pingDatabase().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
