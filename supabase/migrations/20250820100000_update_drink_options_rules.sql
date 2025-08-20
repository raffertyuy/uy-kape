-- Migration: Update drink option associations to match new business rules
-- Timestamp: 2025-08-20 10:00:00
-- Description:
--   * Make Milk Type required
--   * Remove Milk Type from drinks that should not customize milk (Espresso & black coffees)
--   * Add Temperature options to applicable drinks (milk-based, black coffee, Chinese Tea, Ice-Blended Coffee)
--   * Ensure Espresso Macchiato has required Milk Type (not None)
--   * Ensure milk-based drinks have Temperature and valid (non-None) milk default
--   * Add Temperature (Cold) default for Ice-Blended Coffee
--   * Add Temperature (Hot) for Chinese Tea

BEGIN;

-- 1. Ensure Milk Type option category is marked required and description updated
UPDATE option_categories
SET is_required = TRUE,
    description = 'Type of milk for coffee drinks (required for milk-based drinks)'
WHERE name = 'Milk Type';

-- 2. Remove Milk Type from drinks that should not have milk customization
DELETE FROM drink_options dopt
USING drinks d, option_categories oc
WHERE dopt.drink_id = d.id
  AND dopt.option_category_id = oc.id
  AND oc.name = 'Milk Type'
  AND d.name IN (
    'Espresso',
    'Americano',
    'Black Coffee (Moka Pot)',
    'Black Coffee (V60)'
  );

-- 3. Insert Temperature options where missing
-- Helper CTE not possible in simple INSERT ... SELECT with NOT EXISTS per drink grouping, so individual INSERTs are used for clarity.

-- Lists of drinks needing Hot default temperature
INSERT INTO drink_options (drink_id, option_category_id, default_option_value_id)
SELECT d.id, oc.id, ov.id
FROM drinks d
JOIN option_categories oc ON oc.name = 'Temperature'
JOIN option_values ov ON ov.option_category_id = oc.id AND ov.name = 'Hot'
WHERE d.name IN (
  'Piccolo Latte', 'Caffe Latte', 'Cappuccino',
  'Americano', 'Black Coffee (Moka Pot)', 'Black Coffee (V60)',
  'Chinese Tea'
)
AND NOT EXISTS (
  SELECT 1 FROM drink_options do2
  WHERE do2.drink_id = d.id
    AND do2.option_category_id = oc.id
);

-- Ice-Blended Coffee needs Cold default temperature
INSERT INTO drink_options (drink_id, option_category_id, default_option_value_id)
SELECT d.id, oc.id, ov.id
FROM drinks d
JOIN option_categories oc ON oc.name = 'Temperature'
JOIN option_values ov ON ov.option_category_id = oc.id AND ov.name = 'Cold'
WHERE d.name = 'Ice-Blended Coffee'
AND NOT EXISTS (
  SELECT 1 FROM drink_options do2
  WHERE do2.drink_id = d.id
    AND do2.option_category_id = oc.id
);

-- 4. Ensure Espresso Macchiato has Milk Type (Full Cream) if missing
INSERT INTO drink_options (drink_id, option_category_id, default_option_value_id)
SELECT d.id, oc.id, ov.id
FROM drinks d
JOIN option_categories oc ON oc.name = 'Milk Type'
JOIN option_values ov ON ov.option_category_id = oc.id AND ov.name = 'Meiji Full Cream Milk'
WHERE d.name = 'Espresso Macchiato'
AND NOT EXISTS (
  SELECT 1 FROM drink_options do2
  WHERE do2.drink_id = d.id
    AND do2.option_category_id = oc.id
);

-- 5. Replace any Milk Type default of None for drinks that require milk
WITH targets AS (
  SELECT dopt.id AS drink_option_id, fullcream.id AS fullcream_id
  FROM drink_options dopt
  JOIN drinks d ON dopt.drink_id = d.id
  JOIN option_categories oc ON dopt.option_category_id = oc.id AND oc.name = 'Milk Type'
  JOIN option_values ov_current ON dopt.default_option_value_id = ov_current.id
  JOIN option_values fullcream ON fullcream.option_category_id = oc.id AND fullcream.name = 'Meiji Full Cream Milk'
  WHERE d.name IN ('Espresso Macchiato','Piccolo Latte','Caffe Latte','Cappuccino','Ice-Blended Coffee')
    AND ov_current.name = 'None'
)
UPDATE drink_options dopt
SET default_option_value_id = targets.fullcream_id
FROM targets
WHERE dopt.id = targets.drink_option_id;

-- 6. (Safety) Remove any lingering Temperature duplicates (should not happen, but ensure uniqueness by (drink_id, option_category_id))
-- If duplicates existed (from manual edits), keep the earliest inserted (arbitrary) and remove others.
WITH ranked AS (
  SELECT dopt.id AS drink_option_id,
         ROW_NUMBER() OVER (
           PARTITION BY dopt.drink_id, dopt.option_category_id
           ORDER BY dopt.created_at NULLS LAST, dopt.id
         ) AS rn
  FROM drink_options dopt
  JOIN option_categories oc ON dopt.option_category_id = oc.id
  WHERE oc.name = 'Temperature'
)
DELETE FROM drink_options dopt
USING ranked r
WHERE dopt.id = r.drink_option_id
  AND r.rn > 1;

COMMIT;
