/**
 * Safe wrapper component for Vercel Speed Insights
 * 
 * This component only renders the Speed Insights component when:
 * 1. Vercel telemetry is explicitly enabled
 * 2. The app is running in production
 * 3. The Speed Insights package is available
 * 
 * This ensures the app works perfectly for developers without Vercel accounts
 * and that telemetry is only active when explicitly configured.
 */

import React, { Suspense, lazy } from 'react'
import { telemetryConfig } from '../../config/telemetryConfig'

// Lazy load Speed Insights to handle cases where it might not be available
const SpeedInsights = lazy(async () => {
  try {
    const module = await import('@vercel/speed-insights/react')
    return { default: module.SpeedInsights }
  } catch (error) {
    // Package not available or import failed - return a null component
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('Vercel Speed Insights not available:', error)
    }
    return { default: () => null }
  }
})

/**
 * SpeedInsightsWrapper component that conditionally renders Speed Insights
 */
export const SpeedInsightsWrapper: React.FC = () => {
  // Only render if all conditions are met:
  // 1. Vercel telemetry is enabled
  // 2. Speed Insights feature is enabled
  // 3. Running in production
  if (
    !telemetryConfig.vercel.enabled ||
    !telemetryConfig.vercel.speedInsights ||
    !import.meta.env.PROD
  ) {
    return null
  }

  // Render Speed Insights with Suspense for lazy loading
  return (
    <Suspense fallback={null}>
      <SpeedInsights />
    </Suspense>
  )
}

export default SpeedInsightsWrapper