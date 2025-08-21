import { render, screen, fireEvent } from '@/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GuestInfoForm } from '../GuestInfoForm'

describe('GuestInfoForm', () => {
  const defaultProps = {
    guestName: '',
    onGuestNameChange: vi.fn(),
    specialRequest: '',
    onSpecialRequestChange: vi.fn(),
    isValid: true
  }

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
  })
})