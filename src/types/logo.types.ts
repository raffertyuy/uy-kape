/**
 * Logo component types and interfaces
 */

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'

export type LogoVariant = 'default' | 'white' | 'dark'

export interface LogoProps {
  /** Size variant of the logo */
  size: LogoSize
  /** Visual variant for different backgrounds */
  variant?: LogoVariant
  /** Additional CSS classes */
  className?: string
  /** Alternative text for accessibility */
  alt?: string
  /** Optional click handler */
  onClick?: () => void
  /** Whether the logo should be a clickable link */
  clickable?: boolean
}

export interface LogoConfig {
  /** Image source path */
  src: string
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
  /** CSS classes for responsive sizing */
  responsiveClasses: string
}

export type LogoSizeMap = Record<LogoSize, LogoConfig>