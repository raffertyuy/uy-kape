/**
 * Utility for generating funny coffee-themed superhero names for guests
 * Used in guest ordering flow to provide entertaining default names
 */

// Coffee-themed superhero titles
const superheroTitles = [
  'The',
  'Captain',
  'Professor',
  'Doctor',
  'Master',
  'Super',
  'Ultra',
  'Mega',
  'Supreme'
] as const

// Coffee-related descriptive words for superhero names
const coffeeDescriptors = [
  'Bean',
  'Brew',
  'Roast',
  'Grind',
  'Steam',
  'Crema',
  'Froth',
  'Drip',
  'Blend',
  'Shot',
  'Sip',
  'Cup',
  'Mug',
  'Filter',
  'Press',
  'Latte',
  'Mocha',
  'Macchiato',
  'Americano',
  'Cortado',
  'Espresso',
  'Caffeine',
  'Coffee',
  'Milk',
  'Sugar',
  'Foam',
  'Aroma',
  'Barista'
] as const

// Superhero action words that work with coffee themes
const superheroActions = [
  'Roaster',
  'Brewer',
  'Grinder',
  'Steamer',
  'Burner',
  'Monster',
  'Master',
  'Guardian',
  'Defender',
  'Warrior',
  'Fighter',
  'Hunter',
  'Crusher',
  'Blaster',
  'Slayer',
  'Bringer',
  'Keeper',
  'Wielder',
  'Commander',
  'Destroyer'
] as const

/**
 * Generates a random funny coffee-themed superhero name for guests
 * Creates names like "The Bean Roaster", "Captain Caffeine Monster", or "Professor Milk Steamer"
 * 
 * @returns A randomly generated superhero-style coffee name
 * 
 * @example
 * generateFunnyGuestName() // "The Bean Roaster"
 * generateFunnyGuestName() // "Captain Caffeine Monster" 
 * generateFunnyGuestName() // "Professor Milk Steamer"
 */
export function generateFunnyGuestName(): string {
  // Get random elements from each array
  const title = superheroTitles[Math.floor(Math.random() * superheroTitles.length)]
  const descriptor = coffeeDescriptors[Math.floor(Math.random() * coffeeDescriptors.length)]
  const action = superheroActions[Math.floor(Math.random() * superheroActions.length)]
  
  // Randomly choose between different superhero name formats
  const formatChoice = Math.floor(Math.random() * 4)
  
  switch (formatChoice) {
    case 0:
      // "The [Descriptor] [Action]" - e.g., "The Bean Roaster"
      return `The ${descriptor} ${action}`
    case 1:
      // "[Title] [Descriptor]" - e.g., "Captain Caffeine" 
      return `${title === 'The' ? 'Captain' : title} ${descriptor}`
    case 2:
      // "[Title] [Action]" - e.g., "Professor Roaster"
      return `${title === 'The' ? 'Doctor' : title} ${action}`
    case 3:
      // "[Title] [Descriptor] [Action]" - e.g., "Super Bean Crusher"
      return `${title === 'The' ? 'Master' : title} ${descriptor} ${action}`
    default:
      return `The ${descriptor} ${action}`
  }
}

/**
 * Checks if a given name appears to be a generated superhero coffee name
 * Used to track whether user has entered their own name or is using generated one
 * 
 * @param name - The name to check
 * @returns True if the name contains superhero coffee-themed elements in a pattern typical of generated names
 */
export function isGeneratedFunnyName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false
  }
  
  const normalizedName = name.toLowerCase()
  
  // Check for superhero titles
  const hasSuperheroTitle = superheroTitles.some(title => 
    normalizedName.startsWith(`${title.toLowerCase()} `)
  )
  
  // Check for coffee descriptors
  const hasCoffeeDescriptor = coffeeDescriptors.some(descriptor => 
    normalizedName.includes(descriptor.toLowerCase())
  )
  
  // Check for superhero actions
  const hasSuperheroAction = superheroActions.some(action => 
    normalizedName.includes(action.toLowerCase())
  )
  
  // Generated superhero names typically have:
  // 1. A superhero title (The, Captain, etc.) + coffee elements, OR
  // 2. Multiple coffee/superhero elements combined
  const hasSuperheroPattern = hasSuperheroTitle && (hasCoffeeDescriptor || hasSuperheroAction)
  const hasMultipleElements = hasCoffeeDescriptor && hasSuperheroAction
  
  // Additional check: exclude common name patterns
  const commonNamePatterns = /^(john|jane|mary|david|sarah|michael|jessica|robert|lisa|william|jennifer|mike|bob|tom|amy|sue)\s+(bean|brew|roast|grind|steam|coffee|the|captain|doctor|professor|master|super)$/i
  const reverseCommonPattern = /^(the|captain|doctor|professor|master|super|bean|brew|roast|grind|steam|coffee)\s+(johnson|smith|brown|davis|miller|wilson|moore|taylor|anderson|thomas|jackson|white|harris|martin|thompson|garcia|martinez|robinson|clark|rodriguez|lewis|lee|walker|hall|allen|young|hernandez|king|wright|lopez|hill|scott|green|adams|baker|gonzalez|nelson|carter|mitchell|perez|roberts|turner|phillips|campbell|parker|evans|edwards|collins|stewart|sanchez|morris|rogers|reed|cook|morgan|bell|murphy|bailey|rivera|cooper|richardson|cox|howard|ward|torres|peterson|gray|ramirez|james|watson|brooks|kelly|sanders|price|bennett|wood|barnes|ross|henderson|coleman|jenkins|perry|powell|long|patterson|hughes|flores|washington|butler|simmons|foster)$/i
  
  if (commonNamePatterns.test(normalizedName) || reverseCommonPattern.test(normalizedName)) {
    return false
  }
  
  return hasSuperheroPattern || hasMultipleElements
}

export default generateFunnyGuestName