import { render, screen, fireEvent } from '../../../../tests/config/test-utils'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'

// Component variables
let GuestInfoForm: any

describe('GuestInfoForm', () => {
  const defaultProps = {
    guestName: '',
    onGuestNameChange: vi.fn(),
    specialRequest: '',
    onSpecialRequestChange: vi.fn(),
    isValid: true
  }

  const funnyNameProps = {
    ...defaultProps,
    isGeneratedName: true,
    onGenerateNewName: vi.fn(),
    onClearGeneratedName: vi.fn()
  }

  beforeAll(async () => {
    // Setup scoped mocks for this test file
    vi.doMock('lucide-react', () => ({
      RotateCcw: () => <div data-testid="rotate-ccw-icon" />
    }))

    // Import component after mocking
    const guestInfoFormModule = await import('../GuestInfoForm')
    GuestInfoForm = guestInfoFormModule.GuestInfoForm
  })

  afterAll(() => {
    vi.doUnmock('lucide-react')
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Guest Name Input', () => {
    it('should render guest name input field', () => {
      render(<GuestInfoForm {...defaultProps} />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('type', 'text')
    })

    it('should display current guest name value', () => {
      render(<GuestInfoForm {...defaultProps} guestName="John Doe" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveValue('John Doe')
    })

    it('should call onGuestNameChange when user types', () => {
      const mockChange = vi.fn()
      render(<GuestInfoForm {...defaultProps} onGuestNameChange={mockChange} />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })
      
      expect(mockChange).toHaveBeenCalledWith('Jane Smith')
    })

    it('should show error message when provided', () => {
      render(<GuestInfoForm {...defaultProps} error="Name is required" />)
      
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  describe('Special Request Input', () => {
    it('should render special request textarea', () => {
      render(<GuestInfoForm {...defaultProps} />)
      
      const textarea = screen.getByLabelText(/special request/i)
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('should display current special request value', () => {
      render(<GuestInfoForm {...defaultProps} specialRequest="Extra hot please" />)
      
      const textarea = screen.getByLabelText(/special request/i)
      expect(textarea).toHaveValue('Extra hot please')
    })

    it('should call onSpecialRequestChange when user types', () => {
      const mockChange = vi.fn()
      render(<GuestInfoForm {...defaultProps} onSpecialRequestChange={mockChange} />)
      
      const textarea = screen.getByLabelText(/special request/i)
      fireEvent.change(textarea, { target: { value: 'No foam please' } })
      
      expect(mockChange).toHaveBeenCalledWith('No foam please')
    })

    it('should have maxLength attribute of 500', () => {
      render(<GuestInfoForm {...defaultProps} />)
      
      const textarea = screen.getByLabelText(/special request/i)
      expect(textarea).toHaveAttribute('maxLength', '500')
    })

    it('should show character count', () => {
      render(<GuestInfoForm {...defaultProps} specialRequest="Extra hot" />)
      
      expect(screen.getByText('491 characters remaining')).toBeInTheDocument()
    })

    it('should show character count approaching limit with warning color', () => {
      const longText = 'a'.repeat(451) // 49 characters remaining
      render(<GuestInfoForm {...defaultProps} specialRequest={longText} />)
      
      const charCount = screen.getByText('49 characters remaining')
      expect(charCount).toBeInTheDocument()
      expect(charCount).toHaveClass('text-amber-600')
    })

    it('should show character count at limit with warning color', () => {
      const maxText = 'a'.repeat(500)
      render(<GuestInfoForm {...defaultProps} specialRequest={maxText} />)
      
      const charCount = screen.getByText('0 characters remaining')
      expect(charCount).toBeInTheDocument()
      expect(charCount).toHaveClass('text-amber-600')
    })

    it('should be marked as optional in the label', () => {
      render(<GuestInfoForm {...defaultProps} />)
      
      expect(screen.getByText(/optional/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form controls', () => {
      render(<GuestInfoForm {...defaultProps} />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      const specialRequestTextarea = screen.getByLabelText(/special request/i)
      
      expect(nameInput).toHaveAccessibleName()
      expect(specialRequestTextarea).toHaveAccessibleName()
    })

    it('should have proper ARIA attributes for validation', () => {
      render(<GuestInfoForm {...defaultProps} isValid={false} error="Name is required" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    })

    it('should connect error message to input with aria-describedby', () => {
      render(<GuestInfoForm {...defaultProps} error="Name is required" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      const errorMessage = screen.getByText('Name is required')
      
      expect(nameInput).toHaveAttribute('aria-describedby')
      expect(errorMessage).toHaveAttribute('id')
    })
  })

  describe('Validation States', () => {
    it('should apply valid styling when isValid is true', () => {
      render(<GuestInfoForm {...defaultProps} guestName="John" isValid />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveClass('border-coffee-200')
    })

    it('should apply error styling when isValid is false and has text', () => {
      render(<GuestInfoForm {...defaultProps} guestName="John" isValid={false} error="Name is required" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveClass('border-red-300')
    })

    it('should apply generated name styling when isGeneratedName is true', () => {
      render(<GuestInfoForm {...funnyNameProps} guestName="Caffeinated Bean McBrew" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveClass('border-amber-300', 'bg-amber-25')
    })
  })

  describe('Funny Name Generation', () => {
    it('should show regenerate button when name is generated', () => {
      render(<GuestInfoForm {...funnyNameProps} guestName="Caffeinated Bean McBrew" />)
      
      const regenerateButton = screen.getByRole('button', { name: /generate new funny name/i })
      expect(regenerateButton).toBeInTheDocument()
    })

    it('should not show regenerate button when name is not generated', () => {
      render(<GuestInfoForm {...defaultProps} guestName="John Doe" />)
      
      const regenerateButton = screen.queryByRole('button', { name: /generate new funny name/i })
      expect(regenerateButton).not.toBeInTheDocument()
    })

    it('should call onGenerateNewName when regenerate button is clicked', () => {
      render(<GuestInfoForm {...funnyNameProps} guestName="Caffeinated Bean McBrew" />)
      
      const regenerateButton = screen.getByRole('button', { name: /generate new funny name/i })
      fireEvent.click(regenerateButton)
      
      expect(funnyNameProps.onGenerateNewName).toHaveBeenCalledTimes(1)
    })

    it('should call onClearGeneratedName when generated name input is focused', () => {
      render(<GuestInfoForm {...funnyNameProps} guestName="Caffeinated Bean McBrew" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      fireEvent.focus(nameInput)
      
      expect(funnyNameProps.onClearGeneratedName).toHaveBeenCalledTimes(1)
    })

    it('should not call onClearGeneratedName when user-entered name is focused', () => {
      render(<GuestInfoForm {...defaultProps} guestName="John Doe" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      fireEvent.focus(nameInput)
      
      // onClearGeneratedName should not be called since it's not provided
      expect(defaultProps.onGuestNameChange).not.toHaveBeenCalledWith('')
    })

    it('should show different placeholder for generated names', () => {
      render(<GuestInfoForm {...funnyNameProps} guestName="Caffeinated Bean McBrew" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveAttribute('placeholder', 'Click to enter your own name...')
    })

    it('should show normal placeholder for user-entered names', () => {
      render(<GuestInfoForm {...defaultProps} guestName="John Doe" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveAttribute('placeholder', 'Enter your name for the order')
    })

    it('should show different helper text for generated names', () => {
      render(<GuestInfoForm {...funnyNameProps} guestName="Caffeinated Bean McBrew" />)
      
      expect(screen.getByText(/we've given you a fun coffee name/i)).toBeInTheDocument()
    })

    it('should show normal helper text for user-entered names', () => {
      render(<GuestInfoForm {...defaultProps} guestName="John Doe" />)
      
      expect(screen.getByText(/we'll call your name when your order is ready/i)).toBeInTheDocument()
    })

    it('should handle onGenerateNewName being undefined', () => {
      const { onGenerateNewName: _, ...propsWithoutGenerate } = funnyNameProps
      render(<GuestInfoForm {...propsWithoutGenerate} guestName="Caffeinated Bean McBrew" />)
      
      // Should not show regenerate button if onGenerateNewName is not provided
      const regenerateButton = screen.queryByRole('button', { name: /generate new funny name/i })
      expect(regenerateButton).not.toBeInTheDocument()
    })

    it('should handle onClearGeneratedName being undefined', () => {
      const { onClearGeneratedName: _, ...propsWithoutClear } = funnyNameProps
      render(<GuestInfoForm {...propsWithoutClear} guestName="Caffeinated Bean McBrew" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      
      // Should not throw error when focusing
      expect(() => {
        fireEvent.focus(nameInput)
      }).not.toThrow()
    })

    it('should adjust input padding when regenerate button is present', () => {
      render(<GuestInfoForm {...funnyNameProps} guestName="Caffeinated Bean McBrew" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveClass('pr-20') // More padding for regenerate button
    })

    it('should use normal padding when regenerate button is not present', () => {
      render(<GuestInfoForm {...defaultProps} guestName="John Doe" />)
      
      const nameInput = screen.getByLabelText(/your name/i)
      expect(nameInput).toHaveClass('pr-16') // Normal padding
    })
  })
})