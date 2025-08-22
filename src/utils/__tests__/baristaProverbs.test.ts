import { describe, it, expect } from 'vitest'
import {
  getRandomBaristaProverb,
  getBaristaProverbByCategory,
  getRandomBaristaProverbText,
  getProverbCategories,
  getProverbCount,
  getProverbCountByCategory,
  type ProverbCategory
} from '../baristaProverbs'

describe('baristaProverbs', () => {
  describe('getRandomBaristaProverb', () => {
    it('should return a proverb object with text and category', () => {
      const proverb = getRandomBaristaProverb()
      
      expect(proverb).toBeDefined()
      expect(typeof proverb).toBe('object')
      expect(typeof proverb.text).toBe('string')
      expect(typeof proverb.category).toBe('string')
      expect(proverb.text.length).toBeGreaterThan(0)
    })

    it('should return different proverbs on multiple calls', () => {
      // Generate multiple proverbs to test variety
      const proverbs = Array.from({ length: 20 }, () => getRandomBaristaProverb())
      const uniqueTexts = new Set(proverbs.map(p => p.text))
      
      // Should have some variety (not all identical)
      expect(uniqueTexts.size).toBeGreaterThan(1)
    })

    it('should return proverbs with valid categories', () => {
      const proverbs = Array.from({ length: 10 }, () => getRandomBaristaProverb())
      const validCategories = getProverbCategories()
      
      proverbs.forEach(proverb => {
        expect(validCategories).toContain(proverb.category)
      })
    })

    it('should return proverbs that are coffee/patience themed', () => {
      const proverbs = Array.from({ length: 20 }, () => getRandomBaristaProverb())
      
      // Check that proverbs contain relevant themes
      const relevantTerms = /coffee|brew|cup|bean|barista|patience|wait|time|care|craft|perfect|love|moment|aroma/i
      
      const relevantCount = proverbs.filter(proverb => 
        relevantTerms.test(proverb.text)
      ).length
      
      // Most proverbs should contain relevant terms
      expect(relevantCount).toBeGreaterThan(proverbs.length * 0.8)
    })
  })

  describe('getBaristaProverbByCategory', () => {
    it('should return proverbs from the specified category', () => {
      const categories: ProverbCategory[] = ['patience', 'encouragement', 'wisdom', 'coffee-love']
      
      categories.forEach(category => {
        const proverb = getBaristaProverbByCategory(category)
        expect(proverb.category).toBe(category)
      })
    })

    it('should return different proverbs from the same category', () => {
      // Test with patience category (should have multiple proverbs)
      const patienceProverbs = Array.from({ length: 10 }, () => 
        getBaristaProverbByCategory('patience')
      )
      
      const uniqueTexts = new Set(patienceProverbs.map(p => p.text))
      
      // If there are multiple patience proverbs, we should see variety
      if (getProverbCountByCategory('patience') > 1) {
        expect(uniqueTexts.size).toBeGreaterThan(1)
      }
    })

    it('should fallback to random proverb for invalid category', () => {
      // TypeScript won't allow invalid categories, but test runtime behavior
      const proverb = getBaristaProverbByCategory('invalid' as ProverbCategory)
      
      expect(proverb).toBeDefined()
      expect(typeof proverb.text).toBe('string')
      expect(typeof proverb.category).toBe('string')
    })

    it('should return proverbs with appropriate themes for each category', () => {
      // Test patience category
      const patienceProverb = getBaristaProverbByCategory('patience')
      expect(/patience|wait|time|perfect|takes time/i.test(patienceProverb.text)).toBe(true)
      
      // Test encouragement category
      const encouragementProverb = getBaristaProverbByCategory('encouragement')
      expect(/love|care|heart|good|great|perfect|believe/i.test(encouragementProverb.text)).toBe(true)
    })
  })

  describe('getRandomBaristaProverbText', () => {
    it('should return a string', () => {
      const proverbText = getRandomBaristaProverbText()
      
      expect(typeof proverbText).toBe('string')
      expect(proverbText.length).toBeGreaterThan(0)
    })

    it('should return meaningful proverb text', () => {
      const proverbText = getRandomBaristaProverbText()
      
      // Should contain relevant coffee/patience themes
      const relevantTerms = /coffee|brew|cup|bean|barista|patience|wait|time|care|craft|perfect|love|moment|aroma/i
      expect(relevantTerms.test(proverbText)).toBe(true)
    })

    it('should return different texts on multiple calls', () => {
      const texts = Array.from({ length: 10 }, () => getRandomBaristaProverbText())
      const uniqueTexts = new Set(texts)
      
      // Should have some variety
      expect(uniqueTexts.size).toBeGreaterThan(1)
    })
  })

  describe('getProverbCategories', () => {
    it('should return an array of valid categories', () => {
      const categories = getProverbCategories()
      
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)
      
      // Check for expected categories
      expect(categories).toContain('patience')
      expect(categories).toContain('encouragement')
      expect(categories).toContain('wisdom')
      expect(categories).toContain('coffee-love')
    })

    it('should return exactly 4 categories', () => {
      const categories = getProverbCategories()
      expect(categories.length).toBe(4)
    })
  })

  describe('getProverbCount', () => {
    it('should return a positive number', () => {
      const count = getProverbCount()
      
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThan(0)
    })

    it('should return a reasonable number of proverbs', () => {
      const count = getProverbCount()
      
      // Should have a good variety of proverbs
      expect(count).toBeGreaterThan(10)
      expect(count).toBeLessThan(100) // Reasonable upper bound
    })
  })

  describe('getProverbCountByCategory', () => {
    it('should return positive counts for all categories', () => {
      const categories = getProverbCategories()
      
      categories.forEach(category => {
        const count = getProverbCountByCategory(category)
        expect(count).toBeGreaterThan(0)
      })
    })

    it('should return zero for invalid categories', () => {
      const count = getProverbCountByCategory('invalid' as ProverbCategory)
      expect(count).toBe(0)
    })

    it('should have total count equal to sum of category counts', () => {
      const totalCount = getProverbCount()
      const categories = getProverbCategories()
      
      const categoryCounts = categories.reduce((sum, category) => 
        sum + getProverbCountByCategory(category), 0
      )
      
      expect(categoryCounts).toBe(totalCount)
    })

    it('should have balanced distribution across categories', () => {
      const categories = getProverbCategories()
      const counts = categories.map(cat => getProverbCountByCategory(cat))
      
      // Each category should have at least one proverb
      counts.forEach(count => {
        expect(count).toBeGreaterThan(0)
      })
      
      // No category should dominate (more than 80% of total)
      const totalCount = getProverbCount()
      const maxCount = Math.max(...counts)
      expect(maxCount / totalCount).toBeLessThan(0.8)
    })
  })

  describe('proverb quality', () => {
    it('should have proverbs with proper grammar and punctuation', () => {
      const proverbs = Array.from({ length: 10 }, () => getRandomBaristaProverb())
      
      proverbs.forEach(proverb => {
        // Should start with capital letter
        expect(/^[A-Z]/.test(proverb.text)).toBe(true)
        
        // Should end with punctuation
        expect(/[.!?]$/.test(proverb.text)).toBe(true)
        
        // Should not be excessively long
        expect(proverb.text.length).toBeLessThan(200)
        
        // Should not be too short
        expect(proverb.text.length).toBeGreaterThan(20)
      })
    })

    it('should have proverbs that are encouraging and positive', () => {
      const proverbs = Array.from({ length: 20 }, () => getRandomBaristaProverb())
      
      // Should not contain negative words
      const negativeWords = /bad|terrible|awful|hate|angry|frustrated|impatient|rush|hurry|slow|wrong/i
      
      proverbs.forEach(proverb => {
        expect(negativeWords.test(proverb.text)).toBe(false)
      })
    })

    it('should have proverbs that relate to coffee shop experience', () => {
      const proverbs = Array.from({ length: 20 }, () => getRandomBaristaProverb())
      
      // Each proverb should relate to coffee, service, or patience
      const coffeeShopTerms = /coffee|brew|cup|bean|barista|wait|time|care|craft|serve|drink|order|moment|perfect|love|patience|aroma|steam|grind|pour/i
      
      proverbs.forEach(proverb => {
        expect(coffeeShopTerms.test(proverb.text)).toBe(true)
      })
    })
  })
})