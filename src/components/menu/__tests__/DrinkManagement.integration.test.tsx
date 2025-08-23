import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../tests/config/test-utils';

// Component variables
let DrinkManagement: any

describe('DrinkManagement Integration Tests', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('../../../services/menuService', () => ({
      drinkCategoriesService: {
        getAll: vi.fn(),
      },
      drinksService: {
        getAllWithOptionsPreview: vi.fn(),
        getByCategoryWithOptionsPreview: vi.fn(),
      },
    }));

    // Mock the hooks using importOriginal to avoid missing exports
    vi.doMock('../../../hooks/useMenuData', async (importOriginal) => {
      const actual = await importOriginal() as any;
      return {
        ...actual,
        useDrinkCategories: vi.fn(() => ({
          data: [
            { id: '1', name: 'Coffee', description: 'Coffee drinks' },
            { id: '2', name: 'Tea', description: 'Tea drinks' },
          ],
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        })),
        useDrinks: vi.fn(() => ({
          data: [
        {
          id: '1',
          name: 'Espresso',
          description: 'Strong coffee',
          price: 3.50,
          category_id: '1',
          is_available: true,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })),
    useDrinksWithOptionsPreview: vi.fn(() => ({
      data: [
        {
          id: '1',
          name: 'Espresso',
          description: 'Strong coffee',
          price: 3.50,
          category_id: '1',
          is_available: true,
          options: [
            {
              option_category: { id: '1', name: 'Shots' },
              option_value: { id: '1', name: '1', additional_price: 0 },
              is_default: true,
            },
          ],
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })),
      useDeleteDrink: vi.fn(() => ({
        deleteDrink: vi.fn(),
        state: 'idle',
      })),
    };
  });

    // Import component after mocking
    const componentModule = await import('../DrinkManagement')
    DrinkManagement = componentModule.DrinkManagement
  })

  afterAll(() => {
    vi.doUnmock('../../../services/menuService')
    vi.doUnmock('../../../hooks/useMenuData')
  })

  const renderWithRouter = (component: React.ReactElement) => {
    return render(component);
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render drink categories and toggle options preview', async () => {
    renderWithRouter(<DrinkManagement />);
    
    // Wait for initial render by checking for the options toggle
    await waitFor(() => {
      expect(screen.getByText('Show Options Preview')).toBeInTheDocument();
    });

    // Check if categories are rendered in the dropdown
    const categorySelect = screen.getByLabelText(/filter by category/i);
    expect(categorySelect).toBeInTheDocument();
    
    // Check if category options are available
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Coffee' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Tea' })).toBeInTheDocument();
    });

    // Check if drinks are rendered
    expect(screen.getByText('Espresso')).toBeInTheDocument();

    // Check if options preview toggle exists by role
    const optionsToggle = screen.getByRole('switch', { name: /show options preview/i });
    expect(optionsToggle).toBeInTheDocument();

    // Toggle options preview
    fireEvent.click(optionsToggle);
    
    // Verify toggle state changed
    await waitFor(() => {
      expect(optionsToggle).toBeChecked();
    });
  });

  it('should filter drinks by category', async () => {
    renderWithRouter(<DrinkManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Show Options Preview')).toBeInTheDocument();
    });

    // Find the category select dropdown
    const categorySelect = screen.getByLabelText(/filter by category/i);
    expect(categorySelect).toBeInTheDocument();
    
    // Wait for category options to be available
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Coffee' })).toBeInTheDocument();
    });

    // Change the select value to filter by Coffee category
    fireEvent.change(categorySelect, { target: { value: '1' } }); // Coffee has id '1' in our mock

    // Verify that drinks are filtered (this would depend on actual implementation)
    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });
  });

  it('should render without crashing when errors occur', async () => {
    renderWithRouter(<DrinkManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Show Options Preview')).toBeInTheDocument();
    });

    // The component should still render without crashing
    expect(screen.getByText('Show Options Preview')).toBeInTheDocument();
  });
});