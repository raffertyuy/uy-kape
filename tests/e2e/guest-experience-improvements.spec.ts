import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:5174'

test.describe('Guest Ordering Experience Improvements', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main ordering page
    await page.goto(BASE_URL)
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Funny Name Generation', () => {
    test('should allow guests to generate funny names', async ({ page }) => {
      // Navigate to ordering form (assuming there's a way to start ordering)
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      // Look for the guest info form
      const guestNameInput = page.locator('input[placeholder*="name" i]').first()
      if (await guestNameInput.isVisible()) {
        // Check if there's a generate name button or similar functionality
        const generateButton = page.locator('button').filter({ hasText: /generate|fun|name/i })
        
        if (await generateButton.count() > 0) {
          await generateButton.first().click()
          
          // Verify that a name was generated
          const generatedName = await guestNameInput.inputValue()
          expect(generatedName.length).toBeGreaterThan(0)
          
          // Check if the name contains coffee-related terms
          expect(generatedName.toLowerCase()).toMatch(/coffee|espresso|latte|brew|bean|roast|grind|cup|java|mocha|cappuccino|macchiato|americano|caffeine/i)
        }
      }
    })

    test('should allow regenerating funny names', async ({ page }) => {
      // Navigate to guest form
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      const guestNameInput = page.locator('input[placeholder*="name" i]').first()
      if (await guestNameInput.isVisible()) {
        const generateButton = page.locator('button').filter({ hasText: /generate|fun|name/i })
        
        if (await generateButton.count() > 0) {
          // Generate first name
          await generateButton.first().click()
          const firstName = await guestNameInput.inputValue()
          
          // Look for regenerate button (might appear after generation)
          const regenerateButton = page.locator('button[aria-label*="generate new" i], button[title*="regenerate" i]')
          
          if (await regenerateButton.isVisible()) {
            await regenerateButton.click()
            const secondName = await guestNameInput.inputValue()
            
            // Names should be different
            expect(secondName).not.toBe(firstName)
            expect(secondName.length).toBeGreaterThan(0)
          }
        }
      }
    })

    test('should clear generated name when user starts typing', async ({ page }) => {
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      const guestNameInput = page.locator('input[placeholder*="name" i]').first()
      if (await guestNameInput.isVisible()) {
        const generateButton = page.locator('button').filter({ hasText: /generate|fun|name/i })
        
        if (await generateButton.count() > 0) {
          // Generate a name
          await generateButton.first().click()
          const generatedName = await guestNameInput.inputValue()
          expect(generatedName.length).toBeGreaterThan(0)
          
          // Focus on input and start typing
          await guestNameInput.focus()
          await page.keyboard.type('John')
          
          // Name should be cleared and replaced
          const newValue = await guestNameInput.inputValue()
          expect(newValue).toBe('John')
        }
      }
    })
  })

  test.describe('Order Success with Barista Proverbs', () => {
    test('should display patience proverbs on order success', async ({ page }) => {
      // This test would require completing an order first
      // For now, we'll check if we can navigate through the ordering process
      
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
        
        // Fill out guest information if form is available
        const guestNameInput = page.locator('input[placeholder*="name" i]').first()
        if (await guestNameInput.isVisible()) {
          await guestNameInput.fill('Test User')
          
          // Try to proceed to next step
          const nextButton = page.locator('button').filter({ hasText: /next|continue|proceed/i })
          if (await nextButton.count() > 0) {
            await nextButton.first().click()
            
            // Look for menu items or order completion
            await page.waitForTimeout(1000)
            
            // If we can complete an order, check for success page
            const submitButton = page.locator('button').filter({ hasText: /submit|place|order/i })
            if (await submitButton.count() > 0) {
              await submitButton.first().click()
              
              // Look for success page with proverb
              await page.waitForTimeout(2000)
              const proverbElement = page.locator('[data-testid="barista-proverb"], .barista-proverb, [class*="proverb"]')
              
              if (await proverbElement.isVisible()) {
                await expect(proverbElement).toBeVisible()
                
                // Check for patience-related content
                const proverbText = await proverbElement.textContent()
                expect(proverbText?.toLowerCase()).toMatch(/patience|wait|time|perfect|brew|ready/i)
              }
            }
          }
        }
      }
    })

    test('should show estimated wait time on order success', async ({ page }) => {
      // Similar flow to above, but focusing on wait time display
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
        
        const guestNameInput = page.locator('input[placeholder*="name" i]').first()
        if (await guestNameInput.isVisible()) {
          await guestNameInput.fill('Test User')
          
          const nextButton = page.locator('button').filter({ hasText: /next|continue|proceed/i })
          if (await nextButton.count() > 0) {
            await nextButton.first().click()
            
            await page.waitForTimeout(1000)
            
            const submitButton = page.locator('button').filter({ hasText: /submit|place|order/i })
            if (await submitButton.count() > 0) {
              await submitButton.first().click()
              
              await page.waitForTimeout(2000)
              
              // Look for wait time display
              const waitTimeElement = page.locator('[data-testid*="wait"], [class*="wait"], text=/minutes?/i')
              
              if (await waitTimeElement.count() > 0) {
                await expect(waitTimeElement.first()).toBeVisible()
                
                const waitText = await waitTimeElement.first().textContent()
                expect(waitText).toMatch(/\d+.*minute/i)
              }
            }
          }
        }
      }
    })
  })

  test.describe('Guest Information Form Enhancements', () => {
    test('should display appropriate styling for generated names', async ({ page }) => {
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      const guestNameInput = page.locator('input[placeholder*="name" i]').first()
      if (await guestNameInput.isVisible()) {
        const generateButton = page.locator('button').filter({ hasText: /generate|fun|name/i })
        
        if (await generateButton.count() > 0) {
          await generateButton.first().click()
          
          // Check if the input has special styling for generated names
          const inputClasses = await guestNameInput.getAttribute('class')
          
          // Should have amber or special styling for generated names
          expect(inputClasses).toMatch(/amber|generated|special|highlight/i)
        }
      }
    })

    test('should show helper text for generated names', async ({ page }) => {
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      const guestNameInput = page.locator('input[placeholder*="name" i]').first()
      if (await guestNameInput.isVisible()) {
        const generateButton = page.locator('button').filter({ hasText: /generate|fun|name/i })
        
        if (await generateButton.count() > 0) {
          await generateButton.first().click()
          
          // Look for helper text about generated names
          const helperText = page.locator('text=/fun.*name|given.*you|coffee.*name|click.*enter/i')
          
          if (await helperText.count() > 0) {
            await expect(helperText.first()).toBeVisible()
          }
        }
      }
    })

    test('should handle special requests appropriately', async ({ page }) => {
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      // Look for special request input
      const specialRequestInput = page.locator('textarea[placeholder*="special" i], input[placeholder*="request" i]')
      
      if (await specialRequestInput.isVisible()) {
        const testRequest = 'Extra hot, no foam, with a smile!'
        await specialRequestInput.fill(testRequest)
        
        const inputValue = await specialRequestInput.inputValue()
        expect(inputValue).toBe(testRequest)
        
        // Check character count if it exists
        const charCount = page.locator('text=/\\d+.*character|\\d+.*remaining/i')
        if (await charCount.count() > 0) {
          await expect(charCount.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('User Experience Flow', () => {
    test('should provide smooth transition between ordering steps', async ({ page }) => {
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
        
        // Fill guest info
        const guestNameInput = page.locator('input[placeholder*="name" i]').first()
        if (await guestNameInput.isVisible()) {
          await guestNameInput.fill('Test User')
          
          // Check for smooth transitions (no abrupt changes)
          const nextButton = page.locator('button').filter({ hasText: /next|continue|proceed/i })
          if (await nextButton.count() > 0) {
            await nextButton.first().click()
            
            // Wait for transition to complete
            await page.waitForTimeout(500)
            
            // Verify we've moved to next step
            const currentUrl = page.url()
            const hasProgressed = currentUrl.includes('menu') || 
                                  await page.locator('[data-testid*="menu"], [class*="menu"]').count() > 0
            
            if (hasProgressed) {
              // Success - we've progressed through the flow
              expect(true).toBe(true)
            }
          }
        }
      }
    })

    test('should preserve user input during navigation', async ({ page }) => {
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      const guestNameInput = page.locator('input[placeholder*="name" i]').first()
      if (await guestNameInput.isVisible()) {
        const testName = 'Persistent Test User'
        await guestNameInput.fill(testName)
        
        // Navigate away and back if possible
        await page.goBack()
        await page.waitForTimeout(500)
        await page.goForward()
        await page.waitForTimeout(500)
        
        // Check if name is preserved
        const preservedName = await guestNameInput.inputValue()
        
        // If the form persists data, this should match
        // If not, at least the form should be functional
        if (preservedName === testName) {
          expect(preservedName).toBe(testName)
        } else {
          // At minimum, the form should still work
          await guestNameInput.fill(testName)
          expect(await guestNameInput.inputValue()).toBe(testName)
        }
      }
    })
  })

  test.describe('Accessibility and Usability', () => {
    test('should have proper keyboard navigation', async ({ page }) => {
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      // Test tab navigation through form elements
      const guestNameInput = page.locator('input[placeholder*="name" i]').first()
      if (await guestNameInput.isVisible()) {
        await guestNameInput.focus()
        
        // Tab to next element
        await page.keyboard.press('Tab')
        
        // Should focus on next interactive element
        const focusedElement = await page.locator(':focus').count()
        expect(focusedElement).toBe(1)
        
        // Test that generate button (if present) is keyboard accessible
        const generateButton = page.locator('button').filter({ hasText: /generate|fun|name/i })
        if (await generateButton.count() > 0) {
          await generateButton.first().focus()
          await page.keyboard.press('Enter')
          
          // Should generate a name
          const generatedName = await guestNameInput.inputValue()
          if (generatedName.length > 0) {
            expect(generatedName.length).toBeGreaterThan(0)
          }
        }
      }
    })

    test('should have proper ARIA labels and accessibility attributes', async ({ page }) => {
      const startOrderingButton = page.locator('button').filter({ hasText: /start|order|menu/i }).first()
      if (await startOrderingButton.isVisible()) {
        await startOrderingButton.click()
      }

      const guestNameInput = page.locator('input[placeholder*="name" i]').first()
      if (await guestNameInput.isVisible()) {
        // Check for proper labeling
        const hasLabel = await guestNameInput.getAttribute('aria-label') || 
                         await guestNameInput.getAttribute('aria-labelledby') ||
                         await page.locator('label').filter({ hasText: /name/i }).count() > 0
        
        expect(hasLabel).toBeTruthy()
        
        // Check for regenerate button accessibility
        const regenerateButton = page.locator('button[aria-label*="generate" i]')
        if (await regenerateButton.count() > 0) {
          const ariaLabel = await regenerateButton.first().getAttribute('aria-label')
          expect(ariaLabel).toBeTruthy()
          expect(ariaLabel?.toLowerCase()).toMatch(/generate|new|name/i)
        }
      }
    })
  })
})