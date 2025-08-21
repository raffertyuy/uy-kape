import { supabase } from '@/lib/supabase'
import type { OptionCategoryWithValues, OptionValue } from '@/types/menu.types'

export interface OptionServiceError {
  type: 'network' | 'database' | 'validation' | 'unknown'
  message: string
  statusCode?: number
}

/**
 * Fetch all option values for a specific option category
 */
export async function getOptionValuesByCategory(
  categoryId: string
): Promise<{ data: OptionValue[] | null; error: OptionServiceError | null }> {
  try {
    const { data, error } = await supabase
      .from('option_values')
      .select('*')
      .eq('option_category_id', categoryId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      return {
        data: null,
        error: {
          type: 'database',
          message: `Failed to fetch option values: ${error.message}`,
          statusCode: 500
        }
      }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: {
        type: 'network',
        message: err instanceof Error ? err.message : 'Failed to fetch option values',
        statusCode: 500
      }
    }
  }
}

/**
 * Fetch option category with all its values
 */
export async function getOptionCategoryWithValues(
  categoryId: string
): Promise<{ data: OptionCategoryWithValues | null; error: OptionServiceError | null }> {
  try {
    const { data: category, error: categoryError } = await supabase
      .from('option_categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (categoryError) {
      return {
        data: null,
        error: {
          type: 'database',
          message: `Failed to fetch option category: ${categoryError.message}`,
          statusCode: 404
        }
      }
    }

    const { data: values, error: valuesError } = await getOptionValuesByCategory(categoryId)

    if (valuesError) {
      return { data: null, error: valuesError }
    }

    return {
      data: {
        ...category,
        option_values: values || []
      },
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: {
        type: 'network',
        message: err instanceof Error ? err.message : 'Failed to fetch option category',
        statusCode: 500
      }
    }
  }
}

/**
 * Fetch multiple option categories with their values
 */
export async function getOptionCategoriesWithValues(
  categoryIds: string[]
): Promise<{ data: OptionCategoryWithValues[] | null; error: OptionServiceError | null }> {
  try {
    if (categoryIds.length === 0) {
      return { data: [], error: null }
    }

    const results = await Promise.all(
      categoryIds.map(id => getOptionCategoryWithValues(id))
    )

    // Check if any categories failed to load due to database issues
    const databaseErrors = results.filter(result => 
      result.error && result.error.type === 'database'
    )

    // If we have database errors for all categories, return a database error
    if (databaseErrors.length === results.length) {
      return {
        data: null,
        error: {
          type: 'database',
          message: 'Unable to load option categories from database. Please check your connection.',
          statusCode: 500
        }
      }
    }

    // Collect successfully loaded categories
    const categories: OptionCategoryWithValues[] = []
    const missingCategories: string[] = []

    results.forEach((result, index) => {
      if (result.error) {
        missingCategories.push(categoryIds[index])
        console.warn(`Option category ${categoryIds[index]} not found or inactive`)
      } else if (result.data) {
        categories.push(result.data)
      }
    })

    // If some categories are missing but others loaded successfully, 
    // return the available categories (this handles partial data scenarios)
    if (missingCategories.length > 0) {
      console.warn(`Missing option categories: ${missingCategories.join(', ')}. These options will be skipped.`)
    }

    return { data: categories, error: null }
  } catch (err) {
    return {
      data: null,
      error: {
        type: 'network',
        message: 'Unable to connect to the database. Please check your internet connection.',
        statusCode: 500
      }
    }
  }
}

/**
 * Validate that selected option values exist and are active
 */
export async function validateSelectedOptions(
  selectedOptions: Record<string, string>
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = []

  try {
    const valueIds = Object.values(selectedOptions)
    
    if (valueIds.length === 0) {
      return { isValid: true, errors: [] }
    }

    const { data: values, error } = await supabase
      .from('option_values')
      .select('id, name, is_active')
      .in('id', valueIds)

    if (error) {
      errors.push(`Failed to validate options: ${error.message}`)
      return { isValid: false, errors }
    }

    // Check if all values exist and are active
    const foundIds = new Set((values || []).map((v: any) => v.id))
    const inactiveValues = (values || []).filter((v: any) => !v.is_active)

    for (const valueId of valueIds) {
      if (!foundIds.has(valueId)) {
        errors.push(`Option value ${valueId} does not exist`)
      }
    }

    for (const inactiveValue of inactiveValues) {
      errors.push(`Option '${inactiveValue.name}' is no longer available`)
    }

    return { isValid: errors.length === 0, errors }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Failed to validate options')
    return { isValid: false, errors }
  }
}

/**
 * Get default option values for required categories
 */
export async function getDefaultOptionsForDrink(
  drinkId: string
): Promise<{ data: Record<string, string> | null; error: OptionServiceError | null }> {
  try {
    const { data: drinkOptions, error } = await supabase
      .from('drink_options')
      .select(`
        option_category_id,
        default_option_value_id,
        option_category:option_categories(is_required)
      `)
      .eq('drink_id', drinkId)

    if (error) {
      return {
        data: null,
        error: {
          type: 'database',
          message: `Failed to fetch drink options: ${error.message}`,
          statusCode: 500
        }
      }
    }

    const defaults: Record<string, string> = {}

    for (const option of drinkOptions || []) {
      if (option.default_option_value_id) {
        defaults[option.option_category_id] = option.default_option_value_id
      }
    }

    return { data: defaults, error: null }
  } catch (err) {
    return {
      data: null,
      error: {
        type: 'network',
        message: err instanceof Error ? err.message : 'Failed to get default options',
        statusCode: 500
      }
    }
  }
}