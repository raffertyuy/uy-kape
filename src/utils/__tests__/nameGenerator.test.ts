import { describe, it, expect } from 'vitest'
import { generateFunnyGuestName, isGeneratedFunnyName } from '../nameGenerator'

describe('nameGenerator', () => {
  describe('generateFunnyGuestName', () => {
    it('should generate a non-empty string', () => {
      const name = generateFunnyGuestName()
      expect(name).toBeDefined()
      expect(typeof name).toBe('string')
      expect(name.length).toBeGreaterThan(0)
    })

    it('should generate different names on multiple calls', () => {
      const names = Array.from({ length: 10 }, () => generateFunnyGuestName())
      const uniqueNames = new Set(names)
      
      // Should have some variety (not all identical)
      // With random generation, we expect some uniqueness
      expect(uniqueNames.size).toBeGreaterThan(1)
    })

    it('should generate names with coffee-themed superhero elements', () => {
      // Generate multiple names to test different patterns
      const names = Array.from({ length: 20 }, () => generateFunnyGuestName())
      
      // Superhero titles that should appear in generated names
      const superheroTitlesRegex = /\b(the|captain|professor|doctor|master|super|ultra|mega|supreme)\b/i
      
      // Coffee-themed terms that should appear in generated names
      const coffeeTermsRegex = /\b(bean|brew|roast|grind|steam|crema|froth|drip|blend|shot|sip|cup|mug|filter|press|latte|mocha|macchiato|americano|cortado|espresso|caffeine|coffee|milk|sugar|foam|aroma|barista)\b/i
      
      // Superhero actions that should appear in generated names
      const superheroActionsRegex = /\b(roaster|brewer|grinder|steamer|burner|monster|master|guardian|defender|warrior|fighter|hunter|crusher|blaster|slayer|bringer|keeper|wielder|commander|destroyer)\b/i
      
      // Most names should contain superhero titles and coffee/action terms
      const superheroNameCount = names.filter(name => 
        superheroTitlesRegex.test(name) && (coffeeTermsRegex.test(name) || superheroActionsRegex.test(name))
      ).length
      
      expect(superheroNameCount).toBeGreaterThan(names.length * 0.8) // At least 80% should follow superhero pattern
    })

    it('should generate names with proper formatting', () => {
      const names = Array.from({ length: 10 }, () => generateFunnyGuestName())
      
      names.forEach(name => {
        // Should not start or end with spaces
        expect(name.trim()).toBe(name)
        
        // Should contain at least one letter
        expect(/[a-zA-Z]/.test(name)).toBe(true)
        
        // Should not be excessively long
        expect(name.length).toBeLessThan(100)
      })
    })

    it('should handle different superhero name formats', () => {
      // Generate many names to see format variety
      const names = Array.from({ length: 50 }, () => generateFunnyGuestName())
      
      // Count different superhero patterns
      const patterns = {
        thePattern: names.filter(name => name.toLowerCase().startsWith('the ')).length,
        titlePattern: names.filter(name => /^(captain|professor|doctor|master|super|ultra|mega|supreme)\s/i.test(name)).length,
        threeWords: names.filter(name => name.split(' ').length === 3).length,
        twoWords: names.filter(name => name.split(' ').length === 2).length
      }
      
      // Should have variety in superhero name formats
      expect(patterns.thePattern).toBeGreaterThan(0) // Should have some "The [Descriptor] [Action]" names
      expect(patterns.titlePattern).toBeGreaterThan(0) // Should have some "[Title] [Descriptor/Action]" names
      expect(patterns.twoWords).toBeGreaterThan(0) // Should have some 2-word names
      expect(patterns.threeWords).toBeGreaterThan(0) // Should have some 3-word names
    })
  })

  describe('isGeneratedFunnyName', () => {
    it('should return false for empty or invalid input', () => {
      expect(isGeneratedFunnyName('')).toBe(false)
      expect(isGeneratedFunnyName(null as any)).toBe(false)
      expect(isGeneratedFunnyName(undefined as any)).toBe(false)
      expect(isGeneratedFunnyName(123 as any)).toBe(false)
    })

    it('should return false for regular human names', () => {
      const regularNames = [
        'John Doe',
        'Mary Smith',
        'David Johnson',
        'Sarah Wilson',
        'Michael Brown',
        'Jessica Davis'
      ]

      regularNames.forEach(name => {
        expect(isGeneratedFunnyName(name)).toBe(false)
      })
    })

    it('should return true for superhero coffee names', () => {
      const superheroNames = [
        'The Bean Roaster',
        'Captain Caffeine Monster',
        'Professor Milk Steamer',
        'Doctor Coffee Crusher',
        'Master Espresso Guardian',
        'The Latte Defender',
        'Super Brew Monster'
      ]

      superheroNames.forEach(name => {
        expect(isGeneratedFunnyName(name)).toBe(true)
      })
    })

    it('should return false for names with only one coffee/superhero element', () => {
      const singleElementNames = [
        'John Bean', // Only one coffee word
        'Mary Captain', // Only one superhero word
        'The Johnson', // The + regular surname
        'Doctor Smith' // Title + regular surname
      ]

      singleElementNames.forEach(name => {
        expect(isGeneratedFunnyName(name)).toBe(false)
      })
    })

    it('should be case insensitive', () => {
      expect(isGeneratedFunnyName('THE BEAN ROASTER')).toBe(true)
      expect(isGeneratedFunnyName('the bean roaster')).toBe(true)
      expect(isGeneratedFunnyName('The Bean Roaster')).toBe(true)
      expect(isGeneratedFunnyName('CAPTAIN CAFFEINE MONSTER')).toBe(true)
    })

    it('should work with generated superhero names', () => {
      // Test with actual generated names
      const generatedNames = Array.from({ length: 20 }, () => generateFunnyGuestName())
      
      // Most generated superhero names should be detected as such
      const detectedCount = generatedNames.filter(name => 
        isGeneratedFunnyName(name)
      ).length
      
      // Should detect most generated names as superhero names
      expect(detectedCount).toBeGreaterThan(generatedNames.length * 0.8)
    })

    it('should handle partial matches correctly', () => {
      // Names that might have coffee/superhero words but aren't actually generated superhero names
      const partialMatches = [
        'Bean Smith', // Has coffee word but only one element
        'Coffee Shop', // Has coffee reference but not superhero format
        'John Brewster', // Contains 'brew' but as part of surname
        'Captain America', // Has title but not coffee-themed
        'The Beatles' // Has 'The' but not coffee/superhero themed
      ]

      partialMatches.forEach(name => {
        // These should not be considered generated superhero names
        expect(isGeneratedFunnyName(name)).toBe(false)
      })
    })
  })
})