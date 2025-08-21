import type {
  DrinkCategory,
  Drink,
  OptionCategory,
  OptionValue,
  DrinkOption,
  CreateDrinkCategoryDto,
  UpdateDrinkCategoryDto,
  CreateDrinkDto,
  UpdateDrinkDto,
  CreateOptionCategoryDto,
  UpdateOptionCategoryDto,
  CreateOptionValueDto,
  UpdateOptionValueDto,
  CreateDrinkOptionDto,
  UpdateDrinkOptionDto,
  DrinkWithOptionsAndCategory,
  OptionCategoryWithValues
} from '@/types/menu.types'

// Mock data based on the seed.sql file
let mockDrinkCategories: DrinkCategory[] = [
  {
    id: '1',
    name: 'Coffee',
    description: 'Espresso-based and black coffee drinks',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Special Coffee',
    description: 'Premium coffee drinks with unique ingredients',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Tea',
    description: 'Hot and cold tea beverages',
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Kids Drinks',
    description: 'Child-friendly beverages',
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let mockOptionCategories: OptionCategory[] = [
  {
    id: 'opt1',
    name: 'Number of Shots',
    description: 'Espresso shot quantity',
    is_required: false,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'opt2',
    name: 'Milk Type',
    description: 'Type of milk for coffee drinks (required for milk-based drinks)',
    is_required: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'opt3',
    name: 'Tea Type',
    description: 'Variety of tea',
    is_required: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'opt4',
    name: 'Temperature',
    description: 'Hot or cold serving',
    is_required: false,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let mockOptionValues: OptionValue[] = [
  // Number of Shots options
  {
    id: 'val1',
    option_category_id: 'opt1',
    name: 'Single',
    description: 'One shot of espresso',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'val2',
    option_category_id: 'opt1',
    name: 'Double',
    description: 'Two shots of espresso',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Milk Type options
  {
    id: 'val3',
    option_category_id: 'opt2',
    name: 'None',
    description: 'No milk added',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'val4',
    option_category_id: 'opt2',
    name: 'Meiji Full Cream Milk',
    description: 'Full fat dairy milk',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'val5',
    option_category_id: 'opt2',
    name: 'Meiji Low Fat Milk',
    description: 'Reduced fat dairy milk',
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'val6',
    option_category_id: 'opt2',
    name: 'Oatside Barista Oatmilk',
    description: 'Plant-based oat milk',
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Tea Type options
  {
    id: 'val7',
    option_category_id: 'opt3',
    name: 'Jasmine Green Tea',
    description: 'Light and fragrant green tea',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'val8',
    option_category_id: 'opt3',
    name: 'Oolong Tea',
    description: 'Traditional Chinese semi-fermented tea',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Temperature options
  {
    id: 'val9',
    option_category_id: 'opt4',
    name: 'Hot',
    description: 'Served hot',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'val10',
    option_category_id: 'opt4',
    name: 'Cold',
    description: 'Served cold or iced',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let mockDrinks: Drink[] = [
  {
    id: 'drink1',
    name: 'Espresso',
    description: 'Pure espresso shot',
    category_id: '1',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'drink2',
    name: 'Espresso Macchiato',
    description: 'Espresso with a dollop of foamed milk',
    category_id: '1',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'drink3',
    name: 'Piccolo Latte',
    description: 'Small latte with equal parts espresso and steamed milk',
    category_id: '1',
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'drink4',
    name: 'Caffe Latte',
    description: 'Espresso with steamed milk and light foam',
    category_id: '1',
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'drink5',
    name: 'Cappuccino',
    description: 'Equal parts espresso, steamed milk, and milk foam',
    category_id: '1',
    display_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'drink6',
    name: 'Jasmine Green Tea',
    description: 'Light and fragrant green tea',
    category_id: '3',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let mockDrinkOptions: DrinkOption[] = [
  // Espresso options
  {
    id: 'do1',
    drink_id: 'drink1',
    option_category_id: 'opt1',
    default_option_value_id: 'val1',
    created_at: new Date().toISOString()
  },
  // Latte options
  {
    id: 'do2',
    drink_id: 'drink4',
    option_category_id: 'opt1',
    default_option_value_id: 'val1',
    created_at: new Date().toISOString()
  },
  {
    id: 'do3',
    drink_id: 'drink4',
    option_category_id: 'opt2',
    default_option_value_id: 'val4',
    created_at: new Date().toISOString()
  },
  {
    id: 'do4',
    drink_id: 'drink4',
    option_category_id: 'opt4',
    default_option_value_id: 'val9',
    created_at: new Date().toISOString()
  }
]

// Utility function to simulate async operations
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms))

// Generate UUID for new items
const generateId = () => Math.random().toString(36).substr(2, 9)

// Mock Drink Categories Service
export const mockDrinkCategoriesService = {
  getAll: async (): Promise<DrinkCategory[]> => {
    await delay()
    return [...mockDrinkCategories].sort((a, b) => a.display_order - b.display_order)
  },

  getById: async (id: string): Promise<DrinkCategory | null> => {
    await delay()
    return mockDrinkCategories.find(cat => cat.id === id) || null
  },

  create: async (data: CreateDrinkCategoryDto): Promise<DrinkCategory> => {
    await delay()
    const newCategory: DrinkCategory = {
      id: generateId(),
      name: data.name,
      description: data.description || null,
      display_order: data.display_order || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockDrinkCategories.push(newCategory)
    return newCategory
  },

  update: async (id: string, data: UpdateDrinkCategoryDto): Promise<DrinkCategory> => {
    await delay()
    const index = mockDrinkCategories.findIndex(cat => cat.id === id)
    if (index === -1) throw new Error('Category not found')
    
    mockDrinkCategories[index] = {
      ...mockDrinkCategories[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    return mockDrinkCategories[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockDrinkCategories.findIndex(cat => cat.id === id)
    if (index === -1) throw new Error('Category not found')
    
    // Check if any drinks exist in this category
    const drinksInCategory = mockDrinks.filter(drink => drink.category_id === id)
    if (drinksInCategory.length > 0) {
      throw new Error('Cannot delete category with existing drinks')
    }
    
    mockDrinkCategories.splice(index, 1)
  },

  reorder: async (categoryIds: string[]): Promise<void> => {
    await delay()
    categoryIds.forEach((id, index) => {
      const category = mockDrinkCategories.find(cat => cat.id === id)
      if (category) {
        category.display_order = index + 1
        category.updated_at = new Date().toISOString()
      }
    })
  }
}

// Mock Drinks Service
export const mockDrinksService = {
  getAll: async (): Promise<Drink[]> => {
    await delay()
    return [...mockDrinks].sort((a, b) => a.display_order - b.display_order)
  },

  getByCategory: async (categoryId: string): Promise<Drink[]> => {
    await delay()
    return mockDrinks
      .filter(drink => drink.category_id === categoryId)
      .sort((a, b) => a.display_order - b.display_order)
  },

  getById: async (id: string): Promise<Drink | null> => {
    await delay()
    return mockDrinks.find(drink => drink.id === id) || null
  },

  getWithOptionsAndCategory: async (id: string): Promise<DrinkWithOptionsAndCategory | null> => {
    await delay()
    const drink = mockDrinks.find(d => d.id === id)
    if (!drink) return null

    const category = mockDrinkCategories.find(c => c.id === drink.category_id)

    return {
      ...drink,
      category: category!,
      drink_options: mockDrinkOptions
        .filter(opt => opt.drink_id === id)
        .map(opt => ({
          id: opt.id,
          drink_id: opt.drink_id,
          option_category_id: opt.option_category_id,
          default_option_value_id: opt.default_option_value_id,
          created_at: opt.created_at,
          option_category: mockOptionCategories.find(cat => cat.id === opt.option_category_id)!,
          default_value: mockOptionValues.find(val => val.id === opt.default_option_value_id) || null
        }))
    }
  },

  create: async (data: CreateDrinkDto): Promise<Drink> => {
    await delay()
    const newDrink: Drink = {
      id: generateId(),
      name: data.name,
      description: data.description || null,
      category_id: data.category_id,
      display_order: data.display_order || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockDrinks.push(newDrink)
    return newDrink
  },

  update: async (id: string, data: UpdateDrinkDto): Promise<Drink> => {
    await delay()
    const index = mockDrinks.findIndex(drink => drink.id === id)
    if (index === -1) throw new Error('Drink not found')
    
    mockDrinks[index] = {
      ...mockDrinks[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    return mockDrinks[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockDrinks.findIndex(drink => drink.id === id)
    if (index === -1) throw new Error('Drink not found')
    
    // Remove associated drink options
    mockDrinkOptions = mockDrinkOptions.filter(opt => opt.drink_id !== id)
    mockDrinks.splice(index, 1)
  },

  reorder: async (drinkIds: string[]): Promise<void> => {
    await delay()
    drinkIds.forEach((id, index) => {
      const drink = mockDrinks.find(d => d.id === id)
      if (drink) {
        drink.display_order = index + 1
        drink.updated_at = new Date().toISOString()
      }
    })
  }
}

// Mock Option Categories Service
export const mockOptionCategoriesService = {
  getAll: async (): Promise<OptionCategory[]> => {
    await delay()
    return [...mockOptionCategories].sort((a, b) => a.display_order - b.display_order)
  },

  getAllWithValues: async (): Promise<OptionCategoryWithValues[]> => {
    await delay()
    return mockOptionCategories
      .sort((a, b) => a.display_order - b.display_order)
      .map(category => ({
        ...category,
        option_values: mockOptionValues
          .filter(val => val.option_category_id === category.id)
          .sort((a, b) => a.display_order - b.display_order)
      }))
  },

  getById: async (id: string): Promise<OptionCategory | null> => {
    await delay()
    return mockOptionCategories.find(cat => cat.id === id) || null
  },

  create: async (data: CreateOptionCategoryDto): Promise<OptionCategory> => {
    await delay()
    const newCategory: OptionCategory = {
      id: generateId(),
      name: data.name,
      description: data.description || null,
      is_required: data.is_required !== undefined ? data.is_required : false,
      display_order: data.display_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockOptionCategories.push(newCategory)
    return newCategory
  },

  update: async (id: string, data: UpdateOptionCategoryDto): Promise<OptionCategory> => {
    await delay()
    const index = mockOptionCategories.findIndex(cat => cat.id === id)
    if (index === -1) throw new Error('Option category not found')
    
    mockOptionCategories[index] = {
      ...mockOptionCategories[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    return mockOptionCategories[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockOptionCategories.findIndex(cat => cat.id === id)
    if (index === -1) throw new Error('Option category not found')
    
    // Remove associated option values and drink options
    mockOptionValues = mockOptionValues.filter(val => val.option_category_id !== id)
    mockDrinkOptions = mockDrinkOptions.filter(opt => opt.option_category_id !== id)
    mockOptionCategories.splice(index, 1)
  }
}

// Mock Option Values Service
export const mockOptionValuesService = {
  getByCategory: async (categoryId: string): Promise<OptionValue[]> => {
    await delay()
    return mockOptionValues
      .filter(val => val.option_category_id === categoryId)
      .sort((a, b) => a.display_order - b.display_order)
  },

  getById: async (id: string): Promise<OptionValue | null> => {
    await delay()
    return mockOptionValues.find(val => val.id === id) || null
  },

  create: async (data: CreateOptionValueDto): Promise<OptionValue> => {
    await delay()
    const newValue: OptionValue = {
      id: generateId(),
      option_category_id: data.option_category_id,
      name: data.name,
      description: data.description || null,
      display_order: data.display_order || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockOptionValues.push(newValue)
    return newValue
  },

  update: async (id: string, data: UpdateOptionValueDto): Promise<OptionValue> => {
    await delay()
    const index = mockOptionValues.findIndex(val => val.id === id)
    if (index === -1) throw new Error('Option value not found')
    
    mockOptionValues[index] = {
      ...mockOptionValues[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    return mockOptionValues[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockOptionValues.findIndex(val => val.id === id)
    if (index === -1) throw new Error('Option value not found')
    
    // Remove from drink options that use this value as default
    mockDrinkOptions = mockDrinkOptions.filter(opt => opt.default_option_value_id !== id)
    mockOptionValues.splice(index, 1)
  }
}

// Mock Drink Options Service
export const mockDrinkOptionsService = {
  getByDrink: async (drinkId: string): Promise<DrinkOption[]> => {
    await delay()
    return mockDrinkOptions.filter(opt => opt.drink_id === drinkId)
  },

  create: async (data: CreateDrinkOptionDto): Promise<DrinkOption> => {
    await delay()
    const newOption: DrinkOption = {
      id: generateId(),
      drink_id: data.drink_id,
      option_category_id: data.option_category_id,
      default_option_value_id: data.default_option_value_id || null,
      created_at: new Date().toISOString()
    }
    mockDrinkOptions.push(newOption)
    return newOption
  },

  update: async (id: string, data: UpdateDrinkOptionDto): Promise<DrinkOption> => {
    await delay()
    const index = mockDrinkOptions.findIndex(opt => opt.id === id)
    if (index === -1) throw new Error('Drink option not found')
    
    mockDrinkOptions[index] = {
      ...mockDrinkOptions[index],
      ...data
    }
    return mockDrinkOptions[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockDrinkOptions.findIndex(opt => opt.id === id)
    if (index === -1) throw new Error('Drink option not found')
    
    mockDrinkOptions.splice(index, 1)
  },

  bulkUpsert: async (
    drinkId: string,
    optionCategoryIds: string[],
    defaultValues: Record<string, string>
  ): Promise<void> => {
    await delay()
    
    // Remove existing options for this drink
    mockDrinkOptions = mockDrinkOptions.filter(opt => opt.drink_id !== drinkId)
    
    // Add new options
    optionCategoryIds.forEach(categoryId => {
      const newOption: DrinkOption = {
        id: generateId(),
        drink_id: drinkId,
        option_category_id: categoryId,
        default_option_value_id: defaultValues[categoryId] || null,
        created_at: new Date().toISOString()
      }
      mockDrinkOptions.push(newOption)
    })
  }
}