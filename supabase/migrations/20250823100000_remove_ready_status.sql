-- Migration to remove 'ready' status from order_status enum
-- This migration safely updates existing data and removes the 'ready' status

-- Step 1: Update any existing 'ready' orders to 'pending'
-- This ensures no data is lost during the enum change
UPDATE orders 
SET status = 'pending' 
WHERE status = 'ready';

-- Step 2: Create a new order_status enum without 'ready'
-- We need to use this approach because PostgreSQL doesn't allow 
-- direct removal of enum values that might be in use
ALTER TYPE order_status RENAME TO order_status_old;

-- Step 3: Create the new enum with only the required statuses
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');

-- Step 4: Update the orders table to use the new enum
-- The cast ensures proper type conversion
ALTER TABLE orders 
ALTER COLUMN status TYPE order_status 
USING status::text::order_status;

-- Step 5: Clean up the old enum type
DROP TYPE order_status_old;

-- Add comment to document the simplified workflow
COMMENT ON TYPE order_status IS 'Order status enum: pending (awaiting preparation), completed (finished and picked up), cancelled (cancelled by guest or barista)';