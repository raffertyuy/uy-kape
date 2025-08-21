import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DrinkOptionsPreview } from '../DrinkOptionsPreview'
import type { DrinkOptionPreview } from '@/types/menu.types'

const mockOptions: DrinkOptionPreview[] = [
  {
    id: '1',
    option_category_name: 'Number of Shots',
    default_value_name: 'Single',
    is_required: false
  },
  {
    id: '2',
    option_category_name: 'Milk Type',
    default_value_name: 'Whole Milk',
    is_required: false
  },
  {
    id: '3',
    option_category_name: 'Temperature',
    default_value_name: 'Hot',
    is_required: false
  },
  {
    id: '4',
    option_category_name: 'Size',
    default_value_name: 'Medium',
    is_required: false
  }
]

describe('DrinkOptionsPreview', () => {
  it('renders empty state when no options provided', () => {
    render(<DrinkOptionsPreview options={[]} variant="grid" />)
    
    expect(screen.getByText('No options configured')).toBeInTheDocument()
  })

  it('renders empty state when options is undefined', () => {
    render(<DrinkOptionsPreview options={undefined as any} variant="grid" />)
    
    expect(screen.getByText('No options configured')).toBeInTheDocument()
  })

  it('renders options correctly in grid view', () => {
    render(<DrinkOptionsPreview options={mockOptions.slice(0, 2)} variant="grid" />)
    
    expect(screen.getByText('Number of Shots: Single')).toBeInTheDocument()
    expect(screen.getByText('Milk Type: Whole Milk')).toBeInTheDocument()
  })

  it('renders options correctly in list view', () => {
    render(<DrinkOptionsPreview options={mockOptions.slice(0, 2)} variant="list" />)
    
    expect(screen.getByText('Number of Shots:')).toBeInTheDocument()
    expect(screen.getByText('Single')).toBeInTheDocument()
    expect(screen.getByText('Milk Type:')).toBeInTheDocument()
    expect(screen.getByText('Whole Milk')).toBeInTheDocument()
  })

  it('handles null default values correctly', () => {
    const optionsWithNull: DrinkOptionPreview[] = [
      {
        id: '1',
        option_category_name: 'Special Option',
        default_value_name: null,
        is_required: false
      }
    ]

    render(<DrinkOptionsPreview options={optionsWithNull} variant="grid" />)
    
    expect(screen.getByText('Special Option: Not set')).toBeInTheDocument()
  })

  it('truncates long option lists and shows more indicator', () => {
    render(
      <DrinkOptionsPreview 
        options={mockOptions} 
        variant="grid" 
        maxDisplayOptions={2} 
      />
    )
    
    // Should show first 2 options
    expect(screen.getByText('Number of Shots: Single')).toBeInTheDocument()
    expect(screen.getByText('Milk Type: Whole Milk')).toBeInTheDocument()
    
    // Should not show the 3rd and 4th options
    expect(screen.queryByText(/Temperature:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Size:/)).not.toBeInTheDocument()
    
    // Should show "+2 more" indicator
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('does not show more indicator when all options fit', () => {
    render(
      <DrinkOptionsPreview 
        options={mockOptions.slice(0, 2)} 
        variant="grid" 
        maxDisplayOptions={3} 
      />
    )
    
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <DrinkOptionsPreview 
        options={mockOptions.slice(0, 1)} 
        variant="grid" 
        className="custom-class" 
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has proper accessibility attributes', () => {
    render(<DrinkOptionsPreview options={mockOptions.slice(0, 2)} variant="grid" />)
    
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('aria-label', 'Drink options (2 total)')
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
  })

  it('has proper accessibility for more indicator', () => {
    render(
      <DrinkOptionsPreview 
        options={mockOptions} 
        variant="grid" 
        maxDisplayOptions={2} 
      />
    )
    
    const moreIndicator = screen.getByLabelText('2 more options available')
    expect(moreIndicator).toBeInTheDocument()
  })

  it('renders different layouts for grid vs list variants', () => {
    const { rerender } = render(
      <DrinkOptionsPreview options={mockOptions.slice(0, 1)} variant="grid" />
    )
    
    let container = screen.getByRole('list')
    expect(container).toHaveClass('text-xs', 'space-y-1')
    
    rerender(<DrinkOptionsPreview options={mockOptions.slice(0, 1)} variant="list" />)
    
    container = screen.getByRole('list')
    expect(container).toHaveClass('text-xs', 'flex', 'flex-wrap', 'gap-2')
  })
})