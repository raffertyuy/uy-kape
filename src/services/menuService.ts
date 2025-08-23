import { supabase } from '@/lib/supabase'
import { retrySupabaseOperation } from '@/utils/retryUtils'
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
  OptionCategoryWithValues,
  DrinkWithOptionsPreview,
  MenuServiceError
} from '@/types/menu.types'

// Utility function for handling Supabase errors with better categorization
const handleSupabaseError = (error: any, operation: string = 'database operation'): never => {
  console.error('Supabase operation failed:', error)
  
  let menuError: MenuServiceError
  
  // Network connectivity errors
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    menuError = {
      type: 'network',
      message: `Network error during ${operation}: ${error.message}`,
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      details: error,
      retryable: true
    }
  }
  // Supabase specific errors
  else if (error?.code) {
    switch (error.code) {
      case 'PGRST116': // Not found
        menuError = {
          type: 'validation',
          message: `Item not found during ${operation}`,
          userMessage: 'The requested item could not be found.',
          details: error,
          retryable: false
        }
        break
      case '401':
      case 'UNAUTHORIZED':
        menuError = {
          type: 'authentication',
          message: `Authentication error during ${operation}`,
          userMessage: 'Access denied. Please check your permissions.',
          details: error,
          retryable: false
        }
        break
      case '23505': // Unique constraint violation
        menuError = {
          type: 'validation',
          message: `Duplicate entry during ${operation}`,
          userMessage: 'An item with this name already exists. Please use a different name.',
          details: error,
          retryable: false
        }
        break
      default:
        menuError = {
          type: 'server',
          message: `Server error during ${operation}: ${error.message}`,
          userMessage: 'A server error occurred. Please try again in a moment.',
          details: error,
          retryable: true
        }
    }
  }
  // Generic errors
  else {
    menuError = {
      type: 'unknown',
      message: `Unknown error during ${operation}: ${error?.message || 'Unknown error'}`,
      userMessage: 'An unexpected error occurred. Please try again.',
      details: error,
      retryable: true
    }
  }
  
  const enhancedError = new Error(menuError.userMessage) as Error & { menuError: MenuServiceError }
  enhancedError.menuError = menuError
  throw enhancedError
}

// Drink Categories Service
export const drinkCategoriesService = {
  getAll: async (): Promise<DrinkCategory[]> => {
    const { data, error } = await supabase
      .from('drink_categories')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error, 'fetch drink categories')
    return data || []
  },

  getById: async (id: string): Promise<DrinkCategory | null> => {
    const { data, error } = await supabase
      .from('drink_categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      handleSupabaseError(error, 'fetch drink category')
    }
    return data as DrinkCategory
  },

  create: async (category: CreateDrinkCategoryDto): Promise<DrinkCategory> => {
    return await retrySupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('drink_categories')
        .insert(category)
        .select()
        .single()
      
      if (error) handleSupabaseError(error, 'create drink category')
      if (!data) throw new Error('Failed to create category')
      return data as DrinkCategory
    })
  },

  update: async (id: string, updates: UpdateDrinkCategoryDto): Promise<DrinkCategory> => {
    return await retrySupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('drink_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) handleSupabaseError(error, 'update drink category')
      if (!data) throw new Error('Failed to update category')
      return data as DrinkCategory
    })
  },

  delete: async (id: string): Promise<void> => {
    return await retrySupabaseOperation(async () => {
      const { error } = await supabase
        .from('drink_categories')
        .delete()
        .eq('id', id)
      
      if (error) handleSupabaseError(error, 'delete drink category')
    })
  },

  updateDisplayOrder: async (categories: Array<{ id: string; display_order: number }>): Promise<void> => {
    // Use individual updates since the RPC function doesn't exist yet
    for (const category of categories) {
      const { error } = await supabase
        .from('drink_categories')
        .update({ display_order: category.display_order })
        .eq('id', category.id)
      
      if (error) handleSupabaseError(error, 'update drink category display order')
    }
  }
}

// Drinks Service
export const drinksService = {
  getAll: async (): Promise<Drink[]> => {
    const { data, error } = await supabase
      .from('drinks')
      .select(`
        *,
        category:drink_categories(*)
      `)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error, 'fetch drinks')
    return data || []
  },

  getByCategory: async (categoryId: string): Promise<Drink[]> => {
    const { data, error } = await supabase
      .from('drinks')
      .select(`
        *,
        category:drink_categories(*)
      `)
      .eq('category_id', categoryId)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getById: async (id: string): Promise<Drink | null> => {
    const { data, error } = await supabase
      .from('drinks')
      .select(`
        *,
        category:drink_categories(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      handleSupabaseError(error)
    }
    return data as Drink
  },

  getWithOptions: async (id: string): Promise<DrinkWithOptionsAndCategory | null> => {
    const { data, error } = await supabase
      .from('drinks')
      .select(`
        *,
        category:drink_categories(*),
        drink_options(
          *,
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
    return await retrySupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('drinks')
        .insert(drink)
        .select(`
          *,
          category:drink_categories(*)
        `)
        .single()
      
      if (error) handleSupabaseError(error, 'create drink')
      if (!data) throw new Error('Failed to create drink')
      return data as Drink
    })
  },

  update: async (id: string, updates: UpdateDrinkDto): Promise<Drink> => {
    return await retrySupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('drinks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          category:drink_categories(*)
        `)
        .single()
      
      if (error) handleSupabaseError(error, 'update drink')
      if (!data) throw new Error('Failed to update drink')
      return data as Drink
    })
  },

  delete: async (id: string): Promise<void> => {
    return await retrySupabaseOperation(async () => {
      const { error } = await supabase
        .from('drinks')
        .delete()
        .eq('id', id)
      
      if (error) handleSupabaseError(error, 'delete drink')
    })
  },

  updateDisplayOrder: async (drinks: Array<{ id: string; display_order: number }>): Promise<void> => {
    for (const drink of drinks) {
      const { error } = await supabase
        .from('drinks')
        .update({ display_order: drink.display_order })
        .eq('id', drink.id)
      
      if (error) handleSupabaseError(error)
    }
  },

  getAllWithOptionsPreview: async (): Promise<DrinkWithOptionsPreview[]> => {
    const { data, error } = await supabase
      .from('drinks')
      .select(`
        *,
        category:drink_categories(*),
        drink_options(
          id,
          option_category_id,
          option_category:option_categories(name, is_required),
          default_value:option_values(name)
        )
      `)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    
    // Transform the data to match DrinkWithOptionsPreview interface
    return (data || []).map(drink => ({
      ...drink,
      options_preview: (drink.drink_options || []).map(option => ({
        id: option.option_category_id, // Use option_category_id instead of drink_option.id
        option_category_name: option.option_category?.name || 'Unknown',
        default_value_name: option.default_value?.name || null,
        is_required: option.option_category?.is_required || false
      }))
    })) as DrinkWithOptionsPreview[]
  },

  getByCategoryWithOptionsPreview: async (categoryId: string): Promise<DrinkWithOptionsPreview[]> => {
    const { data, error } = await supabase
      .from('drinks')
      .select(`
        *,
        category:drink_categories(*),
        drink_options(
          id,
          option_category_id,
          option_category:option_categories(name, is_required),
          default_value:option_values(name)
        )
      `)
      .eq('category_id', categoryId)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    
    // Transform the data to match DrinkWithOptionsPreview interface
    return (data || []).map(drink => ({
      ...drink,
      options_preview: (drink.drink_options || []).map(option => ({
        id: option.option_category_id, // Use option_category_id instead of drink_option.id
        option_category_name: option.option_category?.name || 'Unknown',
        default_value_name: option.default_value?.name || null,
        is_required: option.option_category?.is_required || false
      }))
    })) as DrinkWithOptionsPreview[]
  }
}

// Option Categories Service
export const optionCategoriesService = {
  getAll: async (): Promise<OptionCategory[]> => {
    const { data, error } = await supabase
      .from('option_categories')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getAllWithValues: async (): Promise<OptionCategoryWithValues[]> => {
    const { data, error } = await supabase
      .from('option_categories')
      .select(`
        *,
        option_values(*)
      `)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getById: async (id: string): Promise<OptionCategory | null> => {
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
    const { data, error } = await supabase
      .from('option_categories')
      .insert(category)
      .select()
      .single()
    
    if (error) handleSupabaseError(error, 'create option category')
    if (!data) throw new Error('Failed to create option category')
    return data as OptionCategory
  },

  update: async (id: string, updates: UpdateOptionCategoryDto): Promise<OptionCategory> => {
    const { data, error } = await supabase
      .from('option_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) handleSupabaseError(error, 'update option category')
    if (!data) throw new Error('Failed to update option category')
    return data as OptionCategory
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('option_categories')
      .delete()
      .eq('id', id)
    
    if (error) handleSupabaseError(error, 'delete option category')
  }
}

// Option Values Service
export const optionValuesService = {
  getByCategory: async (categoryId: string): Promise<OptionValue[]> => {
    const { data, error } = await supabase
      .from('option_values')
      .select(`
        *,
        category:option_categories(*)
      `)
      .eq('option_category_id', categoryId)
      .order('display_order', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  getById: async (id: string): Promise<OptionValue | null> => {
    const { data, error } = await supabase
      .from('option_values')
      .select(`
        *,
        category:option_categories(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      handleSupabaseError(error)
    }
    return data as OptionValue
  },

  create: async (value: CreateOptionValueDto): Promise<OptionValue> => {
    const { data, error } = await supabase
      .from('option_values')
      .insert(value)
      .select(`
        *,
        category:option_categories(*)
      `)
      .single()
    
    if (error) handleSupabaseError(error, 'create option value')
    if (!data) throw new Error('Failed to create option value')
    return data as OptionValue
  },

  update: async (id: string, updates: UpdateOptionValueDto): Promise<OptionValue> => {
    const { data, error } = await supabase
      .from('option_values')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        category:option_categories(*)
      `)
      .single()
    
    if (error) handleSupabaseError(error, 'update option value')
    if (!data) throw new Error('Failed to update option value')
    return data as OptionValue
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('option_values')
      .delete()
      .eq('id', id)
    
    if (error) handleSupabaseError(error, 'delete option value')
  },

  updateDisplayOrder: async (values: Array<{ id: string; display_order: number }>): Promise<void> => {
    for (const value of values) {
      const { error } = await supabase
        .from('option_values')
        .update({ display_order: value.display_order })
        .eq('id', value.id)
      
      if (error) handleSupabaseError(error)
    }
  }
}

// Drink Options Service
export const drinkOptionsService = {
  getByDrink: async (drinkId: string): Promise<DrinkOption[]> => {
    const { data, error } = await supabase
      .from('drink_options')
      .select(`
        *,
        drink:drinks(*),
        option_category:option_categories(*),
        default_value:option_values(*)
      `)
      .eq('drink_id', drinkId)
    
    if (error) handleSupabaseError(error)
    return data || []
  },

  create: async (drinkOption: CreateDrinkOptionDto): Promise<DrinkOption> => {
    const { data, error } = await supabase
      .from('drink_options')
      .insert(drinkOption)
      .select(`
        *,
        drink:drinks(*),
        option_category:option_categories(*),
        default_value:option_values(*)
      `)
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to create drink option')
    return data as DrinkOption
  },

  update: async (id: string, updates: UpdateDrinkOptionDto): Promise<DrinkOption> => {
    const { data, error } = await supabase
      .from('drink_options')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        drink:drinks(*),
        option_category:option_categories(*),
        default_value:option_values(*)
      `)
      .single()
    
    if (error) handleSupabaseError(error)
    if (!data) throw new Error('Failed to update drink option')
    return data as DrinkOption
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('drink_options')
      .delete()
      .eq('id', id)
    
    if (error) handleSupabaseError(error)
  },

  deleteByDrinkAndCategory: async (drinkId: string, optionCategoryId: string): Promise<void> => {
    const { error } = await supabase
      .from('drink_options')
      .delete()
      .eq('drink_id', drinkId)
      .eq('option_category_id', optionCategoryId)
    
    if (error) handleSupabaseError(error)
  },

  bulkUpsert: async (drinkId: string, optionCategoryIds: string[], defaultValues: Record<string, string>): Promise<void> => {
    // First delete existing options for this drink
    await supabase
      .from('drink_options')
      .delete()
      .eq('drink_id', drinkId)

    // Then insert new options
    const newOptions = optionCategoryIds.map(categoryId => ({
      drink_id: drinkId,
      option_category_id: categoryId,
      default_option_value_id: defaultValues[categoryId] || null
    }))

    if (newOptions.length > 0) {
      const { error } = await supabase
        .from('drink_options')
        .insert(newOptions)
      
      if (error) handleSupabaseError(error)
    }
  }
}