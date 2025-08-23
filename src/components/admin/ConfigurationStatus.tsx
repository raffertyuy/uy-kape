import React, { useState, useEffect } from 'react'
import { validateEnvironmentConfig, generateConfigReport, getEnvironmentMode, type ConfigValidationResult } from '@/config/environment'
import { checkSupabaseHealth, type SupabaseHealthCheck } from '@/lib/supabase'

interface ConfigurationStatusProps {
  className?: string
}

export const ConfigurationStatus: React.FC<ConfigurationStatusProps> = ({ className = '' }) => {
  const [configValidation, setConfigValidation] = useState<ConfigValidationResult | null>(null)
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthCheck | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConfiguration = async () => {
      setIsLoading(true)
      
      // Validate environment configuration
      const validation = validateEnvironmentConfig()
      setConfigValidation(validation)

      // Check Supabase health if configuration is valid
      if (validation.isValid) {
        try {
          const health = await checkSupabaseHealth()
          setSupabaseHealth(health)
        } catch (error) {
          setSupabaseHealth({
            isHealthy: false,
            latency: null,
            error: error instanceof Error ? error.message : 'Health check failed',
            timestamp: new Date()
          })
        }
      }

      setIsLoading(false)
    }

    checkConfiguration()
  }, [])

  const getOverallStatus = () => {
    if (isLoading) return 'loading'
    if (!configValidation?.isValid) return 'invalid'
    if (!supabaseHealth?.isHealthy) return 'unhealthy'
    return 'healthy'
  }

  const getStatusColor = () => {
    switch (getOverallStatus()) {
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'invalid':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'unhealthy':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'healthy':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusIcon = () => {
    switch (getOverallStatus()) {
      case 'loading':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'invalid':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'unhealthy':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'healthy':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (getOverallStatus()) {
      case 'loading':
        return 'Checking Configuration...'
      case 'invalid':
        return 'Configuration Invalid'
      case 'unhealthy':
        return 'Connection Issues'
      case 'healthy':
        return 'System Healthy'
      default:
        return 'Unknown Status'
    }
  }

  const copyConfigReport = () => {
    const report = generateConfigReport()
    navigator?.clipboard?.writeText(report).then(() => {
      // Could add a toast notification here
      // console.log('Configuration report copied to clipboard')
    }).catch(() => {
      // Handle copy failure silently or show user feedback
    })
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 font-medium">{getStatusText()}</span>
          <span className="ml-2 text-xs opacity-75">
            ({getEnvironmentMode()})
          </span>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs underline hover:no-underline focus:outline-none"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Configuration Issues */}
          {configValidation && !configValidation.isValid && (
            <div>
              <h4 className="text-sm font-medium mb-2">Configuration Errors:</h4>
              <ul className="text-xs space-y-1">
                {configValidation.errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Configuration Warnings */}
          {configValidation && configValidation.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Configuration Warnings:</h4>
              <ul className="text-xs space-y-1">
                {configValidation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Supabase Health */}
          {supabaseHealth && (
            <div>
              <h4 className="text-sm font-medium mb-2">Database Connection:</h4>
              <div className="text-xs space-y-1">
                <div>Status: {supabaseHealth.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</div>
                {supabaseHealth.latency && (
                  <div>Latency: {supabaseHealth.latency}ms</div>
                )}
                {supabaseHealth.error && (
                  <div>Error: {supabaseHealth.error}</div>
                )}
                <div>Last Checked: {supabaseHealth.timestamp.toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {/* Configuration Values */}
          {configValidation && (
            <div>
              <h4 className="text-sm font-medium mb-2">Environment Variables:</h4>
              <div className="text-xs space-y-1">
                <div>SUPABASE_URL: {configValidation.config.supabaseUrl ? '✅ Set' : '❌ Missing'}</div>
                <div>SUPABASE_ANON_KEY: {configValidation.config.supabaseAnonKey ? '✅ Set' : '❌ Missing'}</div>
                <div>GUEST_PASSWORD: {configValidation.config.guestPassword ? '✅ Set' : '❌ Missing'}</div>
                <div>ADMIN_PASSWORD: {configValidation.config.adminPassword ? '✅ Set' : '❌ Missing'}</div>
                <div>WAIT_TIME_PER_ORDER: {configValidation.config.waitTimePerOrder || 'Default (4)'}</div>
                <div>ERROR_HANDLING_PANEL: {configValidation.config.errorHandlingPanel || 'Default (false)'}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2 border-t border-current border-opacity-20">
            <button
              onClick={copyConfigReport}
              className="text-xs px-2 py-1 bg-current bg-opacity-10 rounded hover:bg-opacity-20 transition-colors"
            >
              Copy Report
            </button>
            
            {getOverallStatus() === 'invalid' && (
              <a
                href="/docs/development-setup.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 bg-current bg-opacity-10 rounded hover:bg-opacity-20 transition-colors"
              >
                Setup Guide
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}