-- Uy, Kape! Database Schema and Seed Data
-- This migration contains the complete schema and initial data for the coffee ordering system

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
       , d.name, dc.name
ORDER BY o.created_at DESC;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert drink categories
INSERT INTO drink_categories (name, description, display_order, is_active) VALUES
('Coffee', 'Espresso-based and black coffee drinks', 1, true),
('Special Coffee', 'Premium coffee drinks with unique ingredients', 2, true),
('Tea', 'Hot and cold tea beverages', 3, true),
('Kids Drinks', 'Drinks from my child''s stash!', 5, true);

-- Insert option categories
INSERT INTO option_categories (name, description, is_required, display_order) VALUES
('Number of Shots', 'Espresso shot quantity', true, 1),
('Milk Type', 'Type of milk for coffee drinks (required for milk-based drinks)', true, 2),
('Tea Type', 'Variety of tea', true, 3),
('Temperature', 'Hot or cold serving', false, 4),
('Ice Cream Flavor', 'Ice cream flavor', false, 5);

-- Insert option values
-- Number of Shots options
INSERT INTO option_values (option_category_id, name, description, display_order, is_active) VALUES
((SELECT id FROM option_categories WHERE name = 'Number of Shots'), 'Single', 'One shot of espresso', 1, true),
((SELECT id FROM option_categories WHERE name = 'Number of Shots'), 'Double', 'Two shots of espresso', 2, true);

-- Milk Type options
INSERT INTO option_values (option_category_id, name, description, display_order, is_active) VALUES
((SELECT id FROM option_categories WHERE name = 'Milk Type'), 'None', 'No milk added', 1, true),
((SELECT id FROM option_categories WHERE name = 'Milk Type'), 'Full Cream Milk', 'Full fat dairy milk', 2, false),
((SELECT id FROM option_categories WHERE name = 'Milk Type'), 'Low Fat Milk', 'Reduced fat dairy milk', 3, true),
((SELECT id FROM option_categories WHERE name = 'Milk Type'), 'Oatmilk', 'Plant-based oat milk', 4, true);

-- Tea Type options
INSERT INTO option_values (option_category_id, name, description, display_order, is_active) VALUES
((SELECT id FROM option_categories WHERE name = 'Tea Type'), 'Jasmine Green Tea', 'Light and fragrant green tea', 1, true),
((SELECT id FROM option_categories WHERE name = 'Tea Type'), 'Oolong Tea', 'Traditional Chinese semi-fermented tea', 2, false),
((SELECT id FROM option_categories WHERE name = 'Tea Type'), 'Pu-erh Tea', 'Aged and fermented dark tea', 3, true),
((SELECT id FROM option_categories WHERE name = 'Tea Type'), 'Chamomile Tea', 'Caffeine-free herbal tea', 4, true),
((SELECT id FROM option_categories WHERE name = 'Tea Type'), 'Ginger Tea', 'Caffeine-free spicy tea', 5, true);

-- Temperature options
INSERT INTO option_values (option_category_id, name, description, display_order, is_active) VALUES
((SELECT id FROM option_categories WHERE name = 'Temperature'), 'Hot', 'Served hot', 1, true),
((SELECT id FROM option_categories WHERE name = 'Temperature'), 'Cold', 'Served cold or iced', 2, true);

-- Ice Cream options
INSERT INTO option_values (option_category_id, name, description, display_order, is_active) VALUES
((SELECT id FROM option_categories WHERE name = 'Ice Cream Flavor'), 'None', 'No ice cream added', 1, true),
((SELECT id FROM option_categories WHERE name = 'Ice Cream Flavor'), 'Vanilla', 'Classic vanilla ice cream', 2, false),
((SELECT id FROM option_categories WHERE name = 'Ice Cream Flavor'), 'Chocolate', 'Rich chocolate ice cream', 3, true);

-- Insert drinks
-- Coffee category drinks
INSERT INTO drinks (name, description, category_id, display_order, is_active) VALUES
('Espresso', 'Pure espresso shot', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 1, true),
('Espresso Macchiato', 'Espresso with a dollop of foamed milk', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 2, true),
('Piccolo Latte', 'Small latte with equal parts espresso and steamed milk', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 3, true),
('Caffe Latte', 'Espresso with steamed milk and light foam', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 4, true),
('Cappuccino', 'Equal parts espresso, steamed milk, and milk foam', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 5, true),
('Americano', 'Espresso with hot water', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 6, true),
('Black Coffee (Moka Pot)', 'Coffee brewed in a moka pot', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 7, true),
('Black Coffee (V60)', 'Pour-over coffee using V60 dripper', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 8, true),
('Black Coffee (Aeropress)', 'Black coffee using an Aeropress', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 9, true);

-- Special Coffee category drinks
INSERT INTO drinks (name, description, category_id, display_order, is_active) VALUES
('Ice-Blended Coffee', 'Blended iced coffee drink', (SELECT id FROM drink_categories WHERE name = 'Special Coffee'), 21, true),
('Affogato', 'Ice cream with an espresso shot', (SELECT id FROM drink_categories WHERE name = 'Special Coffee'), 22, true),
('Amaretto Coffee', 'Americano with amaretto dessert liquor', (SELECT id FROM drink_categories WHERE name = 'Special Coffee'), 23, true);

-- Tea category drinks
INSERT INTO drinks (name, description, category_id, display_order, is_active) VALUES
('Chinese Tea', 'Traditional Chinese tea varieties', (SELECT id FROM drink_categories WHERE name = 'Tea'), 31, true);

-- Kids Drinks category
INSERT INTO drinks (name, description, category_id, display_order, is_active) VALUES
('Babyccino', 'Frothed milk drink for children', (SELECT id FROM drink_categories WHERE name = 'Kids Drinks'), 51, true),
('Milo', 'Chocolate malt drink', (SELECT id FROM drink_categories WHERE name = 'Kids Drinks'), 52, true),
('Ribena', 'Blackcurrant juice drink', (SELECT id FROM drink_categories WHERE name = 'Kids Drinks'), 53, true), 
('Yakult', 'Probiotic dairy drink', (SELECT id FROM drink_categories WHERE name = 'Kids Drinks'), 54, true);

-- Link drinks to their available option categories
-- Espresso-based drinks that can have shot options and milk options
INSERT INTO drink_options (drink_id, option_category_id, default_option_value_id) VALUES
-- Espresso: shots only (no milk customization available)
((SELECT id FROM drinks WHERE name = 'Espresso'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),

-- Espresso Macchiato: shots + required milk (default Low Fat Milk)
((SELECT id FROM drinks WHERE name = 'Espresso Macchiato'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Espresso Macchiato'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),

-- Milk-based drinks: shots + required milk (excluding "None") + temperature
((SELECT id FROM drinks WHERE name = 'Piccolo Latte'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Piccolo Latte'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),
((SELECT id FROM drinks WHERE name = 'Piccolo Latte'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

((SELECT id FROM drinks WHERE name = 'Caffe Latte'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Caffe Latte'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),
((SELECT id FROM drinks WHERE name = 'Caffe Latte'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

((SELECT id FROM drinks WHERE name = 'Cappuccino'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Cappuccino'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),
((SELECT id FROM drinks WHERE name = 'Cappuccino'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

-- Americano: shots + temperature
((SELECT id FROM drinks WHERE name = 'Americano'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Americano'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

-- Black coffee drinks: temperature only
((SELECT id FROM drinks WHERE name = 'Black Coffee (Moka Pot)'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),
((SELECT id FROM drinks WHERE name = 'Black Coffee (V60)'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),
((SELECT id FROM drinks WHERE name = 'Black Coffee (Aeropress)'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

-- Ice-Blended Coffee: required milk + temperature (cold) + ice cream (none)
((SELECT id FROM drinks WHERE name = 'Ice-Blended Coffee'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),
((SELECT id FROM drinks WHERE name = 'Ice-Blended Coffee'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Cold' AND oc.name = 'Temperature')),
((SELECT id FROM drinks WHERE name = 'Ice-Blended Coffee'),
 (SELECT id FROM option_categories WHERE name = 'Ice Cream Flavor'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'None' AND oc.name = 'Ice Cream Flavor')),

-- Affogato: shots + required ice cream (chocolate)
((SELECT id FROM drinks WHERE name = 'Affogato'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Affogato'),
 (SELECT id FROM option_categories WHERE name = 'Ice Cream Flavor'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Chocolate' AND oc.name = 'Ice Cream Flavor')),

-- Amaretto Coffee: shots + temperature
((SELECT id FROM drinks WHERE name = 'Amaretto Coffee'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Amaretto Coffee'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

-- Chinese Tea: tea type + temperature
((SELECT id FROM drinks WHERE name = 'Chinese Tea'),
 (SELECT id FROM option_categories WHERE name = 'Tea Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Jasmine Green Tea' AND oc.name = 'Tea Type')),
((SELECT id FROM drinks WHERE name = 'Chinese Tea'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

-- Kids drinks with temperature options
((SELECT id FROM drinks WHERE name = 'Babyccino'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),
((SELECT id FROM drinks WHERE name = 'Babyccino'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),
((SELECT id FROM drinks WHERE name = 'Milo'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),
((SELECT id FROM drinks WHERE name = 'Ribena'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Cold' AND oc.name = 'Temperature')),
((SELECT id FROM drinks WHERE name = 'Yakult'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Cold' AND oc.name = 'Temperature'));
