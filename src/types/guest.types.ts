/**
 * Type definitions for guest experience features
 * Includes funny name generation and barista proverb functionality
 */

/**
 * Represents the state of a guest's name input
 */
export interface GuestNameState {
  /** The current name value */
  name: string
  /** Whether the name was generated automatically or entered by user */
  isGenerated: boolean
}

/**
 * Configuration for barista proverb display
 */
export interface BaristaProverbConfig {
  /** The proverb text to display */
  proverb: string
  /** The category/theme of the proverb */
  category: 'patience' | 'encouragement' | 'wisdom' | 'coffee-love'
}

/**
 * Props for components that support funny name generation
 */
export interface FunnyNameProps {
  /** Whether the current name is a generated funny name */
  isGeneratedName?: boolean
  /** Callback to generate a new funny name */
  onGenerateNewName?: () => void
  /** Callback to clear the generated name (when user starts typing) */
  onClearGeneratedName?: () => void
}

/**
 * Return type for the funny name generation hook
 */
export interface UseFunnyNameReturn {
  /** Current guest name value */
  guestName: string
  /** Whether the current name is generated */
  isGeneratedName: boolean
  /** Function to set the guest name */
  setGuestName: (_name: string) => void
  /** Function to generate a new funny name */
  generateNewFunnyName: () => void
  /** Function to clear the generated name */
  clearGeneratedName: () => void
}

/**
 * Available barista proverb categories
 */
export type BaristaProverbCategory = 'patience' | 'encouragement' | 'wisdom' | 'coffee-love'

/**
 * Barista proverb object structure
 */
export interface BaristaProverb {
  /** The proverb text */
  text: string
  /** The category/theme of the proverb */
  category: BaristaProverbCategory
}

/**
 * Props for the BaristaProverb component
 */
export interface BaristaProverbProps {
  /** Specific proverb text to display (overrides category selection) */
  proverb?: string
  /** Category to select proverb from */
  category?: BaristaProverbCategory
  /** Whether to show the "Words of Wisdom" header */
  showHeader?: boolean
  /** Additional CSS classes */
  className?: string
}