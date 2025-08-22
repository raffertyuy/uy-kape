/**
 * Collection of funny, wacky coffee-themed superhero proverbs about patience
 * Used to entertain guests and encourage patience while they wait for their orders
 */

export type ProverbCategory = 'patience' | 'encouragement' | 'wisdom' | 'coffee-love'

export interface BaristaProverb {
  text: string
  category: ProverbCategory
}

// Collection of superhero-themed coffee proverbs
const baristaProverbs: readonly BaristaProverb[] = [
  // Patience proverbs
  {
    text: "Even Captain Caffeine knows that superpowers take time to brew properly.",
    category: 'patience'
  },
  {
    text: "The Incredible Espresso waits for no one, but good coffee waits for everyone.",
    category: 'patience'
  },
  {
    text: "With great coffee comes great responsibility... to wait patiently.",
    category: 'patience'
  },
  {
    text: "Wonder Bean's secret power? Perfect patience - and really strong coffee.",
    category: 'patience'
  },
  {
    text: "The Flash tried to speed-brew once... let's just say even speedsters need patience for perfect coffee.",
    category: 'patience'
  },
  {
    text: "Iron Bean's armor is powered by patience and premium espresso shots.",
    category: 'patience'
  },
  {
    text: "Batman brews in the shadows, but even the Dark Knight waits for perfect coffee extraction.",
    category: 'patience'
  },
  
  // Encouragement proverbs
  {
    text: "Your order has been dispatched to the Coffee Cave - our hero baristas are crafting with love and care!",
    category: 'encouragement'
  },
  {
    text: "Latte Lady is crafting your drink with superhuman precision and heart-warming care.",
    category: 'encouragement'
  },
  {
    text: "The Fantastic Foam is working their magic - prepare for caffeinated greatness!",
    category: 'encouragement'
  },
  {
    text: "Captain Americano salutes your patience - you're about to taste perfect freedom in a cup!",
    category: 'encouragement'
  },
  {
    text: "The Hulk gets hungry without coffee, but you're staying perfectly calm like a true hero!",
    category: 'encouragement'
  },
  {
    text: "Spider-Bean is web-slinging your perfect cup with love straight to you - thwip!",
    category: 'encouragement'
  },
  {
    text: "Thor's hammer can't speed perfection, and neither can we - Mjolnir-approved brewing with great care!",
    category: 'encouragement'
  },
  
  // Wisdom proverbs
  {
    text: "Doctor Strange says: 'I've seen 14 million futures, and in all of them, good coffee takes time.'",
    category: 'wisdom'
  },
  {
    text: "Professor X reads minds, but even he can't speed the perfect grind.",
    category: 'wisdom'
  },
  {
    text: "Wolverine's healing factor is fast, but his coffee brewing? That takes time, bub.",
    category: 'wisdom'
  },
  {
    text: "Black Widow knows the art of stealth... and the art of patient coffee extraction.",
    category: 'wisdom'
  },
  {
    text: "Deadpool breaks the fourth wall, but never breaks the sacred coffee brewing time.",
    category: 'wisdom'
  },
  {
    text: "Green Lantern's will is strong, but his patience for perfect coffee is stronger.",
    category: 'wisdom'
  },
  {
    text: "Aquaman commands the seas, but even ocean waves know good coffee takes time.",
    category: 'wisdom'
  },
  
  // Coffee love proverbs
  {
    text: "Superman's only challenge? Kryptonite and hurried coffee - we avoid both here for perfect brews!",
    category: 'coffee-love'
  },
  {
    text: "The X-Men fight for a world where humans and mutants can enjoy perfect coffee together.",
    category: 'coffee-love'
  },
  {
    text: "Groot's vocabulary is limited, but he'd definitely say 'I am Groot... and I love coffee!'",
    category: 'coffee-love'
  },
  {
    text: "The Avengers assemble for many reasons, but mostly for really good coffee.",
    category: 'coffee-love'
  },
  {
    text: "Rocket Raccoon travels the galaxy, but Earth coffee? That's worth the trip.",
    category: 'coffee-love'
  },
  {
    text: "Even Thanos with all infinity stones couldn't snap perfect coffee into existence instantly.",
    category: 'coffee-love'
  },
  {
    text: "Jean Grey's Phoenix force is powerful, but our coffee's power to make you happy? Equally impressive.",
    category: 'coffee-love'
  }
] as const

/**
 * Returns a random barista proverb from all categories
 * 
 * @returns A random barista proverb object with text and category
 * 
 * @example
 * getRandomBaristaProverb() 
 * // { text: "Even Captain Caffeine knows that superpowers take time to brew properly.", category: "patience" }
 */
export function getRandomBaristaProverb(): BaristaProverb {
  const randomIndex = Math.floor(Math.random() * baristaProverbs.length)
  return baristaProverbs[randomIndex]
}

/**
 * Returns a random barista proverb from a specific category
 * 
 * @param category - The category of proverb to select from
 * @returns A random barista proverb from the specified category
 * 
 * @example
 * getBaristaProverbByCategory('patience')
 * // { text: "With great coffee comes great responsibility... to wait patiently.", category: "patience" }
 */
export function getBaristaProverbByCategory(category: ProverbCategory): BaristaProverb {
  const categoryProverbs = baristaProverbs.filter(proverb => proverb.category === category)
  
  if (categoryProverbs.length === 0) {
    // Fallback to a random proverb if category not found
    return getRandomBaristaProverb()
  }
  
  const randomIndex = Math.floor(Math.random() * categoryProverbs.length)
  return categoryProverbs[randomIndex]
}

/**
 * Returns just the text of a random barista proverb (for backwards compatibility)
 * 
 * @returns The text of a random barista proverb
 * 
 * @example
 * getRandomBaristaProverbText() 
 * // "Even Captain Caffeine knows that superpowers take time to brew properly."
 */
export function getRandomBaristaProverbText(): string {
  return getRandomBaristaProverb().text
}

/**
 * Returns all available proverb categories
 * 
 * @returns Array of all proverb categories
 */
export function getProverbCategories(): ProverbCategory[] {
  return ['patience', 'encouragement', 'wisdom', 'coffee-love']
}

/**
 * Returns the total number of proverbs available
 * 
 * @returns Total count of proverbs
 */
export function getProverbCount(): number {
  return baristaProverbs.length
}

/**
 * Returns the count of proverbs in a specific category
 * 
 * @param category - The category to count
 * @returns Number of proverbs in the category
 */
export function getProverbCountByCategory(category: ProverbCategory): number {
  return baristaProverbs.filter(proverb => proverb.category === category).length
}

export default getRandomBaristaProverb