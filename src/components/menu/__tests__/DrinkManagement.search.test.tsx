import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen } from '../../../../tests/config/test-utils';
import type { DrinkWithOptionsPreview } from '@/types/menu.types';

// Component variables
let DrinkList: any;

describe('DrinkList Search Functionality', () => {
  const mockDrinks: DrinkWithOptionsPreview[] = [
    {
      id: '1',
      name: 'Americano',
      description: 'Strong black coffee',
      category_id: 'cat-1',
      display_order: 1,
      is_active: true,
      preparation_time_minutes: 3,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
      category: {
        id: 'cat-1',
        name: 'Coffee',
        description: 'Coffee drinks',
        display_order: 1,
        is_active: true,
        created_at: '2025-08-24T00:00:00Z',
        updated_at: '2025-08-24T00:00:00Z',
      },
      options_preview: [],
    },
    {
      id: '2',
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      category_id: 'cat-1',
      display_order: 2,
      is_active: true,
      preparation_time_minutes: 5,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
      category: {
        id: 'cat-1',
        name: 'Coffee',
        description: 'Coffee drinks',
        display_order: 1,
        is_active: true,
        created_at: '2025-08-24T00:00:00Z',
        updated_at: '2025-08-24T00:00:00Z',
      },
      options_preview: [],
    },
    {
      id: '3',
      name: 'Earl Grey Tea',
      description: 'Classic English breakfast tea',
      category_id: 'cat-2',
      display_order: 1,
      is_active: false,
      preparation_time_minutes: 4,
      created_at: '2025-08-24T00:00:00Z',
      updated_at: '2025-08-24T00:00:00Z',
      category: {
        id: 'cat-2',
        name: 'Tea',
        description: 'Tea beverages',
        display_order: 2,
        is_active: true,
        created_at: '2025-08-24T00:00:00Z',
        updated_at: '2025-08-24T00:00:00Z',
      },
      options_preview: [],
    },
  ];

  beforeAll(async () => {
    // Mock the form component
    vi.doMock('../DrinkForm', () => ({
      DrinkForm: () => <div data-testid="drink-form" />
    }));

    // Import component after mocking dependencies
    const drinkListModule = await import('../DrinkList');
    DrinkList = drinkListModule.DrinkList;
  });

  afterAll(() => {
    vi.doUnmock('../DrinkForm');
  });

  const defaultProps = {
    drinks: mockDrinks,
    categories: [
      {
        id: 'cat-1',
        name: 'Coffee',
        description: 'Coffee drinks',
        display_order: 1,
        is_active: true,
        created_at: '2025-08-24T00:00:00Z',
        updated_at: '2025-08-24T00:00:00Z',
      },
      {
        id: 'cat-2',
        name: 'Tea',
        description: 'Tea beverages',
        display_order: 2,
        is_active: true,
        created_at: '2025-08-24T00:00:00Z',
        updated_at: '2025-08-24T00:00:00Z',
      },
    ],
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onManageOptions: vi.fn(),
    onCategoryFilter: vi.fn(),
    onDataChange: vi.fn(),
    isLoading: false,
    searchQuery: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Query Filtering', () => {
    it('should display all drinks when search query is empty', () => {
      render(<DrinkList {...defaultProps} />);
      
      expect(screen.getByText('Americano')).toBeInTheDocument();
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
      expect(screen.getByText('Earl Grey Tea')).toBeInTheDocument();
    });

    it('should filter drinks by name when search query matches', () => {
      render(<DrinkList {...defaultProps} searchQuery="Americano" />);
      
      expect(screen.getByText('Americano')).toBeInTheDocument();
      expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument();
      expect(screen.queryByText('Earl Grey Tea')).not.toBeInTheDocument();
    });

    it('should filter drinks by description when search query matches', () => {
      render(<DrinkList {...defaultProps} searchQuery="steamed" />);
      
      expect(screen.queryByText('Americano')).not.toBeInTheDocument();
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
      expect(screen.queryByText('Earl Grey Tea')).not.toBeInTheDocument();
    });

    it('should filter drinks by name search correctly', () => {
      render(<DrinkList {...defaultProps} searchQuery="Americano" />);
      
      // Should only show drinks matching "Americano" in name or description
      expect(screen.getByText('Americano')).toBeInTheDocument();
      expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument();
      expect(screen.queryByText('Earl Grey Tea')).not.toBeInTheDocument();
    });

    it('should show no results when search query does not match any drinks', () => {
      render(<DrinkList {...defaultProps} searchQuery="NonExistentDrink" />);
      
      expect(screen.queryByText('Americano')).not.toBeInTheDocument();
      expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument();
      expect(screen.queryByText('Earl Grey Tea')).not.toBeInTheDocument();
      expect(screen.getByText('No drinks found')).toBeInTheDocument();
    });
  });

  describe('Status Filtering', () => {
    it('should filter by active status when selectedCategoryName is Coffee', () => {
      render(<DrinkList {...defaultProps} selectedCategoryName="Coffee" />);
      
      expect(screen.getByText('Americano')).toBeInTheDocument();
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
      expect(screen.queryByText('Earl Grey Tea')).not.toBeInTheDocument();
    });

    it('should filter by Tea category when selectedCategoryName is Tea', () => {
      render(<DrinkList {...defaultProps} selectedCategoryName="Tea" />);
      
      expect(screen.queryByText('Americano')).not.toBeInTheDocument();
      expect(screen.queryByText('Cappuccino')).not.toBeInTheDocument();
      expect(screen.getByText('Earl Grey Tea')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should filter by category name when selectedCategoryName is applied', () => {
      render(<DrinkList {...defaultProps} selectedCategoryName="Coffee" />);
      
      expect(screen.getByText('Americano')).toBeInTheDocument();
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
      expect(screen.queryByText('Earl Grey Tea')).not.toBeInTheDocument();
    });
  });

  describe('Combined Search and Filters', () => {
    it('should apply both search query and category filter', () => {
      render(<DrinkList {...defaultProps} searchQuery="Cappuccino" selectedCategoryName="Coffee" />);
      
      expect(screen.queryByText('Americano')).not.toBeInTheDocument();
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
      expect(screen.queryByText('Earl Grey Tea')).not.toBeInTheDocument();
    });

    it('should apply search query and category filter correctly', () => {
      render(<DrinkList {...defaultProps} searchQuery="ino" selectedCategoryName="Coffee" />);
      
      expect(screen.queryByText('Americano')).not.toBeInTheDocument();
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
      expect(screen.queryByText('Earl Grey Tea')).not.toBeInTheDocument();
    });
  });
});