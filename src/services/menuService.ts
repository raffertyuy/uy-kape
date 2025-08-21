import { supabase } from '@/lib/supabase'
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

// Import the mock services
import {
  mockDrinkCategoriesService,
  mockDrinksService,
  mockOptionCategoriesService,
  mockOptionValuesService,
  mockDrinkOptionsService
} from './mockMenuService'

// Detection flag to see if we should use mock data
let useMockData = false

// Test function to check if Supabase is working
const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try a simple query to check connectivity
    const { error } = await supabase.from('drink_categories').select('id').limit(1)
    return !error
  } catch (error) {
    console.warn('Supabase connection test failed, falling back to mock data:', error)
    return false
  }
}

// Initialize the service mode on first use
let serviceInitialized = false
const initializeServiceMode = async (): Promise<void> => {
  if (!serviceInitialized) {
    const supabaseWorking = await testSupabaseConnection()
    useMockData = !supabaseWorking
    serviceInitialized = true
    
    // Service mode set - using mock data in development/testing if Supabase unavailable
    if (useMockData) {
      // Mock data mode active
    } else {
      // Supabase connection established
    }
  }
}

// Utility function for handling Supabase errors
const handleSupabaseError = (error: any): never => {
  console.error('Supabase operation failed:', error)
  throw new Error(error.message || 'Database operation failed')
}

// Adaptive Drink Categories Service
export const drinkCategoriesService = {
  getAll: async (): Promise<DrinkCategory[]> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkCategoriesService.getAll()
    }

    const { data, error } = await supabase
      .from('drink_categories')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getById: async (id: string): Promise<DrinkCategory | null> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkCategoriesService.getById(id)
    }

    const { data, error } = await supabase
      .from('drink_categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      handleSupabaseError(error)
    }
    return data as DrinkCategory
  },

  create: async (category: CreateDrinkCategoryDto): Promise<DrinkCategory> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkCategoriesService.create(category)
    }

    const { data, error } = await supabase
      .from('drink_categories')
      .insert(category)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to create category')
    return data as DrinkCategory
  },

  update: async (id: string, updates: UpdateDrinkCategoryDto): Promise<DrinkCategory> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkCategoriesService.update(id, updates)
    }

    const { data, error } = await supabase
      .from('drink_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to update category')
    return data as DrinkCategory
  },

  delete: async (id: string): Promise<void> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkCategoriesService.delete(id)
    }

    const { error } = await supabase
      .from('drink_categories')
      .delete()
      .eq('id', id)
    
    if (error) handleSupabaseError(error)
  },

  updateDisplayOrder: async (categories: Array<{ id: string; display_order: number }>): Promise<void> => {
    await initializeServiceMode()
    
    if (useMockData) {
      const categoryIds = categories
        .sort((a, b) => a.display_order - b.display_order)
        .map(cat => cat.id)
      return mockDrinkCategoriesService.reorder(categoryIds)
    }

    // Use individual updates since the RPC function doesn't exist yet
    for (const category of categories) {
      const { error } = await supabase
        .from('drink_categories')
        .update({ display_order: category.display_order })
        .eq('id', category.id)
      
      if (error) handleSupabaseError(error)
    }
  }
}

// Adaptive Drinks Service
export const drinksService = {
  getAll: async (): Promise<Drink[]> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinksService.getAll()
    }

    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getByCategory: async (categoryId: string): Promise<Drink[]> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinksService.getByCategory(categoryId)
    }

    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('category_id', categoryId)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getById: async (id: string): Promise<Drink | null> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinksService.getById(id)
    }

    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      handleSupabaseError(error)
    }
    return data as Drink
  },

  getWithOptionsAndCategory: async (id: string): Promise<DrinkWithOptionsAndCategory | null> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinksService.getWithOptionsAndCategory(id)
    }

    const { data, error } = await supabase
      .from('drinks')
      .select(`
        *,
        category:drink_categories(*),
        drink_options(
          id,
          drink_id,
          option_category_id,
          default_option_value_id,
          created_at,
          option_category:option_categories(*),
          default_value:option_values(*)
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      handleSupabaseError(error)
    }
    return data as DrinkWithOptionsAndCategory
  },

  create: async (drink: CreateDrinkDto): Promise<Drink> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinksService.create(drink)
    }

    const { data, error } = await supabase
      .from('drinks')
      .insert(drink)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to create drink')
    return data as Drink
  },

  update: async (id: string, updates: UpdateDrinkDto): Promise<Drink> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinksService.update(id, updates)
    }

    const { data, error } = await supabase
      .from('drinks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to update drink')
    return data as Drink
  },

  delete: async (id: string): Promise<void> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinksService.delete(id)
    }

    const { error } = await supabase
      .from('drinks')
      .delete()
      .eq('id', id)
    
    if (error) handleSupabaseError(error)
  },

  updateDisplayOrder: async (drinks: Array<{ id: string; display_order: number }>): Promise<void> => {
    await initializeServiceMode()
    
    if (useMockData) {
      const drinkIds = drinks
        .sort((a, b) => a.display_order - b.display_order)
        .map(drink => drink.id)
      return mockDrinksService.reorder(drinkIds)
    }

    for (const drink of drinks) {
      const { error } = await supabase
        .from('drinks')
        .update({ display_order: drink.display_order })
        .eq('id', drink.id)
      
      if (error) handleSupabaseError(error)
    }
  }
}

// Adaptive Option Categories Service
export const optionCategoriesService = {
  getAll: async (): Promise<OptionCategory[]> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionCategoriesService.getAll()
    }

    const { data, error } = await supabase
      .from('option_categories')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getAllWithValues: async (): Promise<OptionCategoryWithValues[]> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionCategoriesService.getAllWithValues()
    }

    const { data, error } = await supabase
      .from('option_categories')
      .select(`
        *,
        option_values:option_values(*)
      `)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data?.map(category => ({
      ...category,
      option_values: category.option_values?.sort((a: OptionValue, b: OptionValue) => a.display_order - b.display_order) || []
    })) || []
  },

  getById: async (id: string): Promise<OptionCategory | null> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionCategoriesService.getById(id)
    }

    const { data, error } = await supabase
      .from('option_categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      handleSupabaseError(error)
    }
    return data as OptionCategory
  },

  create: async (category: CreateOptionCategoryDto): Promise<OptionCategory> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionCategoriesService.create(category)
    }

    const { data, error } = await supabase
      .from('option_categories')
      .insert(category)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to create option category')
    return data as OptionCategory
  },

  update: async (id: string, updates: UpdateOptionCategoryDto): Promise<OptionCategory> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionCategoriesService.update(id, updates)
    }

    const { data, error } = await supabase
      .from('option_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to update option category')
    return data as OptionCategory
  },

  delete: async (id: string): Promise<void> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionCategoriesService.delete(id)
    }

    const { error } = await supabase
      .from('option_categories')
      .delete()
      .eq('id', id)
    
    if (error) handleSupabaseError(error)
  }
}

// Adaptive Option Values Service
export const optionValuesService = {
  getByCategory: async (categoryId: string): Promise<OptionValue[]> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionValuesService.getByCategory(categoryId)
    }

    const { data, error } = await supabase
      .from('option_values')
      .select('*')
      .eq('option_category_id', categoryId)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getById: async (id: string): Promise<OptionValue | null> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionValuesService.getById(id)
    }

    const { data, error } = await supabase
      .from('option_values')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      handleSupabaseError(error)
    }
    return data as OptionValue
  },

  create: async (value: CreateOptionValueDto): Promise<OptionValue> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionValuesService.create(value)
    }

    const { data, error } = await supabase
      .from('option_values')
      .insert(value)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to create option value')
    return data as OptionValue
  },

  update: async (id: string, updates: UpdateOptionValueDto): Promise<OptionValue> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionValuesService.update(id, updates)
    }

    const { data, error } = await supabase
      .from('option_values')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to update option value')
    return data as OptionValue
  },

  delete: async (id: string): Promise<void> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockOptionValuesService.delete(id)
    }

    const { error } = await supabase
      .from('option_values')
      .delete()
      .eq('id', id)
    
    if (error) handleSupabaseError(error)
  }
}

// Adaptive Drink Options Service
export const drinkOptionsService = {
  getByDrink: async (drinkId: string): Promise<DrinkOption[]> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkOptionsService.getByDrink(drinkId)
    }

    const { data, error } = await supabase
      .from('drink_options')
      .select('*')
      .eq('drink_id', drinkId)
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  create: async (option: CreateDrinkOptionDto): Promise<DrinkOption> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkOptionsService.create(option)
    }

    const { data, error } = await supabase
      .from('drink_options')
      .insert(option)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to create drink option')
    return data as DrinkOption
  },

  update: async (id: string, updates: UpdateDrinkOptionDto): Promise<DrinkOption> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkOptionsService.update(id, updates)
    }

    const { data, error } = await supabase
      .from('drink_options')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to update drink option')
    return data as DrinkOption
  },

  delete: async (id: string): Promise<void> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkOptionsService.delete(id)
    }

    const { error } = await supabase
      .from('drink_options')
      .delete()
      .eq('id', id)
    
    if (error) handleSupabaseError(error)
  },

  bulkUpsert: async (
    drinkId: string,
    optionCategoryIds: string[],
    defaultValues: Record<string, string>
  ): Promise<void> => {
    await initializeServiceMode()
    
    if (useMockData) {
      return mockDrinkOptionsService.bulkUpsert(drinkId, optionCategoryIds, defaultValues)
    }

    // Delete existing options for this drink
    const { error: deleteError } = await supabase
      .from('drink_options')
      .delete()
      .eq('drink_id', drinkId)
    
    if (deleteError) handleSupabaseError(deleteError)
    
    // Insert new options
    if (optionCategoryIds.length > 0) {
      const newOptions = optionCategoryIds.map(categoryId => ({
        drink_id: drinkId,
        option_category_id: categoryId,
        default_value_id: defaultValues[categoryId] || null
      }))
      
      const { error: insertError } = await supabase
        .from('drink_options')
        .insert(newOptions)
      
      if (insertError) handleSupabaseError(insertError)
    }
  }
}