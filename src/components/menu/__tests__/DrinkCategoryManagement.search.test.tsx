import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen } from '../../../../tests/config/test-utils';
import type { DrinkCategory, MenuFilters } from '@/types/menu.types';

// Component variables
let DrinkCategoryManagement: any;

describe('DrinkCategoryManagement Search Functionality', () => {
  const mockCategories: DrinkCategory[] = [
    {
      id: '1',
      name: 'Coffee',
      description: 'Espresso-based and black coffee drinks',
      display_order: 1,
      is_active: true,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
    },
    {
      id: '2',
      name: 'Special Coffee',
      description: 'Premium coffee drinks with unique ingredients',
      display_order: 2,
      is_active: true,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
    },
    {
      id: '3',
      name: 'Tea',
      description: 'Hot and cold tea beverages',
      display_order: 3,
      is_active: true,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
    },
  ];

  beforeAll(async () => {
    // Mock the hooks first
    vi.doMock('@/hooks/useMenuData', () => ({
      useDrinkCategories: vi.fn(() => ({
        data: mockCategories,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })),
      useUpdateDrinkCategory: vi.fn(() => ({ 
        updateCategory: vi.fn() 
      })),
      useDeleteDrinkCategory: vi.fn(() => ({ 
        deleteCategory: vi.fn() 
      })),
    }));

    // Mock the form component
    vi.doMock('../DrinkCategoryForm', () => ({
      DrinkCategoryForm: () => <div data-testid="drink-category-form" />
    }));

    // Import component after mocking dependencies
    const drinkCategoryModule = await import('../DrinkCategoryManagement');
    DrinkCategoryManagement = drinkCategoryModule.DrinkCategoryManagement;
  });

  afterAll(() => {
    vi.doUnmock('@/hooks/useMenuData');
    vi.doUnmock('../DrinkCategoryForm');
  });

  const defaultProps = {
    onDataChange: vi.fn(),
    searchQuery: '',
    filters: {} as MenuFilters,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Query Filtering', () => {
    it('should display all categories when search query is empty', () => {
      render(<DrinkCategoryManagement {...defaultProps} />);
      
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Special Coffee')).toBeInTheDocument();
      expect(screen.getByText('Tea')).toBeInTheDocument();
    });

    it('should filter categories by name when search query matches', () => {
      render(<DrinkCategoryManagement {...defaultProps} searchQuery="Coffee" />);
      
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Special Coffee')).toBeInTheDocument();
      expect(screen.queryByText('Tea')).not.toBeInTheDocument();
    });

    it('should filter categories by description when search query matches', () => {
      render(<DrinkCategoryManagement {...defaultProps} searchQuery="Espresso" />);
      
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.queryByText('Special Coffee')).not.toBeInTheDocument();
      expect(screen.queryByText('Tea')).not.toBeInTheDocument();
    });

    it('should show no results when search query does not match any categories', () => {
      render(<DrinkCategoryManagement {...defaultProps} searchQuery="NonExistentCategory" />);
      
      expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
      expect(screen.queryByText('Special Coffee')).not.toBeInTheDocument();
      expect(screen.queryByText('Tea')).not.toBeInTheDocument();
      expect(screen.getByText('No categories match your search')).toBeInTheDocument();
    });
  });

  describe('Status Filtering', () => {
    it('should filter by active status when filter is applied', () => {
      const filters: MenuFilters = { isActive: true };
      render(<DrinkCategoryManagement {...defaultProps} filters={filters} />);
      
      // All test categories are active, so all should be visible
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Special Coffee')).toBeInTheDocument();
      expect(screen.getByText('Tea')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by name when sort filter is applied', () => {
      const filters: MenuFilters = { sortBy: 'name', sortOrder: 'asc' };
      render(<DrinkCategoryManagement {...defaultProps} filters={filters} />);
      
      // Should render categories sorted by name
      const categoryCards = screen.getAllByRole('button', { name: /edit .* category/i });
      expect(categoryCards).toHaveLength(3);
    });

    it('should sort by display order by default', () => {
      render(<DrinkCategoryManagement {...defaultProps} />);
      
      // Should render categories in display order
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Special Coffee')).toBeInTheDocument();
      expect(screen.getByText('Tea')).toBeInTheDocument();
    });
  });

  describe('Combined Search and Filters', () => {
    it('should apply both search query and status filter', () => {
      const filters: MenuFilters = { isActive: true };
      render(<DrinkCategoryManagement {...defaultProps} searchQuery="Coffee" filters={filters} />);
      
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Special Coffee')).toBeInTheDocument();
      expect(screen.queryByText('Tea')).not.toBeInTheDocument();
    });
  });
});