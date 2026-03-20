/**
 * Utilities for Hacked Mode Easter Egg
 * Provides drink name prefixes for the guest ordering flow.
 * Admin views always show original drink names — do not use these utilities in admin components.
 */

const HACKED_PREFIXES = [
  "The Worst",
  "The Most Disgusting",
  "The Awful",
  "The Terrible",
  "The Horrible",
  "The Putrid",
  "The Wretched",
  "The Foul",
  "The Vile",
  "The Revolting",
  "The Dreadful",
  "The Sickening",
] as const;

/**
 * Returns a drink name prefixed with a randomly chosen "terrible" descriptor.
 * Callers should memoize the result per drink to ensure prefix stability within a page load.
 *
 * @param originalName - The original drink name from the database
 * @returns The drink name with a dark prefix, e.g. "The Worst Espresso"
 */
export function getHackedDrinkName(originalName: string): string {
  const prefix =
    HACKED_PREFIXES[Math.floor(Math.random() * HACKED_PREFIXES.length)];
  return `${prefix} ${originalName}`;
}

/** Exported for test assertions */
export const HACKED_PREFIX_LIST = HACKED_PREFIXES;
