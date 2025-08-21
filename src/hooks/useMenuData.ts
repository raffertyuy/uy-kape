import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  drinkCategoriesService,
  drinksService,
  optionCategoriesService,
  optionValuesService,
  drinkOptionsService
} from '@/services/menuService'
import type {
  DrinkCategory,
  Drink,
  OptionCategory,
  OptionValue,
  DrinkOption,
  DrinkWithOptionsAndCategory,
  OptionCategoryWithValues,
  MenuOperationResult,
  CreateDrinkCategoryDto,
  UpdateDrinkCategoryDto,
  CreateDrinkDto,
  UpdateDrinkDto,
  CreateOptionCategoryDto,
  UpdateOptionCategoryDto,
  CreateOptionValueDto,
  UpdateOptionValueDto,
  CreateDrinkOptionDto,
  UpdateDrinkOptionDto
} from '@/types/menu.types'

// Hook for managing loading state and errors
const useAsyncOperation = <T>() => {
  const [state, setState] = useState<MenuOperationResult<T>>({
    state: 'idle'
  })

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState({ state: 'loading' })
    try {
      const data = await operation()
      setState({ state: 'success', data })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState({
        state: 'error',
        error: { type: 'unknown', message: errorMessage }
      })
      throw error
    }
  }, [])

  return { ...state, execute }
}

// Hook for drink categories
export const useDrinkCategories = () => {
  const [categories, setCategories] = useState<DrinkCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await drinkCategoriesService.getAll()
      setCategories(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()

    // Set up real-time subscription
    const subscription = supabase
      .channel('drink_categories_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drink_categories'
      }, () => {
        fetchCategories()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchCategories])

  return {
    data: categories,
    isLoading,
    error,
    refetch: fetchCategories
  }
}

// Hook for drinks
export const useDrinks = (categoryId?: string) => {
  const [drinks, setDrinks] = useState<Drink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDrinks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = categoryId 
        ? await drinksService.getByCategory(categoryId)
        : await drinksService.getAll()
      setDrinks(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch drinks'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    fetchDrinks()

    // Set up real-time subscription
    const subscription = supabase
      .channel('drinks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drinks'
      }, () => {
        fetchDrinks()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchDrinks])

  return {
    data: drinks,
    isLoading,
    error,
    refetch: fetchDrinks
  }
}

// Hook for individual drink with options
export const useDrinkWithOptions = (drinkId?: string) => {
  const [drink, setDrink] = useState<DrinkWithOptionsAndCategory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDrink = useCallback(async () => {
    if (!drinkId) {
      setDrink(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await drinksService.getWithOptionsAndCategory(drinkId)
      setDrink(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch drink'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [drinkId])

  useEffect(() => {
    fetchDrink()

    if (!drinkId) return

    // Set up real-time subscriptions for drink and its options
    const drinkSubscription = supabase
      .channel('drink_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drinks',
        filter: `id=eq.${drinkId}`
      }, () => {
        fetchDrink()
      })
      .subscribe()

    const optionsSubscription = supabase
      .channel('drink_options_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drink_options',
        filter: `drink_id=eq.${drinkId}`
      }, () => {
        fetchDrink()
      })
      .subscribe()

    return () => {
      drinkSubscription.unsubscribe()
      optionsSubscription.unsubscribe()
    }
  }, [fetchDrink, drinkId])

  return {
    data: drink,
    isLoading,
    error,
    refetch: fetchDrink
  }
}

// Hook for option categories
export const useOptionCategories = () => {
  const [categories, setCategories] = useState<OptionCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await optionCategoriesService.getAll()
      setCategories(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch option categories'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()

    // Set up real-time subscription
    const subscription = supabase
      .channel('option_categories_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'option_categories'
      }, () => {
        fetchCategories()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchCategories])

  return {
    data: categories,
    isLoading,
    error,
    refetch: fetchCategories
  }
}

// Hook for option categories with values
export const useOptionCategoriesWithValues = () => {
  const [categories, setCategories] = useState<OptionCategoryWithValues[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await optionCategoriesService.getAllWithValues()
      setCategories(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch option categories'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()

    // Set up real-time subscriptions
    const categoriesSubscription = supabase
      .channel('option_categories_with_values_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'option_categories'
      }, () => {
        fetchCategories()
      })
      .subscribe()

    const valuesSubscription = supabase
      .channel('option_values_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'option_values'
      }, () => {
        fetchCategories()
      })
      .subscribe()

    return () => {
      categoriesSubscription.unsubscribe()
      valuesSubscription.unsubscribe()
    }
  }, [fetchCategories])

  return {
    data: categories,
    isLoading,
    error,
    refetch: fetchCategories
  }
}

// Hook for option values by category
export const useOptionValues = (categoryId?: string) => {
  const [values, setValues] = useState<OptionValue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchValues = useCallback(async () => {
    if (!categoryId) {
      setValues([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await optionValuesService.getByCategory(categoryId)
      setValues(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch option values'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    fetchValues()

    if (!categoryId) return

    // Set up real-time subscription
    const subscription = supabase
      .channel('option_values_by_category_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'option_values',
        filter: `option_category_id=eq.${categoryId}`
      }, () => {
        fetchValues()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchValues, categoryId])

  return {
    data: values,
    isLoading,
    error,
    refetch: fetchValues
  }
}

// Mutation hooks for drink categories
export const useCreateDrinkCategory = () => {
  const operation = useAsyncOperation<DrinkCategory>()
  
  const createCategory = useCallback((data: CreateDrinkCategoryDto) => 
    operation.execute(() => drinkCategoriesService.create(data)), [operation])

  return { ...operation, createCategory }
}

export const useUpdateDrinkCategory = () => {
  const operation = useAsyncOperation<DrinkCategory>()
  
  const updateCategory = useCallback((id: string, data: UpdateDrinkCategoryDto) => 
    operation.execute(() => drinkCategoriesService.update(id, data)), [operation])

  return { ...operation, updateCategory }
}

export const useDeleteDrinkCategory = () => {
  const operation = useAsyncOperation<void>()
  
  const deleteCategory = useCallback((id: string) => 
    operation.execute(() => drinkCategoriesService.delete(id)), [operation])

  return { ...operation, deleteCategory }
}

// Mutation hooks for drinks
export const useCreateDrink = () => {
  const operation = useAsyncOperation<Drink>()
  
  const createDrink = useCallback((data: CreateDrinkDto) => 
    operation.execute(() => drinksService.create(data)), [operation])

  return { ...operation, createDrink }
}

export const useUpdateDrink = () => {
  const operation = useAsyncOperation<Drink>()
  
  const updateDrink = useCallback((id: string, data: UpdateDrinkDto) => 
    operation.execute(() => drinksService.update(id, data)), [operation])

  return { ...operation, updateDrink }
}

export const useDeleteDrink = () => {
  const operation = useAsyncOperation<void>()
  
  const deleteDrink = useCallback((id: string) => 
    operation.execute(() => drinksService.delete(id)), [operation])

  return { ...operation, deleteDrink }
}

// Mutation hooks for option categories
export const useCreateOptionCategory = () => {
  const operation = useAsyncOperation<OptionCategory>()
  
  const createCategory = useCallback((data: CreateOptionCategoryDto) => 
    operation.execute(() => optionCategoriesService.create(data)), [operation])

  return { ...operation, createCategory }
}

export const useUpdateOptionCategory = () => {
  const operation = useAsyncOperation<OptionCategory>()
  
  const updateCategory = useCallback((id: string, data: UpdateOptionCategoryDto) => 
    operation.execute(() => optionCategoriesService.update(id, data)), [operation])

  return { ...operation, updateCategory }
}

export const useDeleteOptionCategory = () => {
  const operation = useAsyncOperation<void>()
  
  const deleteCategory = useCallback((id: string) => 
    operation.execute(() => optionCategoriesService.delete(id)), [operation])

  return { ...operation, deleteCategory }
}

// Mutation hooks for option values
export const useCreateOptionValue = () => {
  const operation = useAsyncOperation<OptionValue>()
  
  const createValue = useCallback((data: CreateOptionValueDto) => 
    operation.execute(() => optionValuesService.create(data)), [operation])

  return { ...operation, createValue }
}

export const useUpdateOptionValue = () => {
  const operation = useAsyncOperation<OptionValue>()
  
  const updateValue = useCallback((id: string, data: UpdateOptionValueDto) => 
    operation.execute(() => optionValuesService.update(id, data)), [operation])

  return { ...operation, updateValue }
}

export const useDeleteOptionValue = () => {
  const operation = useAsyncOperation<void>()
  
  const deleteValue = useCallback((id: string) => 
    operation.execute(() => optionValuesService.delete(id)), [operation])

  return { ...operation, deleteValue }
}

// Mutation hooks for drink options
export const useCreateDrinkOption = () => {
  const operation = useAsyncOperation<DrinkOption>()
  
  const createDrinkOption = useCallback((data: CreateDrinkOptionDto) => 
    operation.execute(() => drinkOptionsService.create(data)), [operation])

  return { ...operation, createDrinkOption }
}

export const useUpdateDrinkOption = () => {
  const operation = useAsyncOperation<DrinkOption>()
  
  const updateDrinkOption = useCallback((id: string, data: UpdateDrinkOptionDto) => 
    operation.execute(() => drinkOptionsService.update(id, data)), [operation])

  return { ...operation, updateDrinkOption }
}

export const useDeleteDrinkOption = () => {
  const operation = useAsyncOperation<void>()
  
  const deleteDrinkOption = useCallback((id: string) => 
    operation.execute(() => drinkOptionsService.delete(id)), [operation])

  return { ...operation, deleteDrinkOption }
}

// Hook for bulk operations on drink options
export const useBulkUpsertDrinkOptions = () => {
  const operation = useAsyncOperation<void>()
  
  const bulkUpsert = useCallback((
    drinkId: string,
    optionCategoryIds: string[],
    defaultValues: Record<string, string>
  ) => 
    operation.execute(() => drinkOptionsService.bulkUpsert(drinkId, optionCategoryIds, defaultValues)), 
    [operation]
  )

  return { ...operation, bulkUpsert }
}