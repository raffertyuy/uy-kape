-- Uy, Kape! Database Schema with Preparation Time Feature
-- This migration contains the complete schema and initial data for the coffee ordering system
-- including the new preparation_time_minutes column for drinks

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');
-- Order status enum: pending (awaiting preparation), completed (finished and picked up), cancelled (cancelled by guest or barista)

-- Create drink_categories table
CREATE TABLE drink_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create drinks table
CREATE TABLE drinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES drink_categories(id) ON DELETE RESTRICT,
  preparation_time_minutes INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Create option_categories table
CREATE TABLE option_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create option_values table
CREATE TABLE option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_category_id UUID NOT NULL REFERENCES option_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(option_category_id, name)
);

-- Create drink_options table (links drinks to available option categories)
CREATE TABLE drink_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drink_id UUID NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  option_category_id UUID NOT NULL REFERENCES option_categories(id) ON DELETE CASCADE,
  default_option_value_id UUID REFERENCES option_values(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(drink_id, option_category_id)
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  drink_id UUID NOT NULL REFERENCES drinks(id) ON DELETE RESTRICT,
  special_request TEXT,
  status order_status DEFAULT 'pending',
  queue_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_options table (stores selected options for each order)
CREATE TABLE order_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  option_category_id UUID NOT NULL REFERENCES option_categories(id) ON DELETE RESTRICT,
  option_value_id UUID NOT NULL REFERENCES option_values(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id, option_category_id)
);

-- Create indexes for better performance
CREATE INDEX idx_drinks_category ON drinks(category_id);
CREATE INDEX idx_drinks_active ON drinks(is_active) WHERE is_active = true;
CREATE INDEX idx_drinks_display_order ON drinks(category_id, display_order);

CREATE INDEX idx_option_values_category ON option_values(option_category_id);
CREATE INDEX idx_option_values_active ON option_values(is_active) WHERE is_active = true;

CREATE INDEX idx_drink_options_drink ON drink_options(drink_id);
CREATE INDEX idx_drink_options_category ON drink_options(option_category_id);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_queue ON orders(queue_number) WHERE status = 'pending';
CREATE INDEX idx_orders_drink ON orders(drink_id);

CREATE INDEX idx_order_options_order ON order_options(order_id);
CREATE INDEX idx_order_options_category ON order_options(option_category_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER update_drink_categories_updated_at
  BEFORE UPDATE ON drink_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drinks_updated_at
  BEFORE UPDATE ON drinks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_option_categories_updated_at
  BEFORE UPDATE ON option_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_option_values_updated_at
  BEFORE UPDATE ON option_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate queue number
CREATE OR REPLACE FUNCTION calculate_queue_number(order_created_at TIMESTAMPTZ)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) + 1
    FROM orders
    WHERE status = 'pending'
      AND created_at < order_created_at
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public;

-- Enable Row Level Security (RLS)
ALTER TABLE drink_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_options ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (all users can read menu data)
CREATE POLICY "Enable read access for all users" ON drink_categories
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON drinks
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON option_categories
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON option_values
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON drink_options
  FOR SELECT USING (true);

-- Create policies for orders table (guests can insert and read, admins can update)
CREATE POLICY "Enable insert for all users" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON orders
  FOR UPDATE USING (true);

-- Create policies for order_options table
CREATE POLICY "Enable insert for all users" ON order_options
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON order_options
  FOR SELECT USING (true);

-- Create policies for menu management (insert, update, delete)
-- Drink categories management policies
CREATE POLICY "Enable insert for all users" ON drink_categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON drink_categories
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON drink_categories
  FOR DELETE USING (true);

-- Drinks management policies
CREATE POLICY "Enable insert for all users" ON drinks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON drinks
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON drinks
  FOR DELETE USING (true);

-- Option categories management policies
CREATE POLICY "Enable insert for all users" ON option_categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON option_categories
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON option_categories
  FOR DELETE USING (true);

-- Option values management policies
CREATE POLICY "Enable insert for all users" ON option_values
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON option_values
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON option_values
  FOR DELETE USING (true);

-- Drink options management policies
CREATE POLICY "Enable insert for all users" ON drink_options
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON drink_options
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON drink_options
  FOR DELETE USING (true);

-- Note: In a production environment, you would want more restrictive policies
-- For example, only authenticated admin users should be able to update order status
-- and manage the drinks menu. This simplified approach is for development purposes.

-- Views for easier querying

-- View to get drinks with their category information
CREATE VIEW drinks_with_categories 
WITH (security_invoker=true) AS
SELECT d.id
     , d.name
     , d.description
     , d.preparation_time_minutes
     , d.display_order
     , d.is_active
     , dc.name AS category_name
     , dc.description AS category_description
     , dc.display_order AS category_display_order
FROM drinks d
JOIN drink_categories dc ON d.category_id = dc.id
WHERE d.is_active = true
  AND dc.is_active = true
ORDER BY dc.display_order, d.display_order;

-- View to get complete order information
CREATE VIEW orders_with_details 
WITH (security_invoker=true) AS
SELECT o.id
     , o.guest_name
     , o.special_request
     , o.status
     , o.queue_number
     , o.created_at
     , o.updated_at
     , d.name AS drink_name
     , d.preparation_time_minutes
     , dc.name AS category_name
     , STRING_AGG(
         CONCAT(oc.name, ': ', ov.name),
         ', '
         ORDER BY oc.display_order
       ) AS selected_options
FROM orders o
JOIN drinks d ON o.drink_id = d.id
JOIN drink_categories dc ON d.category_id = dc.id
LEFT JOIN order_options oo ON o.id = oo.order_id
LEFT JOIN option_categories oc ON oo.option_category_id = oc.id
LEFT JOIN option_values ov ON oo.option_value_id = ov.id
GROUP BY o.id, o.guest_name, o.special_request, o.status, o.queue_number, o.created_at, o.updated_at
       , d.name, d.preparation_time_minutes, dc.name
ORDER BY o.created_at DESC;

-- Note: Seed data is handled by the separate seed.sql file to avoid duplication
-- during migration and seeding processes.