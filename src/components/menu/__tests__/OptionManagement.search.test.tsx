import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen } from '../../../../tests/config/test-utils';
import type { OptionCategory, MenuFilters } from '@/types/menu.types';

// Component variables
let OptionCategoryList: any;

describe('OptionCategoryList Search Functionality', () => {
  const mockOptionCategories: OptionCategory[] = [
    {
      id: '1',
      name: 'Size',
      description: 'Choose your drink size',
      display_order: 1,
      is_required: true,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
    },
    {
      id: '2',
      name: 'Milk Type',
      description: 'Select your preferred milk type',
      display_order: 2,
      is_required: true,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
    },
    {
      id: '3',
      name: 'Extras',
      description: 'Add extra shots or flavors',
      display_order: 3,
      is_required: false,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
    },
  ];

  beforeAll(async () => {
    // Mock the hooks first
    vi.doMock('@/hooks/useMenuData', () => ({
      useOptionCategories: vi.fn(() => ({
        data: mockOptionCategories,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })),
      useCreateOptionCategory: vi.fn(() => ({ 
        createOptionCategory: vi.fn() 
      })),
      useUpdateOptionCategory: vi.fn(() => ({ 
        updateOptionCategory: vi.fn() 
      })),
      useDeleteOptionCategory: vi.fn(() => ({ 
        deleteOptionCategory: vi.fn() 
      })),
    }));

    // Mock the form components
    vi.doMock('../OptionCategoryForm', () => ({
      OptionCategoryForm: () => <div data-testid="option-category-form" />
    }));

    vi.doMock('../OptionValueForm', () => ({
      OptionValueForm: () => <div data-testid="option-value-form" />
    }));

    // Import component after mocking dependencies
    const optionListModule = await import('../OptionCategoryList');
    OptionCategoryList = optionListModule.OptionCategoryList;
  });

  afterAll(() => {
    vi.doUnmock('@/hooks/useMenuData');
    vi.doUnmock('../OptionCategoryForm');
    vi.doUnmock('../OptionValueForm');
  });

  const defaultProps = {
    categories: mockOptionCategories,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onReorder: vi.fn(),
    onDataChange: vi.fn(),
    isLoading: false,
    searchQuery: '',
    filters: {} as MenuFilters,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Query Filtering', () => {
    it('should display all option categories when search query is empty', () => {
      render(<OptionCategoryList {...defaultProps} />);
      
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Milk Type')).toBeInTheDocument();
      expect(screen.getByText('Extras')).toBeInTheDocument();
    });

    it('should filter option categories by name when search query matches', () => {
      render(<OptionCategoryList {...defaultProps} searchQuery="Size" />);
      
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.queryByText('Milk Type')).not.toBeInTheDocument();
      expect(screen.queryByText('Extras')).not.toBeInTheDocument();
    });

    it('should filter option categories by description when search query matches', () => {
      render(<OptionCategoryList {...defaultProps} searchQuery="preferred" />);
      
      expect(screen.queryByText('Size')).not.toBeInTheDocument();
      expect(screen.getByText('Milk Type')).toBeInTheDocument();
      expect(screen.queryByText('Extras')).not.toBeInTheDocument();
    });

    it('should show no results when search query does not match any categories', () => {
      render(<OptionCategoryList {...defaultProps} searchQuery="NonExistentOption" />);
      
      expect(screen.queryByText('Size')).not.toBeInTheDocument();
      expect(screen.queryByText('Milk Type')).not.toBeInTheDocument();
      expect(screen.queryByText('Extras')).not.toBeInTheDocument();
      expect(screen.getByText('No option categories match your current search and filter criteria.')).toBeInTheDocument();
    });
  });

  describe('Status Filtering', () => {
    it('should filter by required status when filter is applied', () => {
      const filters: MenuFilters = { status: 'required' };
      render(<OptionCategoryList {...defaultProps} filters={filters} />);
      
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Milk Type')).toBeInTheDocument();
      expect(screen.queryByText('Extras')).not.toBeInTheDocument();
    });

    it('should filter by optional status when filter is applied', () => {
      const filters: MenuFilters = { status: 'optional' };
      render(<OptionCategoryList {...defaultProps} filters={filters} />);
      
      expect(screen.queryByText('Size')).not.toBeInTheDocument();
      expect(screen.queryByText('Milk Type')).not.toBeInTheDocument();
      expect(screen.getByText('Extras')).toBeInTheDocument();
    });
  });

  describe('Combined Search and Filters', () => {
    it('should apply both search query and status filter', () => {
      const filters: MenuFilters = { status: 'required' };
      render(<OptionCategoryList {...defaultProps} searchQuery="Type" filters={filters} />);
      
      expect(screen.queryByText('Size')).not.toBeInTheDocument();
      expect(screen.getByText('Milk Type')).toBeInTheDocument();
      expect(screen.queryByText('Extras')).not.toBeInTheDocument();
    });
  });
});