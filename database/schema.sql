-- Uy, Kape! Database Schema
-- This file contains the SQL schema for the coffee ordering system

-- Create custom types
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');

-- Create drinks table
CREATE TABLE drinks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  drink VARCHAR(255) NOT NULL,
  options JSONB DEFAULT '{}',
  status order_status DEFAULT 'pending',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_timestamp ON orders(timestamp);
CREATE INDEX idx_drinks_name ON drinks(name);

-- Enable Row Level Security (RLS)
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for drinks table (read-only for all users)
CREATE POLICY "Enable read access for all users" ON drinks
    FOR SELECT USING (true);

-- Create policies for orders table (all users can insert and read)
CREATE POLICY "Enable insert for all users" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON orders
    FOR SELECT USING (true);

-- Create policies for order updates (all users can update)
CREATE POLICY "Enable update for all users" ON orders
    FOR UPDATE USING (true);

-- Note: In a production environment, you would want more restrictive policies
-- For example, only authenticated admin users should be able to update order status
-- and manage the drinks menu. This simplified approach is for development purposes.