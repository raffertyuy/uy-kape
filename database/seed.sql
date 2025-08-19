-- Seed data for drinks table
-- This file contains initial drink menu items

INSERT INTO drinks (name, options) VALUES 
('Americano', '{
  "size": {
    "label": "Size",
    "type": "select",
    "options": ["Small", "Medium", "Large"],
    "required": true
  },
  "hot": {
    "label": "Hot",
    "type": "checkbox",
    "required": false
  },
  "sugar": {
    "label": "Sugar",
    "type": "select",
    "options": ["None", "1 tsp", "2 tsp", "3 tsp"],
    "required": false
  }
}'),

('Cappuccino', '{
  "size": {
    "label": "Size",
    "type": "select",
    "options": ["Small", "Medium", "Large"],
    "required": true
  },
  "milk": {
    "label": "Milk",
    "type": "select",
    "options": ["Regular", "Oat", "Almond", "Soy"],
    "required": true
  },
  "sugar": {
    "label": "Sugar",
    "type": "select",
    "options": ["None", "1 tsp", "2 tsp", "3 tsp"],
    "required": false
  },
  "extra_foam": {
    "label": "Extra Foam",
    "type": "checkbox",
    "required": false
  }
}'),

('Latte', '{
  "size": {
    "label": "Size",
    "type": "select",
    "options": ["Small", "Medium", "Large"],
    "required": true
  },
  "milk": {
    "label": "Milk",
    "type": "select",
    "options": ["Regular", "Oat", "Almond", "Soy"],
    "required": true
  },
  "flavor": {
    "label": "Flavor",
    "type": "select",
    "options": ["None", "Vanilla", "Caramel", "Hazelnut"],
    "required": false
  },
  "sugar": {
    "label": "Sugar",
    "type": "select",
    "options": ["None", "1 tsp", "2 tsp", "3 tsp"],
    "required": false
  },
  "decaf": {
    "label": "Decaf",
    "type": "checkbox",
    "required": false
  }
}'),

('Espresso', '{
  "shots": {
    "label": "Number of Shots",
    "type": "select",
    "options": ["Single", "Double", "Triple"],
    "required": true
  },
  "sugar": {
    "label": "Sugar",
    "type": "select",
    "options": ["None", "1 tsp", "2 tsp"],
    "required": false
  }
}'),

('Macchiato', '{
  "size": {
    "label": "Size",
    "type": "select",
    "options": ["Small", "Medium", "Large"],
    "required": true
  },
  "milk": {
    "label": "Milk",
    "type": "select",
    "options": ["Regular", "Oat", "Almond", "Soy"],
    "required": true
  },
  "flavor": {
    "label": "Flavor",
    "type": "select",
    "options": ["Caramel", "Vanilla", "Hazelnut"],
    "required": true
  },
  "hot": {
    "label": "Hot",
    "type": "checkbox",
    "required": false
  }
}'),

('Mocha', '{
  "size": {
    "label": "Size",
    "type": "select",
    "options": ["Small", "Medium", "Large"],
    "required": true
  },
  "milk": {
    "label": "Milk",
    "type": "select",
    "options": ["Regular", "Oat", "Almond", "Soy"],
    "required": true
  },
  "chocolate": {
    "label": "Chocolate",
    "type": "select",
    "options": ["Dark", "Milk", "White"],
    "required": true
  },
  "whipped_cream": {
    "label": "Whipped Cream",
    "type": "checkbox",
    "required": false
  },
  "sugar": {
    "label": "Sugar",
    "type": "select",
    "options": ["None", "1 tsp", "2 tsp"],
    "required": false
  }
}'),

('Cold Brew', '{
  "size": {
    "label": "Size",
    "type": "select",
    "options": ["Small", "Medium", "Large"],
    "required": true
  },
  "milk": {
    "label": "Milk",
    "type": "select",
    "options": ["None", "Regular", "Oat", "Almond", "Soy"],
    "required": false
  },
  "flavor": {
    "label": "Flavor",
    "type": "select",
    "options": ["None", "Vanilla", "Caramel"],
    "required": false
  },
  "ice": {
    "label": "Extra Ice",
    "type": "checkbox",
    "required": false
  }
}'),

('Frappuccino', '{
  "size": {
    "label": "Size",
    "type": "select",
    "options": ["Medium", "Large"],
    "required": true
  },
  "base": {
    "label": "Base",
    "type": "select",
    "options": ["Coffee", "Chocolate", "Vanilla", "Caramel"],
    "required": true
  },
  "milk": {
    "label": "Milk",
    "type": "select",
    "options": ["Regular", "Oat", "Almond", "Soy"],
    "required": true
  },
  "whipped_cream": {
    "label": "Whipped Cream",
    "type": "checkbox",
    "required": false
  },
  "extra_shot": {
    "label": "Extra Shot",
    "type": "checkbox",
    "required": false
  }
}');

-- Sample test orders (optional, for development)
-- Uncomment these if you want some sample data for testing
/*
INSERT INTO orders (name, drink, options, status) VALUES 
('John Doe', 'Americano', '{"size": "Medium", "hot": true, "sugar": "1 tsp"}', 'pending'),
('Jane Smith', 'Latte', '{"size": "Large", "milk": "Oat", "flavor": "Vanilla", "sugar": "None"}', 'preparing'),
('Bob Johnson', 'Cappuccino', '{"size": "Small", "milk": "Regular", "extra_foam": true}', 'ready');
*/