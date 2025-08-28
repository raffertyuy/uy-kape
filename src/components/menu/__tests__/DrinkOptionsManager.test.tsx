import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../../tests/config/test-utils'
import type { DrinkWithOptionsAndCategory, OptionCategoryWithValues } from '@/types/menu.types'

// Component variables
let DrinkOptionsManager: any

describe('DrinkOptionsManager', () => {
  // Mock functions
  const mockOnClose = vi.fn()
  const mockRefetchDrink = vi.fn()
  const mockCreateDrinkOption = vi.fn().mockResolvedValue({ 
    id: 'new-option-id',
    drink_id: 'drink-1',
    option_category_id: 'temperature',
    default_option_value_id: null
  })
  const mockUpdateDrinkOption = vi.fn().mockResolvedValue({ 
    id: 'updated-option-id',
    drink_id: 'drink-1',
    option_category_id: 'temperature',
    default_option_value_id: 'hot'
  })
  const mockDeleteDrinkOption = vi.fn().mockResolvedValue(undefined)

  // Mock data
  const mockDrinkWithOptions: DrinkWithOptionsAndCategory = {
    id: 'drink-1',
    name: 'Espresso',
    description: 'Pure espresso shot',
    category_id: 'coffee',
    is_active: true,
    display_order: 1,
    preparation_time_minutes: 3,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    drink_options: [
      {
        id: 'option-1',
        drink_id: 'drink-1',
        option_category_id: 'shots',
        default_option_value_id: 'single',
        created_at: '2025-01-01T00:00:00Z',
        option_category: {
          id: 'shots',
          name: 'Number of Shots',
          description: 'Espresso shot quantity',
          is_required: false,
          display_order: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        default_value: {
          id: 'single',
          name: 'Single',
          description: null,
          is_active: true,
          display_order: 1,
          option_category_id: 'shots',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      }
    ],
    category: {
      id: 'coffee',
      name: 'Coffee',
      description: 'Coffee drinks',
      is_active: true,
      display_order: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  }

  const mockOptionCategories: OptionCategoryWithValues[] = [
    {
      id: 'shots',
      name: 'Number of Shots',
      description: 'Espresso shot quantity',
      is_required: false,
      display_order: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      option_values: [
        {
          id: 'single',
          name: 'Single',
          description: null,
          is_active: true,
          display_order: 1,
          option_category_id: 'shots',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'double',
          name: 'Double',
          description: null,
          is_active: true,
          display_order: 2,
          option_category_id: 'shots',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ]
    },
    {
      id: 'temperature',
      name: 'Temperature',
      description: 'Hot or cold serving',
      is_required: false,
      display_order: 2,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      option_values: [
        {
          id: 'hot',
          name: 'Hot',
          description: null,
          is_active: true,
          display_order: 1,
          option_category_id: 'temperature',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'cold',
          name: 'Cold',
          description: null,
          is_active: true,
          display_order: 2,
          option_category_id: 'temperature',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ]
    }
  ]

  beforeAll(async () => {
    // Mock the hooks
    vi.doMock('../../../hooks/useMenuData', async (importOriginal) => {
      const actual = await importOriginal() as any
      return {
        ...actual,
        useDrinkWithOptions: vi.fn(() => ({
          data: mockDrinkWithOptions,
          isLoading: false,
          error: null,
          refetch: mockRefetchDrink
        })),
        useOptionCategoriesWithValues: vi.fn(() => ({
          data: mockOptionCategories,
          isLoading: false,
          error: null
        })),
        useCreateDrinkOption: vi.fn(() => ({
          createDrinkOption: mockCreateDrinkOption
        })),
        useUpdateDrinkOption: vi.fn(() => ({
          updateDrinkOption: mockUpdateDrinkOption
        })),
        useDeleteDrinkOption: vi.fn(() => ({
          deleteDrinkOption: mockDeleteDrinkOption
        }))
      }
    })

    // Import component after mocking
    const componentModule = await import('../DrinkOptionsManager')
    DrinkOptionsManager = componentModule.DrinkOptionsManager
  })

  afterAll(() => {
    vi.doUnmock('../../../hooks/useMenuData')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset mock implementations after clearAllMocks
    mockCreateDrinkOption.mockResolvedValue({ 
      id: 'new-option-id',
      drink_id: 'drink-1',
      option_category_id: 'temperature',
      default_option_value_id: null
    })
    mockUpdateDrinkOption.mockResolvedValue({ 
      id: 'updated-option-id',
      drink_id: 'drink-1',
      option_category_id: 'temperature',
      default_option_value_id: 'hot'
    })
    mockDeleteDrinkOption.mockResolvedValue(undefined)
  })

  describe('Basic Rendering', () => {
    it('renders the modal with drink name and options', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      // Check for modal title
      expect(screen.getByText('Configure Options for "Espresso"')).toBeInTheDocument()
      
      // Check for option categories
      await waitFor(() => {
        expect(screen.getByText('Number of Shots')).toBeInTheDocument()
        expect(screen.getByText('Temperature')).toBeInTheDocument()
      })

      // Check for action buttons (use getAllByRole to handle multiple close buttons)
      const closeButtons = screen.getAllByRole('button', { name: /close/i })
      expect(closeButtons.length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('shows loading state while data is being fetched', async () => {
      // Mock loading state
      vi.doMock('../../../hooks/useMenuData', async (importOriginal) => {
        const actual = await importOriginal() as any
        return {
          ...actual,
          useDrinkWithOptions: vi.fn(() => ({
            data: null,
            isLoading: true,
            error: null,
            refetch: mockRefetchDrink
          })),
          useOptionCategoriesWithValues: vi.fn(() => ({
            data: null,
            isLoading: true,
            error: null
          })),
          useCreateDrinkOption: vi.fn(() => ({
            createDrinkOption: mockCreateDrinkOption
          })),
          useUpdateDrinkOption: vi.fn(() => ({
            updateDrinkOption: mockUpdateDrinkOption
          })),
          useDeleteDrinkOption: vi.fn(() => ({
            deleteDrinkOption: mockDeleteDrinkOption
          }))
        }
      })

      // Re-import component with loading state
      const componentModule = await import('../DrinkOptionsManager')
      const LoadingDrinkOptionsManager = componentModule.DrinkOptionsManager

      render(
        <LoadingDrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Loading drink options...')).toBeInTheDocument()
    })
  })

  describe('Option Configuration', () => {
    it('displays existing drink options as checked', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      await waitFor(() => {
        // The Number of Shots option should be checked (exists in mockDrinkWithOptions)
        const shotsCheckbox = screen.getByRole('checkbox', { name: /number of shots/i })
        expect(shotsCheckbox).toBeChecked()

        // The Temperature option should not be checked (doesn't exist in mockDrinkWithOptions)
        const temperatureCheckbox = screen.getByRole('checkbox', { name: /temperature/i })
        expect(temperatureCheckbox).not.toBeChecked()
      })
    })

    it('shows default values for enabled options', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      await waitFor(() => {
        // Should show the default value dropdown for Number of Shots
        const defaultSelect = screen.getByDisplayValue('Single')
        expect(defaultSelect).toBeInTheDocument()
      })
    })

    it('allows toggling option categories', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      await waitFor(() => {
        const temperatureCheckbox = screen.getByRole('checkbox', { name: /temperature/i })
        expect(temperatureCheckbox).not.toBeChecked()
        
        // Click to enable Temperature option
        fireEvent.click(temperatureCheckbox)
        
        expect(mockCreateDrinkOption).toHaveBeenCalledWith({
          drink_id: 'drink-1',
          option_category_id: 'temperature',
          default_option_value_id: null
        })
      })
    })
  })

  describe('Modal Close Behavior (Fixed Issue)', () => {
    it('calls onClose when close button is clicked', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      const closeButtons = screen.getAllByRole('button', { name: /close/i })
      fireEvent.click(closeButtons[0]) // Click the first close button

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose after successful save changes', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      // Verify that saving state is set
      expect(screen.getByText(/saving/i)).toBeInTheDocument()

      // Wait for the save operation to complete
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }, { timeout: 1000 })
    })

    it('shows saving state during save operation', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      // Check that the button shows saving state
      expect(screen.getByText(/saving/i)).toBeInTheDocument()
    })

    it('disables save button during save operation', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      // The save button should be disabled during save operation
      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles errors when updating option default values', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUpdateDrinkOption.mockRejectedValueOnce(new Error('Update failed'))

      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      await waitFor(() => {
        const defaultSelect = screen.getByDisplayValue('Single')
        fireEvent.change(defaultSelect, { target: { value: 'double' } })
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error updating option:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('handles errors when creating new drink options', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockCreateDrinkOption.mockRejectedValueOnce(new Error('Create failed'))

      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      await waitFor(() => {
        const temperatureCheckbox = screen.getByRole('checkbox', { name: /temperature/i })
        fireEvent.click(temperatureCheckbox)
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error toggling option:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: /configure options for "espresso"/i })).toBeInTheDocument()

      // Check for proper checkbox roles
      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /number of shots/i })).toBeInTheDocument()
        expect(screen.getByRole('checkbox', { name: /temperature/i })).toBeInTheDocument()
      })

      // Check for proper button roles (use getAllByRole for multiple close buttons)
      const closeButtons = screen.getAllByRole('button', { name: /close/i })
      expect(closeButtons.length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(
        <DrinkOptionsManager
          drinkId="drink-1"
          drinkName="Espresso"
          onClose={mockOnClose}
        />
      )

      const closeButtons = screen.getAllByRole('button', { name: /close/i })
      const closeButton = closeButtons[0]
      
      // Test that the close button can receive focus (basic accessibility)
      closeButton.focus()
      expect(closeButton).toHaveFocus()
      
      // Test that checkboxes can receive focus
      await waitFor(() => {
        const shotsCheckbox = screen.getByRole('checkbox', { name: /number of shots/i })
        shotsCheckbox.focus()
        expect(shotsCheckbox).toHaveFocus()
      })
    })
  })
})