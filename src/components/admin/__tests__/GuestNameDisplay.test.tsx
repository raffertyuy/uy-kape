import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'
import { GuestNameDisplay, GuestNameH3 } from '../GuestNameDisplay'

// Mock window.innerWidth for mobile testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

describe('GuestNameDisplay', () => {
  beforeEach(() => {
    // Reset window width to desktop
    window.innerWidth = 1024
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any event listeners
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders guest name correctly', () => {
      render(<GuestNameDisplay guestName="John Doe" />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('John Doe')
    })

    it('applies custom className', () => {
      const { container } = render(
        <GuestNameDisplay guestName="John Doe" className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('applies custom textClassName', () => {
      render(
        <GuestNameDisplay 
          guestName="John Doe" 
          textClassName="text-blue-500 font-bold" 
        />
      )
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveClass('text-blue-500', 'font-bold')
    })

    it('applies maxWidth style when provided', () => {
      render(
        <GuestNameDisplay guestName="John Doe" maxWidth="200px" />
      )
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveStyle({ maxWidth: '200px' })
    })
  })

  describe('Truncation Behavior', () => {
    it('applies truncate class by default', () => {
      render(<GuestNameDisplay guestName="Very Long Guest Name That Should Be Truncated" />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveClass('truncate')
    })

    it('becomes interactive when text is overflowing on desktop', async () => {
      const { container } = render(<GuestNameDisplay guestName="Very Long Guest Name That Should Be Truncated" />)
      
      // Find the h3 element and simulate overflow
      const h3Element = container.querySelector('h3')
      if (h3Element) {
        Object.defineProperty(h3Element, 'scrollWidth', { value: 200, configurable: true })
        Object.defineProperty(h3Element, 'clientWidth', { value: 100, configurable: true })
        
        // Trigger a resize event to force re-check of overflow
        window.dispatchEvent(new Event('resize'))
        
        // Wait for the component to detect overflow and become interactive
        await waitFor(() => {
          const buttonElement = screen.queryByRole('button')
          expect(buttonElement).toBeInTheDocument()
        })
        
        const heading = screen.getByRole('button')
        expect(heading).toHaveClass('cursor-pointer')
        expect(heading).toHaveAttribute('tabIndex', '0')
        expect(heading).toHaveAttribute('aria-label', expect.stringContaining('Guest name:'))
      }
    })
  })

  describe('Mobile Behavior', () => {
    beforeEach(() => {
      // Set mobile width
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))
    })

    it('shows expansion indicator on mobile when overflowing', async () => {
      // Mock scrollWidth > clientWidth to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 100,
      })

      render(<GuestNameDisplay guestName="Very Long Guest Name" />)
      
      await waitFor(() => {
        expect(screen.getByText('+')).toBeInTheDocument()
      })
    })

    it('expands text when clicked on mobile', async () => {
      // Mock scrollWidth > clientWidth to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 100,
      })

      render(<GuestNameDisplay guestName="Very Long Guest Name" />)
      
      // When overflowing, the h3 element becomes interactive and gets role="button"
      const heading = screen.getByRole('button')
      
      // Initially should have truncate class
      expect(heading).toHaveClass('truncate')
      
      // Click to expand
      fireEvent.click(heading)
      
      await waitFor(() => {
        expect(heading).not.toHaveClass('truncate')
        expect(heading).toHaveClass('whitespace-normal', 'break-words')
        expect(screen.getByText('−')).toBeInTheDocument()
      })

      // Click again to collapse
      fireEvent.click(heading)
      
      await waitFor(() => {
        expect(heading).toHaveClass('truncate')
        expect(screen.getByText('+')).toBeInTheDocument()
      })
    })

    it('expands text when Enter or Space is pressed on mobile', async () => {
      // Mock scrollWidth > clientWidth to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 100,
      })

      render(<GuestNameDisplay guestName="Very Long Guest Name" />)
      
      // When overflowing, the h3 element becomes interactive and gets role="button"
      const heading = screen.getByRole('button')
      
      // Focus the element
      heading.focus()
      
      // Press Enter to expand
      fireEvent.keyDown(heading, { key: 'Enter' })
      
      await waitFor(() => {
        expect(heading).not.toHaveClass('truncate')
      })

      // Press Space to collapse
      fireEvent.keyDown(heading, { key: ' ' })
      
      await waitFor(() => {
        expect(heading).toHaveClass('truncate')
      })
    })

    it('collapses when clicking outside on mobile', async () => {
      // Mock scrollWidth > clientWidth to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 100,
      })

      render(
        <div>
          <GuestNameDisplay guestName="Very Long Guest Name" />
          <div data-testid="outside-element">Outside</div>
        </div>
      )
      
      // When overflowing, the h3 element becomes interactive and gets role="button"
      const heading = screen.getByRole('button')
      const outsideElement = screen.getByTestId('outside-element')
      
      // Click to expand
      fireEvent.click(heading)
      
      await waitFor(() => {
        expect(heading).not.toHaveClass('truncate')
      })

      // Click outside to collapse
      fireEvent.mouseDown(outsideElement)
      
      await waitFor(() => {
        expect(heading).toHaveClass('truncate')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-label when interactive', async () => {
      // Mock scrollWidth > clientWidth to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 100,
      })

      render(<GuestNameDisplay guestName="John Doe" />)
      
      // When overflowing, the h3 element becomes interactive and gets role="button"
      const heading = screen.getByRole('button')
      
      await waitFor(() => {
        expect(heading).toHaveAttribute('aria-label', expect.stringContaining('Guest name: John Doe'))
        expect(heading).toHaveAttribute('role', 'button')
        expect(heading).toHaveAttribute('tabIndex', '0')
      })
    })

    it('has proper aria-expanded on mobile', async () => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))

      // Mock scrollWidth > clientWidth to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 100,
      })

      render(<GuestNameDisplay guestName="John Doe" />)
      
      // When overflowing, the h3 element becomes interactive and gets role="button"
      const heading = screen.getByRole('button')
      
      await waitFor(() => {
        expect(heading).toHaveAttribute('aria-expanded', 'false')
      })

      // Click to expand
      fireEvent.click(heading)
      
      await waitFor(() => {
        expect(heading).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('does not have interactive attributes when not overflowing', () => {
      // Mock no overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 100,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 200,
      })

      render(<GuestNameDisplay guestName="Short Name" />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      
      expect(heading).not.toHaveAttribute('role', 'button')
      expect(heading).not.toHaveAttribute('tabIndex')
      expect(heading).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Props Customization', () => {
    it('disables tooltip when showTooltip is false', async () => {
      // Mock scrollWidth > clientWidth to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 100,
      })

      render(<GuestNameDisplay guestName="Long Name" showTooltip={false} />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      
      // Hover should not show tooltip
      fireEvent.mouseEnter(heading)
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      })

      // Should have title attribute instead
      expect(heading).toHaveAttribute('title', 'Long Name')
    })

    it('disables mobile expansion when allowMobileExpansion is false', async () => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))

      // Mock scrollWidth > clientWidth to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 100,
      })

      render(<GuestNameDisplay guestName="Long Name" allowMobileExpansion={false} />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      
      // Should not have expansion indicator
      expect(screen.queryByText('+')).not.toBeInTheDocument()
      
      // Should not be interactive
      expect(heading).not.toHaveAttribute('role', 'button')
      expect(heading).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Convenience Components', () => {
    it('GuestNameH3 renders correctly', () => {
      render(<GuestNameH3 guestName="Test Name" />)
      
      expect(screen.getByText('Test Name')).toBeInTheDocument()
      // Check if it's overflowing to know whether it becomes a button or stays as heading
      const element = screen.getByText('Test Name')
      if (element.getAttribute('role') === 'button') {
        expect(screen.getByRole('button')).toBeInTheDocument()
      } else {
        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
      }
    })
  })
})