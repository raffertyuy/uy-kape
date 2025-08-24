import React from 'react'
import { type LogoProps, type LogoSizeMap } from '@/types/logo.types'
import logo24 from '@/assets/logos/logo-24.png'
import logo32 from '@/assets/logos/logo-32.png'
import logo48 from '@/assets/logos/logo-48.png'
import logo64 from '@/assets/logos/logo-64.png'
import logo96 from '@/assets/logos/logo-96.png'
import logo256 from '@/assets/logos/logo-256.png'

// Track preloaded assets to avoid duplicates
const preloadedAssets = new Set<string>()

// Preload specific logo asset when needed
const preloadLogoAsset = (src: string) => {
  if (typeof window === 'undefined' || preloadedAssets.has(src)) {
    return
  }
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  link.type = 'image/png'
  document.head.appendChild(link)
  preloadedAssets.add(src)
}

/**
 * Logo size configuration mapping
 * Each size includes the source image, dimensions, and responsive classes
 * Enhanced with breakpoint-specific sizing for optimal display
 */
const logoSizeMap: LogoSizeMap = {
  xs: {
    src: logo24,
    width: 24,
    height: 24,
    responsiveClasses: 'w-5 h-5 sm:w-6 sm:h-6',
  },
  sm: {
    src: logo32,
    width: 32,
    height: 32,
    responsiveClasses: 'w-6 h-6 sm:w-8 sm:h-8',
  },
  md: {
    src: logo48,
    width: 48,
    height: 48,
    responsiveClasses: 'w-10 h-10 sm:w-12 sm:h-12',
  },
  lg: {
    src: logo64,
    width: 64,
    height: 64,
    responsiveClasses: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
  },
  xl: {
    src: logo96,
    width: 96,
    height: 96,
    responsiveClasses: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
  },
  hero: {
    src: logo256,
    width: 256,
    height: 256,
    responsiveClasses: 'w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48',
  },
}

/**
 * Reusable Logo component with responsive sizing and variants
 * 
 * @param size - Logo size variant (xs, sm, md, lg, xl, hero)
 * @param variant - Visual variant (default, white, dark) - for future use
 * @param className - Additional CSS classes
 * @param alt - Alternative text for accessibility
 * @param onClick - Optional click handler
 * @param clickable - Whether the logo should appear clickable
 */
export function Logo({
  size,
  variant = 'default',
  className = '',
  alt = 'Uy, Kape! Coffee Ordering System',
  onClick,
  clickable = false,
}: LogoProps) {
  const config = logoSizeMap[size]
  
  // Preload the logo asset for this specific size when component renders
  React.useEffect(() => {
    preloadLogoAsset(config.src)
  }, [config.src])
  
  // Combine base classes with responsive classes and custom className
  const logoClasses = [
    config.responsiveClasses,
    'object-contain',
    clickable || onClick ? 'cursor-pointer hover:opacity-80 transition-opacity coffee-focus' : '',
    className,
  ].filter(Boolean).join(' ')

  // Determine if this is decorative (no meaningful alt text needed)
  const isDecorative = alt === '' || (variant === 'default' && alt.toLowerCase().includes('decorative'))
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }

  // If clickable, render as a button-like element for better accessibility
  if (onClick || clickable) {
    return (
      <img
        src={config.src}
        alt={alt}
        width={config.width}
        height={config.height}
        className={logoClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={isDecorative ? 'presentation' : 'button'}
        tabIndex={0}
        loading={size === 'hero' || size === 'xl' ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-ignore - fetchpriority is a valid HTML attribute but not in TypeScript types yet
        fetchpriority={size === 'hero' || size === 'xl' ? 'high' : 'auto'}
      />
    )
  }

  return (
    <img
      src={config.src}
      alt={alt}
      width={config.width}
      height={config.height}
      className={logoClasses}
      role={isDecorative ? 'presentation' : undefined}
      loading={size === 'hero' || size === 'xl' ? 'eager' : 'lazy'}
      decoding="async"
      // @ts-ignore - fetchpriority is a valid HTML attribute but not in TypeScript types yet
      fetchpriority={size === 'hero' || size === 'xl' ? 'high' : 'auto'}
    />
  )
}

export default Logo