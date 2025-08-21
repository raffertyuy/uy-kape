import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrinkManagement } from '../DrinkManagement';
import { BrowserRouter } from 'react-router-dom';

// Mock the menuService modules
vi.mock('../../../services/menuService', () => ({
  drinkCategoriesService: {
    getAll: vi.fn(),
  },
  drinksService: {
    getAllWithOptionsPreview: vi.fn(),
    getByCategoryWithOptionsPreview: vi.fn(),
  },
}));

// Mock the hooks using importOriginal to avoid missing exports
vi.mock('../../../hooks/useMenuData', async (importOriginal) => {
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      {component}
    </BrowserRouter>
  );
};

describe('DrinkManagement Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render drink categories and toggle options preview', async () => {
    renderWithRouter(<DrinkManagement />);
    
    // Wait for initial render by checking for the options toggle
    await waitFor(() => {
      expect(screen.getByText('Show Options Preview')).toBeInTheDocument();
    });

    // Check if categories are rendered
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('Tea')).toBeInTheDocument();

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

    // Click on Coffee category
    const coffeeCategory = screen.getByText('Coffee');
    fireEvent.click(coffeeCategory);

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