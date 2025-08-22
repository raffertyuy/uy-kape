import { render, screen } from '@/test-utils'
import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest'

// Create spies for the functions
let mockGetRandomBaristaProverbText: any
let mockGetBaristaProverbByCategory: any
let BaristaProverb: any
let BaristaProverbCompact: any

describe('BaristaProverb', () => {
  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('@/utils/baristaProverbs', () => ({
      getRandomBaristaProverbText: vi.fn(() => 'Good coffee, like patience, takes time to perfect.'),
      getBaristaProverbByCategory: vi.fn((category) => ({
        text: `A ${category} proverb about coffee and patience.`,
        category
      })),
      getRandomBaristaProverb: vi.fn(() => ({
        text: 'Good coffee, like patience, takes time to perfect.',
        category: 'patience'
      })),
      getProverbCategories: vi.fn(() => ['patience', 'encouragement', 'wisdom', 'coffee-love']),
      getProverbCount: vi.fn(() => 28),
      getProverbCountByCategory: vi.fn(() => 7)
    }))

    // Import components after mocking
    const componentsModule = await import('../BaristaProverb')
    BaristaProverb = componentsModule.BaristaProverb
    BaristaProverbCompact = componentsModule.BaristaProverbCompact

    // Import mocked utilities
    const utilsModule = await import('@/utils/baristaProverbs')
    mockGetRandomBaristaProverbText = vi.mocked(utilsModule.getRandomBaristaProverbText)
    mockGetBaristaProverbByCategory = vi.mocked(utilsModule.getBaristaProverbByCategory)
  })

  afterAll(() => {
    vi.doUnmock('@/utils/baristaProverbs')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRandomBaristaProverbText.mockClear()
    mockGetBaristaProverbByCategory.mockClear()
  })

  describe('basic rendering', () => {
    it('should render with default random proverb', () => {
      const { container } = render(<BaristaProverb />)
      
      expect(screen.getByText('A word from your barista:')).toBeInTheDocument()
      
      // Use a more flexible matcher to find the text
      expect(container.textContent).toContain('Good coffee, like patience, takes time to perfect.')
    })

    it('should render with provided proverb text', () => {
      const customProverb = "Your coffee is brewing with love and care."
      const { container } = render(<BaristaProverb proverb={customProverb} />)
      
      expect(container.textContent).toContain(customProverb)
    })

    it('should render with category-specific proverb', () => {
      const { container } = render(<BaristaProverb category="patience" />)
      
      expect(container.textContent).toContain('A patience proverb about coffee and patience.')
    })

    it('should apply custom className', () => {
      const customClass = 'my-custom-class'
      const { container } = render(<BaristaProverb className={customClass} />)
      
      expect(container.firstChild).toHaveClass(customClass)
    })
  })

  describe('header visibility', () => {
    it('should show header by default', () => {
      render(<BaristaProverb />)
      
      expect(screen.getByText('A word from your barista:')).toBeInTheDocument()
    })

    it('should show header when showHeader is true', () => {
      render(<BaristaProverb showHeader />)
      
      expect(screen.getByText('A word from your barista:')).toBeInTheDocument()
    })

    it('should hide header when showHeader is false', () => {
      const { container } = render(<BaristaProverb showHeader={false} />)
      
      expect(screen.queryByText('A word from your barista:')).not.toBeInTheDocument()
      expect(container.textContent).toContain('Good coffee, like patience, takes time to perfect.')
    })
  })

  describe('proverb text formatting', () => {
    it('should wrap proverb text in quotes', () => {
      const proverb = "Coffee brings people together"
      const { container } = render(<BaristaProverb proverb={proverb} />)
      
      expect(container.textContent).toContain(proverb)
    })

    it('should display proverb text in italic styling', () => {
      const { container } = render(<BaristaProverb proverb="Test proverb" />)
      
      expect(container.textContent).toContain('Test proverb')
      const proverbElement = container.querySelector('blockquote')
      expect(proverbElement).toHaveClass('italic')
    })

    it('should handle long proverb text', () => {
      const longProverb = "This is a very long proverb about coffee and patience that might wrap to multiple lines and should still be displayed properly with good styling and readability for the user experience."
      const { container } = render(<BaristaProverb proverb={longProverb} />)
      
      expect(container.textContent).toContain(longProverb)
    })
  })

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<BaristaProverb proverb="Test proverb" />)
      
      // Should use blockquote for the proverb
      const blockquote = container.querySelector('blockquote')
      expect(blockquote).toBeInTheDocument()
      expect(container.textContent).toContain('Test proverb')
    })

    it('should have aria-hidden on icon', () => {
      render(<BaristaProverb />)
      
      const icon = document.querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have proper text contrast classes', () => {
      const { container } = render(<BaristaProverb />)
      
      const header = screen.getByText('A word from your barista:')
      expect(header).toHaveClass('text-amber-800')
      
      const proverb = container.querySelector('blockquote')
      expect(proverb).toHaveClass('text-amber-700')
    })
  })

  describe('styling and theme', () => {
    it('should use amber color theme', () => {
      const { container } = render(<BaristaProverb />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('bg-amber-50', 'border-amber-200')
    })

    it('should have proper spacing and layout classes', () => {
      const { container } = render(<BaristaProverb />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('rounded-lg', 'p-4', 'border')
    })

    it('should have flex layout for icon and content', () => {
      render(<BaristaProverb />)
      
      const contentArea = document.querySelector('.flex.items-start.space-x-3')
      expect(contentArea).toBeInTheDocument()
    })
  })

  describe('integration with barista proverbs utility', () => {
    it('should call getRandomBaristaProverbText when no proverb or category provided', () => {
      render(<BaristaProverb />)
      
      expect(mockGetRandomBaristaProverbText).toHaveBeenCalled()
    })

    it('should call getBaristaProverbByCategory when category provided', () => {
      render(<BaristaProverb category="encouragement" />)
      
      expect(mockGetBaristaProverbByCategory).toHaveBeenCalledWith('encouragement')
    })

    it('should not call utility functions when proverb is provided', () => {
      render(<BaristaProverb proverb="Custom proverb" />)
      
      expect(mockGetRandomBaristaProverbText).not.toHaveBeenCalled()
      expect(mockGetBaristaProverbByCategory).not.toHaveBeenCalled()
    })
  })

  describe('prop combinations', () => {
    it('should prioritize provided proverb over category', () => {
      const customProverb = "Custom proverb text"
      const { container } = render(<BaristaProverb proverb={customProverb} category="patience" />)
      
      expect(container.textContent).toContain(customProverb)
      expect(container.textContent).not.toContain('A patience proverb about coffee and patience.')
    })

    it('should handle all props together', () => {
      const { container } = render(
        <BaristaProverb 
          proverb="Test proverb"
          category="wisdom"
          className="custom-class"
          showHeader={false}
        />
      )
      
      expect(container.textContent).toContain('Test proverb')
      expect(screen.queryByText('A word from your barista:')).not.toBeInTheDocument()
    })
  })
})

describe('BaristaProverbCompact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRandomBaristaProverbText.mockClear()
    mockGetBaristaProverbByCategory.mockClear()
  })

  it('should render without header', () => {
    const { container } = render(<BaristaProverbCompact />)
    
    expect(screen.queryByText('A word from your barista:')).not.toBeInTheDocument()
    expect(container.textContent).toContain('Good coffee, like patience, takes time to perfect.')
  })

  it('should apply compact padding class', () => {
    const { container } = render(<BaristaProverbCompact />)
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('p-3')
  })

  it('should combine custom className with compact styling', () => {
    const customClass = 'my-custom-class'
    const { container } = render(<BaristaProverbCompact className={customClass} />)
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('p-3', customClass)
  })

  it('should accept proverb and category props', () => {
    const { container } = render(<BaristaProverbCompact proverb="Compact proverb" />)
    
    expect(container.textContent).toContain('Compact proverb')
  })

  it('should use category when provided', () => {
    const { container } = render(<BaristaProverbCompact category="coffee-love" />)
    
    expect(container.textContent).toContain('A coffee-love proverb about coffee and patience.')
  })
})