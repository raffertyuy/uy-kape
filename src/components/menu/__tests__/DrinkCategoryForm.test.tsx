import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { render, screen, waitFor, userEvent } from '../../../../tests/config/test-utils'

// Component variables
let DrinkCategoryForm: any

describe('DrinkCategoryForm', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('@/hooks/useMenuData', () => ({
      useDrinkCategories: vi.fn(() => ({
        data: [],
        isLoading: false
      })),
      useDrinksWithOptionsPreview: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      })),
      useCreateDrinkCategory: vi.fn(() => ({
        createCategory: vi.fn(),
        execute: vi.fn(),
        state: 'idle' as const
      })),
      useUpdateDrinkCategory: vi.fn(() => ({
        updateCategory: vi.fn(),
        execute: vi.fn(),
        state: 'idle' as const
      }))
    }))

    // Import component after mocking
    const componentModule = await import('@/components/menu/DrinkCategoryForm')
    DrinkCategoryForm = componentModule.DrinkCategoryForm
  })

  afterAll(() => {
    vi.doUnmock('@/hooks/useMenuData')
  })

  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel
  }

  const existingCategory = {
    id: '1',
    name: 'Coffee',
    description: 'Hot coffee drinks',
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders create form correctly', () => {
    render(<DrinkCategoryForm {...defaultProps} />)

    expect(screen.getByText('Add New Category')).toBeInTheDocument()
    expect(screen.getByLabelText(/category name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/display order/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/active/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create category/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders edit form correctly with initial data', () => {
    render(<DrinkCategoryForm {...defaultProps} category={existingCategory} />)

    expect(screen.getByText('Edit Category')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Coffee')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Hot coffee drinks')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { checked: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update category/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<DrinkCategoryForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /create category/i })
    
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/category name is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<DrinkCategoryForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    render(<DrinkCategoryForm {...defaultProps} />)

    const nameInput = screen.getByLabelText(/category name/i)
    expect(nameInput).toHaveAttribute('required')

    const submitButton = screen.getByRole('button', { name: /create category/i })
    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})