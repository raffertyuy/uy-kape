import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '../../../../tests/config/test-utils'

let ToggleSwitch: any

describe('ToggleSwitch', () => {
  beforeAll(async () => {
    // Import component after setup
    const toggleModule = await import('../ToggleSwitch')
    ToggleSwitch = toggleModule.ToggleSwitch
  })

  const defaultProps = {
    id: 'test-toggle',
    checked: false,
    onChange: vi.fn(),
    label: 'Test Toggle'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      expect(screen.getByRole('switch')).toBeInTheDocument()
      expect(screen.getByText('Test Toggle')).toBeInTheDocument()
    })

    it('renders with description when provided', () => {
      render(
        <ToggleSwitch 
          {...defaultProps} 
          description="This is a test toggle"
        />
      )
      
      expect(screen.getByText('This is a test toggle')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <ToggleSwitch 
          {...defaultProps} 
          className="custom-class"
        />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('State Management', () => {
    it('reflects checked state correctly', () => {
      render(<ToggleSwitch {...defaultProps} checked />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'true')
      expect(toggle).toHaveClass('bg-coffee-600')
    })

    it('reflects unchecked state correctly', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')
      expect(toggle).toHaveClass('bg-gray-200')
    })

    it('calls onChange when clicked', () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch {...defaultProps} onChange={handleChange} />)
      
      fireEvent.click(screen.getByRole('switch'))
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('calls onChange with opposite value when clicked', () => {
      const handleChange = vi.fn()
      render(
        <ToggleSwitch 
          {...defaultProps} 
          checked
          onChange={handleChange} 
        />
      )
      
      fireEvent.click(screen.getByRole('switch'))
      expect(handleChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Keyboard Interaction', () => {
    it('toggles on Space key press', () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch {...defaultProps} onChange={handleChange} />)
      
      const toggle = screen.getByRole('switch')
      fireEvent.keyDown(toggle, { key: ' ' })
      
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('toggles on Enter key press', () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch {...defaultProps} onChange={handleChange} />)
      
      const toggle = screen.getByRole('switch')
      fireEvent.keyDown(toggle, { key: 'Enter' })
      
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('does not toggle on other key presses', () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch {...defaultProps} onChange={handleChange} />)
      
      const toggle = screen.getByRole('switch')
      fireEvent.keyDown(toggle, { key: 'Tab' })
      
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('renders as disabled when disabled prop is true', () => {
      render(<ToggleSwitch {...defaultProps} disabled />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeDisabled()
      expect(toggle).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('does not call onChange when disabled and clicked', () => {
      const handleChange = vi.fn()
      render(
        <ToggleSwitch 
          {...defaultProps} 
          disabled
          onChange={handleChange} 
        />
      )
      
      fireEvent.click(screen.getByRole('switch'))
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('does not call onChange when disabled and key pressed', () => {
      const handleChange = vi.fn()
      render(
        <ToggleSwitch 
          {...defaultProps} 
          disabled
          onChange={handleChange} 
        />
      )
      
      const toggle = screen.getByRole('switch')
      fireEvent.keyDown(toggle, { key: ' ' })
      
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('applies disabled styling to label and description', () => {
      render(
        <ToggleSwitch 
          {...defaultProps} 
          disabled
          description="Test description" 
        />
      )
      
      expect(screen.getByText('Test Toggle')).toHaveClass('text-gray-400')
      expect(screen.getByText('Test description')).toHaveClass('text-gray-400')
    })
  })

  describe('Size Variants', () => {
    it('applies small size classes', () => {
      render(<ToggleSwitch {...defaultProps} size="sm" />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('h-4', 'w-7')
    })

    it('applies medium size classes (default)', () => {
      render(<ToggleSwitch {...defaultProps} size="md" />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('h-6', 'w-11')
    })

    it('applies large size classes', () => {
      render(<ToggleSwitch {...defaultProps} size="lg" />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('h-8', 'w-14')
    })

    it('uses medium size as default', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('h-6', 'w-11')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')
      expect(toggle).toHaveAttribute('aria-labelledby', 'test-toggle')
    })

    it('links to description with aria-describedby when description provided', () => {
      render(
        <ToggleSwitch 
          {...defaultProps} 
          description="Toggle description" 
        />
      )
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-describedby', 'test-toggle-description')
    })

    it('does not have aria-describedby when no description', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).not.toHaveAttribute('aria-describedby')
    })

    it('label is associated with toggle', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      const label = screen.getByText('Test Toggle')
      expect(label).toHaveAttribute('for', 'test-toggle')
    })
  })

  describe('Focus Management', () => {
    it('can receive focus', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      const toggle = screen.getByRole('switch')
      toggle.focus()
      
      expect(toggle).toHaveFocus()
    })

    it('has focus ring classes', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('focus:ring-2', 'focus:ring-coffee-500', 'focus:ring-offset-2')
    })
  })
})