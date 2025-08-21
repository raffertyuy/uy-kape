-- Add special_request field to orders table
-- Migration: 20250821162436_add_special_request_to_orders.sql

-- Add the special_request column to the orders table
ALTER TABLE orders ADD COLUMN special_request TEXT;

-- Drop and recreate the orders_with_details view to include special_request
DROP VIEW IF EXISTS orders_with_details;

-- Create the orders_with_details view to include special_request
CREATE VIEW orders_with_details AS
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