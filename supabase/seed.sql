-- Seed data for Uy, Kape! coffee ordering system
-- This file contains initial data for the normalized database schema

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
INSERT INTO drinks (name, description, category_id, preparation_time_minutes, display_order, is_active) VALUES
('Espresso', 'Pure espresso shot', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 3, 1, true),
('Espresso Macchiato', 'Espresso with a dollop of foamed milk', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 3, 2, true),
('Americano', 'Espresso with hot water', (SELECT id FROM drink_categories WHERE name = 'Coffee'), NULL, 3, true),
('Caffe Latte', 'Espresso with steamed milk and light foam', (SELECT id FROM drink_categories WHERE name = 'Coffee'), NULL, 4, true),
('Cappuccino', 'Equal parts espresso, steamed milk, and milk foam', (SELECT id FROM drink_categories WHERE name = 'Coffee'), NULL, 5, true),
('Piccolo Latte', '1 shot of espresso with 2 parts of milk', (SELECT id FROM drink_categories WHERE name = 'Coffee'), NULL, 6, true),
('Cortado', '1 or 2 shots of espresso with an equal part of milk', (SELECT id FROM drink_categories WHERE name = 'Coffee'), NULL, 7, true),
('Melbourne Magic', '1 or 2 shots of espresso with 3 parts of milk', (SELECT id FROM drink_categories WHERE name = 'Coffee'), NULL, 8, true),
('Black Coffee (Moka Pot)', 'Coffee brewed in a moka pot', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 10, 9, true),
('Black Coffee (V60)', 'Pour-over coffee using V60 dripper', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 10, 10, true),
('Black Coffee (Aeropress)', 'Black coffee using an Aeropress', (SELECT id FROM drink_categories WHERE name = 'Coffee'), 10, 11, true);

-- Special Coffee category drinks
INSERT INTO drinks (name, description, category_id, preparation_time_minutes, display_order, is_active) VALUES
('Ice-Blended Coffee', 'Blended iced coffee drink', (SELECT id FROM drink_categories WHERE name = 'Special Coffee'), 15, 21, true),
('Affogato', 'Ice cream with an espresso shot', (SELECT id FROM drink_categories WHERE name = 'Special Coffee'), 7, 22, true),
('Amaretto Coffee', 'Americano with amaretto dessert liquor', (SELECT id FROM drink_categories WHERE name = 'Special Coffee'), NULL, 23, true);

-- Tea category drinks
INSERT INTO drinks (name, description, category_id, preparation_time_minutes, display_order, is_active) VALUES
('Chinese Tea', 'Traditional Chinese tea varieties', (SELECT id FROM drink_categories WHERE name = 'Tea'), NULL, 31, true);

-- Kids Drinks category
INSERT INTO drinks (name, description, category_id, preparation_time_minutes, display_order, is_active) VALUES
('Babyccino', 'Frothed milk drink for children', (SELECT id FROM drink_categories WHERE name = 'Kids Drinks'), NULL, 51, true),
('Milo', 'Chocolate malt drink', (SELECT id FROM drink_categories WHERE name = 'Kids Drinks'), 0, 52, true),
('Ribena', 'Blackcurrant juice drink', (SELECT id FROM drink_categories WHERE name = 'Kids Drinks'), 0, 53, true), 
('Yakult', 'Probiotic dairy drink', (SELECT id FROM drink_categories WHERE name = 'Kids Drinks'), 0, 54, true);

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

-- Americano: shots + temperature
((SELECT id FROM drinks WHERE name = 'Americano'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Americano'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

-- Caffe Latte: shots + required milk (excluding "None") + temperature
((SELECT id FROM drinks WHERE name = 'Caffe Latte'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Caffe Latte'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),
((SELECT id FROM drinks WHERE name = 'Caffe Latte'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

-- Cappuccino: shots + required milk (excluding "None") + temperature
((SELECT id FROM drinks WHERE name = 'Cappuccino'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Cappuccino'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),
((SELECT id FROM drinks WHERE name = 'Cappuccino'),
 (SELECT id FROM option_categories WHERE name = 'Temperature'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Hot' AND oc.name = 'Temperature')),

-- Piccolo Latte: required milk (excluding "None")
((SELECT id FROM drinks WHERE name = 'Piccolo Latte'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),

-- Cortado: shots + required milk (excluding "None")
((SELECT id FROM drinks WHERE name = 'Cortado'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Cortado'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),

-- Melbourne Magic: shots + required milk (excluding "None")
((SELECT id FROM drinks WHERE name = 'Melbourne Magic'),
 (SELECT id FROM option_categories WHERE name = 'Number of Shots'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Single' AND oc.name = 'Number of Shots')),
((SELECT id FROM drinks WHERE name = 'Melbourne Magic'),
 (SELECT id FROM option_categories WHERE name = 'Milk Type'),
 (SELECT ov.id FROM option_values ov JOIN option_categories oc ON ov.option_category_id = oc.id WHERE ov.name = 'Low Fat Milk' AND oc.name = 'Milk Type')),

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