/**
 * Environment configuration validation utilities
 */

export interface EnvironmentConfig {
  supabaseUrl: string | undefined
  supabaseAnonKey: string | undefined
  guestPassword: string | undefined
  adminPassword: string | undefined
  waitTimePerOrder: string | undefined
  errorHandlingPanel: string | undefined
}

export interface ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  config: EnvironmentConfig
}

// Get all environment variables
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    guestPassword: import.meta.env.VITE_GUEST_PASSWORD,
    adminPassword: import.meta.env.VITE_ADMIN_PASSWORD,
    waitTimePerOrder: import.meta.env.VITE_WAIT_TIME_PER_ORDER,
    errorHandlingPanel: import.meta.env.VITE_ERROR_HANDLING_PANEL,
  }
}

// Validate Supabase URL format
const validateSupabaseUrl = (url: string | undefined): { isValid: boolean; error?: string } => {
  if (!url) {
    return { isValid: false, error: 'Supabase URL is required' }
  }

  if (url.trim() === '') {
    return { isValid: false, error: 'Supabase URL cannot be empty' }
  }

  // Check if it's a valid URL format
  try {
    const urlObj = new URL(url)
    
    // Check if it looks like a Supabase URL
    if (!urlObj.hostname.includes('supabase')) {
      return { 
        isValid: false, 
        error: 'URL does not appear to be a valid Supabase URL (should contain "supabase")' 
      }
    }

    if (urlObj.protocol !== 'https:') {
      return { 
        isValid: false, 
        error: 'Supabase URL must use HTTPS protocol' 
      }
    }

    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

// Validate Supabase anonymous key format
const validateSupabaseAnonKey = (key: string | undefined): { isValid: boolean; error?: string } => {
  if (!key) {
    return { isValid: false, error: 'Supabase anonymous key is required' }
  }

  if (key.trim() === '') {
    return { isValid: false, error: 'Supabase anonymous key cannot be empty' }
  }

  // Basic format check - Supabase keys are usually JWT tokens
  if (key.length < 50) {
    return { 
      isValid: false, 
      error: 'Supabase anonymous key appears to be too short (should be a JWT token)' 
    }
  }

  // Check if it looks like a JWT (has dots separating parts)
  const parts = key.split('.')
  if (parts.length !== 3) {
    return { 
      isValid: false, 
      error: 'Supabase anonymous key should be a JWT token with 3 parts separated by dots' 
    }
  }

  return { isValid: true }
}

// Validate password strength
const validatePassword = (password: string | undefined, name: string): { isValid: boolean; error?: string; warning?: string } => {
  if (!password) {
    return { isValid: false, error: `${name} is required` }
  }

  if (password.trim() === '') {
    return { isValid: false, error: `${name} cannot be empty` }
  }

  if (password.length < 6) {
    return { 
      isValid: false, 
      error: `${name} must be at least 6 characters long for security` 
    }
  }

  // Warn about weak passwords in production
  if (password === 'password' || password === '123456' || password === 'admin') {
    return { 
      isValid: true, 
      warning: `${name} is using a common/weak password. Consider using a stronger password in production.` 
    }
  }

  return { isValid: true }
}

// Validate numeric configuration
const validateNumericConfig = (value: string | undefined, name: string, min?: number, max?: number): { isValid: boolean; error?: string } => {
  if (!value) {
    return { isValid: true } // Optional values
  }

  const numValue = Number(value)
  if (isNaN(numValue)) {
    return { isValid: false, error: `${name} must be a valid number` }
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `${name} must be at least ${min}` }
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `${name} must be at most ${max}` }
  }

  return { isValid: true }
}

// Validate boolean configuration
const validateBooleanConfig = (value: string | undefined, name: string): { isValid: boolean; error?: string } => {
  if (!value) {
    return { isValid: true } // Optional values
  }

  const lowerValue = value.toLowerCase()
  if (lowerValue !== 'true' && lowerValue !== 'false') {
    return { isValid: false, error: `${name} must be 'true' or 'false'` }
  }

  return { isValid: true }
}

// Main validation function
export const validateEnvironmentConfig = (): ConfigValidationResult => {
  const config = getEnvironmentConfig()
  const errors: string[] = []
  const warnings: string[] = []

  // Validate Supabase configuration
  const urlValidation = validateSupabaseUrl(config.supabaseUrl)
  if (!urlValidation.isValid && urlValidation.error) {
    errors.push(`VITE_SUPABASE_URL: ${urlValidation.error}`)
  }

  const keyValidation = validateSupabaseAnonKey(config.supabaseAnonKey)
  if (!keyValidation.isValid && keyValidation.error) {
    errors.push(`VITE_SUPABASE_ANON_KEY: ${keyValidation.error}`)
  }

  // Validate password configuration
  const guestPasswordValidation = validatePassword(config.guestPassword, 'Guest password')
  if (!guestPasswordValidation.isValid && guestPasswordValidation.error) {
    errors.push(`VITE_GUEST_PASSWORD: ${guestPasswordValidation.error}`)
  }
  if (guestPasswordValidation.warning) {
    warnings.push(`VITE_GUEST_PASSWORD: ${guestPasswordValidation.warning}`)
  }

  const adminPasswordValidation = validatePassword(config.adminPassword, 'Admin password')
  if (!adminPasswordValidation.isValid && adminPasswordValidation.error) {
    errors.push(`VITE_ADMIN_PASSWORD: ${adminPasswordValidation.error}`)
  }
  if (adminPasswordValidation.warning) {
    warnings.push(`VITE_ADMIN_PASSWORD: ${adminPasswordValidation.warning}`)
  }

  // Validate numeric configuration
  const waitTimeValidation = validateNumericConfig(config.waitTimePerOrder, 'Wait time per order', 1, 60)
  if (!waitTimeValidation.isValid && waitTimeValidation.error) {
    errors.push(`VITE_WAIT_TIME_PER_ORDER: ${waitTimeValidation.error}`)
  }

  // Validate boolean configuration
  const errorPanelValidation = validateBooleanConfig(config.errorHandlingPanel, 'Error handling panel')
  if (!errorPanelValidation.isValid && errorPanelValidation.error) {
    errors.push(`VITE_ERROR_HANDLING_PANEL: ${errorPanelValidation.error}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  }
}

// Check if we're in development mode
export const isDevelopmentMode = (): boolean => {
  return import.meta.env.MODE === 'development'
}

// Check if we're in production mode
export const isProductionMode = (): boolean => {
  return import.meta.env.MODE === 'production'
}

// Get environment mode
export const getEnvironmentMode = (): string => {
  return import.meta.env.MODE || 'development'
}

// Generate a configuration report
export const generateConfigReport = (): string => {
  const validation = validateEnvironmentConfig()
  const mode = getEnvironmentMode()
  
  let report = `=== Environment Configuration Report ===\n`
  report += `Mode: ${mode}\n\n`

  report += `Configuration Status: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}\n\n`

  if (validation.errors.length > 0) {
    report += `❌ Errors (${validation.errors.length}):\n`
    validation.errors.forEach(error => {
      report += `  • ${error}\n`
    })
    report += `\n`
  }

  if (validation.warnings.length > 0) {
    report += `⚠️  Warnings (${validation.warnings.length}):\n`
    validation.warnings.forEach(warning => {
      report += `  • ${warning}\n`
    })
    report += `\n`
  }

  report += `Configuration Values:\n`
  report += `  VITE_SUPABASE_URL: ${validation.config.supabaseUrl ? '✅ Set' : '❌ Missing'}\n`
  report += `  VITE_SUPABASE_ANON_KEY: ${validation.config.supabaseAnonKey ? '✅ Set' : '❌ Missing'}\n`
  report += `  VITE_GUEST_PASSWORD: ${validation.config.guestPassword ? '✅ Set' : '❌ Missing'}\n`
  report += `  VITE_ADMIN_PASSWORD: ${validation.config.adminPassword ? '✅ Set' : '❌ Missing'}\n`
  report += `  VITE_WAIT_TIME_PER_ORDER: ${validation.config.waitTimePerOrder || 'Default (4)'}\n`
  report += `  VITE_ERROR_HANDLING_PANEL: ${validation.config.errorHandlingPanel || 'Default (false)'}\n`

  return report
}