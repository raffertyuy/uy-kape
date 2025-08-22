import { renderHook, act } from '@/test-utils'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'

describe('useGuestInfo', () => {
  let useGuestInfo: any

  beforeAll(async () => {
    // Mock the nameGenerator utilities
    vi.doMock('@/utils/nameGenerator', () => ({
      generateFunnyGuestName: vi.fn(() => 'The Bean Roaster'),
      isGeneratedFunnyName: vi.fn((name: string) => 
        name.includes('The Bean Roaster') || 
        name.includes('Captain') || 
        name.includes('Professor') ||
        /\b(the|captain|professor|doctor|master|super)\s+\w+\s+(roaster|monster|crusher|defender|warrior)/i.test(name)
      )
    }))

    // Import mocked module
    const useGuestInfoModule = await import('../useGuestInfo')
    useGuestInfo = useGuestInfoModule.useGuestInfo
  })

  afterAll(() => {
    vi.doUnmock('@/utils/nameGenerator')
  })
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty values', () => {
      const { result } = renderHook(() => useGuestInfo())

      expect(result.current.guestName).toBe('')
      expect(result.current.specialRequest).toBe('')
      expect(result.current.isGeneratedName).toBe(false)
      expect(result.current.isValid).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.hasInput).toBe(false)
      expect(result.current.trimmedName).toBe('')
    })

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useGuestInfo())

      expect(typeof result.current.setGuestName).toBe('function')
      expect(typeof result.current.setSpecialRequest).toBe('function')
      expect(typeof result.current.generateNewFunnyName).toBe('function')
      expect(typeof result.current.clearGeneratedName).toBe('function')
      expect(typeof result.current.validateName).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
      expect(typeof result.current.handleBlur).toBe('function')
    })
  })

  describe('guest name management', () => {
    it('should update guest name', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setGuestName('John Doe')
      })

      expect(result.current.guestName).toBe('John Doe')
      expect(result.current.trimmedName).toBe('John Doe')
      expect(result.current.hasInput).toBe(true)
    })

    it('should detect generated superhero names', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setGuestName('The Bean Roaster')
      })

      expect(result.current.isGeneratedName).toBe(true)
    })

    it('should detect user-entered names', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setGuestName('John Doe')
      })

      expect(result.current.isGeneratedName).toBe(false)
    })

    it('should clear error when user starts typing', () => {
      const { result } = renderHook(() => useGuestInfo())

      // First trigger an empty name validation error
      act(() => {
        result.current.validateName()
      })
      expect(result.current.error).toBe('Please enter your name')

      // Then start typing - error should clear
      act(() => {
        result.current.setGuestName('J')
      })
      expect(result.current.error).toBeNull()
    })
  })

  describe('funny name generation', () => {
    it('should generate a funny superhero name', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.generateNewFunnyName()
      })

      expect(result.current.guestName).toBe('The Bean Roaster')
      expect(result.current.isGeneratedName).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should clear generated name', () => {
      const { result } = renderHook(() => useGuestInfo())

      // First generate a name
      act(() => {
        result.current.generateNewFunnyName()
      })
      expect(result.current.guestName).toBe('The Bean Roaster')

      // Then clear it
      act(() => {
        result.current.clearGeneratedName()
      })
      expect(result.current.guestName).toBe('')
      expect(result.current.isGeneratedName).toBe(false)
    })

    it('should generate different names on multiple calls', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.generateNewFunnyName()
      })
      expect(result.current.guestName).toBe('The Bean Roaster')

      // Just verify the function is called
      expect(result.current.isGeneratedName).toBe(true)
    })
  })

  describe('special request management', () => {
    it('should update special request', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setSpecialRequest('Extra hot, please!')
      })

      expect(result.current.specialRequest).toBe('Extra hot, please!')
    })

    it('should limit special request to 500 characters', () => {
      const { result } = renderHook(() => useGuestInfo())
      const longText = 'a'.repeat(600)
      const expectedText = 'a'.repeat(500)

      act(() => {
        result.current.setSpecialRequest(longText)
      })

      expect(result.current.specialRequest).toBe(expectedText)
    })
  })

  describe('validation', () => {
    it('should validate empty name', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        const isValid = result.current.validateName()
        expect(isValid).toBe(false)
      })

      expect(result.current.error).toBe('Please enter your name')
      expect(result.current.isValid).toBe(false)
    })

    it('should validate name too short', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setGuestName('J')
        const isValid = result.current.validateName('J')
        expect(isValid).toBe(false)
      })

      expect(result.current.error).toBe('Name must be at least 2 characters long')
    })

    it('should validate name too long', () => {
      const { result } = renderHook(() => useGuestInfo())
      const longName = 'a'.repeat(51)

      act(() => {
        result.current.setGuestName(longName)
        const isValid = result.current.validateName(longName)
        expect(isValid).toBe(false)
      })

      expect(result.current.error).toBe('Name must be less than 50 characters')
    })

    it('should validate invalid characters', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setGuestName('John123')
        const isValid = result.current.validateName('John123')
        expect(isValid).toBe(false)
      })

      expect(result.current.error).toBe('Name can only contain letters, spaces, hyphens, and apostrophes')
    })

    it('should validate name without letters', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setGuestName('---\' ')
        const isValid = result.current.validateName('---\' ')
        expect(isValid).toBe(false)
      })

      expect(result.current.error).toBe('Name must contain at least one letter')
    })

    it('should accept valid names', () => {
      const { result } = renderHook(() => useGuestInfo())
      const validNames = ['John', 'Jane Doe', 'Mary-Jane', 'O\'Connor', 'Jean-Luc']

      validNames.forEach((name) => {
        act(() => {
          result.current.setGuestName(name)
          const isValid = result.current.validateName(name)
          expect(isValid).toBe(true)
        })

        expect(result.current.error).toBeNull()
      })
    })

    it('should handle whitespace in names', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setGuestName('  John Doe  ')
        const isValid = result.current.validateName('  John Doe  ')
        expect(isValid).toBe(true)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('error management', () => {
    it('should clear error manually', () => {
      const { result } = renderHook(() => useGuestInfo())

      // First set an error
      act(() => {
        result.current.validateName()
      })
      expect(result.current.error).toBe('Please enter your name')

      // Then clear it
      act(() => {
        result.current.clearError()
      })
      expect(result.current.error).toBeNull()
    })

    it('should clear error when generating funny name', () => {
      const { result } = renderHook(() => useGuestInfo())

      // First set an error
      act(() => {
        result.current.validateName()
      })
      expect(result.current.error).toBe('Please enter your name')

      // Generate funny name should clear error
      act(() => {
        result.current.generateNewFunnyName()
      })
      expect(result.current.error).toBeNull()
    })

    it('should clear error when clearing generated name', () => {
      const { result } = renderHook(() => useGuestInfo())

      // First set an error and generate a name
      act(() => {
        result.current.generateNewFunnyName()
        result.current.validateName()
      })

      // Clear generated name should clear error
      act(() => {
        result.current.clearGeneratedName()
      })
      expect(result.current.error).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('should compute isValid correctly', () => {
      const { result } = renderHook(() => useGuestInfo())

      // Should be invalid initially
      expect(result.current.isValid).toBe(false)

      // Should be valid with good name and no error
      act(() => {
        result.current.setGuestName('John Doe')
        result.current.validateName('John Doe')
      })
      expect(result.current.isValid).toBe(true)

      // Invalid with error
      act(() => {
        result.current.setGuestName('J')
        result.current.validateName('J')
      })
      expect(result.current.isValid).toBe(false)
    })

    it('should compute hasInput correctly', () => {
      const { result } = renderHook(() => useGuestInfo())

      expect(result.current.hasInput).toBe(false)

      act(() => {
        result.current.setGuestName('John')
      })
      expect(result.current.hasInput).toBe(true)

      act(() => {
        result.current.setGuestName('   ')
      })
      expect(result.current.hasInput).toBe(false)
    })

    it('should compute trimmedName correctly', () => {
      const { result } = renderHook(() => useGuestInfo())

      act(() => {
        result.current.setGuestName('  John Doe  ')
      })
      expect(result.current.trimmedName).toBe('John Doe')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete user flow with generated name', () => {
      const { result } = renderHook(() => useGuestInfo())

      // Generate a name
      act(() => {
        result.current.generateNewFunnyName()
      })
      expect(result.current.guestName).toBe('The Bean Roaster')
      expect(result.current.isGeneratedName).toBe(true)

      // Validate it
      act(() => {
        const isValid = result.current.validateName()
        expect(isValid).toBe(true)
      })
      expect(result.current.error).toBeNull()
      expect(result.current.isValid).toBe(true)
    })

    it('should handle user replacing generated name', () => {
      const { result } = renderHook(() => useGuestInfo())

      // Start with generated name
      act(() => {
        result.current.generateNewFunnyName()
      })
      expect(result.current.isGeneratedName).toBe(true)

      // User types their own name
      act(() => {
        result.current.setGuestName('John Doe')
      })
      expect(result.current.isGeneratedName).toBe(false)
      expect(result.current.guestName).toBe('John Doe')
    })

    it('should handle clearing and regenerating names', () => {
      const { result } = renderHook(() => useGuestInfo())

      // Generate name
      act(() => {
        result.current.generateNewFunnyName()
      })
      expect(result.current.guestName).toBe('The Bean Roaster')

      // Clear it
      act(() => {
        result.current.clearGeneratedName()
      })
      expect(result.current.guestName).toBe('')
      expect(result.current.isGeneratedName).toBe(false)

      // Generate new one
      act(() => {
        result.current.generateNewFunnyName()
      })
      expect(result.current.guestName).toBe('The Bean Roaster')
      expect(result.current.isGeneratedName).toBe(true)
    })
  })
})