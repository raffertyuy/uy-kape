import React, { useState, useEffect } from 'react'
import { validateEnvironmentConfig } from '@/config/environment'
import { checkSupabaseHealth, type SupabaseHealthCheck } from '@/lib/supabase'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useRealtimeConnection } from '@/lib/realtime'

interface DiagnosticTest {
  name: string
  status: 'pass' | 'warn' | 'fail' | 'loading'
  message: string
  details?: string | null
}

interface DiagnosticSection {
  name: string
  tests: DiagnosticTest[]
}

export const SystemDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticSection[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<Date | null>(null)

  const { isOnline, connectionType } = useNetworkStatus()
  const { getStatus, testConnection } = useRealtimeConnection()

  const runDiagnostics = async () => {
    setIsRunning(true)
    setLastRun(new Date())

    const results: DiagnosticSection[] = [
      {
        name: 'Environment Configuration',
        tests: []
      },
      {
        name: 'Network Connectivity', 
        tests: []
      },
      {
        name: 'Supabase Services',
        tests: []
      },
      {
        name: 'Real-time Features',
        tests: []
      },
      {
        name: 'Browser Compatibility',
        tests: []
      }
    ]

    // Environment Configuration Tests
    try {
      const envValidation = validateEnvironmentConfig()
      
      // Supabase URL test
      results[0].tests.push({
        name: 'Supabase URL',
        status: envValidation.config.supabaseUrl ? 'pass' : 'fail',
        message: envValidation.config.supabaseUrl ? 'Supabase URL configured' : 'Supabase URL missing',
        details: envValidation.config.supabaseUrl ? `URL: ${envValidation.config.supabaseUrl}` : null
      })

      // Supabase Key test
      results[0].tests.push({
        name: 'Supabase Anonymous Key',
        status: envValidation.config.supabaseAnonKey ? 'pass' : 'fail',
        message: envValidation.config.supabaseAnonKey ? 'Anonymous key configured' : 'Anonymous key missing'
      })

      // Password tests
      results[0].tests.push({
        name: 'Guest Password',
        status: envValidation.config.guestPassword ? 'pass' : 'warn',
        message: envValidation.config.guestPassword ? 'Guest password configured' : 'Guest password missing'
      })

      results[0].tests.push({
        name: 'Admin Password',
        status: envValidation.config.adminPassword ? 'pass' : 'warn',
        message: envValidation.config.adminPassword ? 'Admin password configured' : 'Admin password missing'
      })

      // Overall validation status
      results[0].tests.push({
        name: 'Overall Configuration',
        status: envValidation.isValid ? 'pass' : 'fail',
        message: envValidation.isValid ? 'All configuration valid' : 'Configuration has issues',
        details: envValidation.errors.length > 0 ? `Errors: ${envValidation.errors.length}` : null
      })

    } catch (error) {
      results[0].tests.push({
        name: 'Environment Validation',
        status: 'fail',
        message: 'Failed to validate environment',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Network Connectivity Tests
    results[1].tests.push({
      name: 'Internet Connection',
      status: isOnline ? 'pass' : 'fail',
      message: isOnline ? 'Online' : 'No internet connection',
      details: connectionType ? `Connection: ${connectionType}` : null
    })

    // DNS Resolution test
    try {
      const dnsStart = performance.now()
      await fetch('https://dns.google/resolve?name=supabase.co&type=A')
      const dnsTime = Math.round(performance.now() - dnsStart)
      
      results[1].tests.push({
        name: 'DNS Resolution',
        status: 'pass',
        message: 'DNS resolution working',
        details: `Response time: ${dnsTime}ms`
      })
    } catch (error) {
      results[1].tests.push({
        name: 'DNS Resolution',
        status: 'fail',
        message: 'DNS resolution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Supabase Services Tests
    try {
      const healthCheck: SupabaseHealthCheck = await checkSupabaseHealth()
      
      results[2].tests.push({
        name: 'Supabase REST API',
        status: healthCheck.isHealthy ? 'pass' : 'fail',
        message: healthCheck.isHealthy ? 'API accessible' : 'API not accessible',
        details: healthCheck.latency ? `Latency: ${healthCheck.latency}ms` : (healthCheck.error || null)
      })

      if (healthCheck.isHealthy && healthCheck.latency) {
        const latencyStatus = healthCheck.latency < 500 ? 'pass' : 
                            healthCheck.latency < 1000 ? 'warn' : 'fail'
        
        results[2].tests.push({
          name: 'API Performance',
          status: latencyStatus,
          message: `Response time: ${healthCheck.latency}ms`,
          details: latencyStatus === 'pass' ? 'Excellent' :
                  latencyStatus === 'warn' ? 'Acceptable' : 'Poor performance'
        })
      }

    } catch (error) {
      results[2].tests.push({
        name: 'Supabase REST API',
        status: 'fail',
        message: 'Failed to check Supabase health',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Real-time Features Tests
    try {
      const realtimeStatus = getStatus()
      
      results[3].tests.push({
        name: 'Real-time Connection',
        status: realtimeStatus.status === 'connected' ? 'pass' : 
               realtimeStatus.status === 'connecting' ? 'warn' : 'fail',
        message: `Status: ${realtimeStatus.status}`,
        details: realtimeStatus.error || (realtimeStatus.latency ? `Latency: ${realtimeStatus.latency}ms` : null)
      })

      results[3].tests.push({
        name: 'Connection Quality',
        status: realtimeStatus.quality === 'excellent' ? 'pass' :
               realtimeStatus.quality === 'good' ? 'warn' : 'fail',
        message: `Quality: ${realtimeStatus.quality}`,
        details: realtimeStatus.retryCount > 0 ? `Retry attempts: ${realtimeStatus.retryCount}` : null
      })

      // Test real-time connectivity
      const canConnect = await testConnection()
      results[3].tests.push({
        name: 'WebSocket Support',
        status: canConnect ? 'pass' : 'fail',
        message: canConnect ? 'WebSocket connections working' : 'WebSocket connections blocked'
      })

    } catch (error) {
      results[3].tests.push({
        name: 'Real-time Features',
        status: 'fail',
        message: 'Failed to test real-time features',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Browser Compatibility Tests
    const userAgent = navigator.userAgent
    const isModernBrowser = 'fetch' in window && 'Promise' in window && 'WebSocket' in window

    results[4].tests.push({
      name: 'Modern Browser Features',
      status: isModernBrowser ? 'pass' : 'fail',
      message: isModernBrowser ? 'Browser supports required features' : 'Browser lacks required features',
      details: `User Agent: ${userAgent}`
    })

    // Local Storage test
    try {
      localStorage.setItem('diagnostic-test', 'test')
      localStorage.removeItem('diagnostic-test')
      
      results[4].tests.push({
        name: 'Local Storage',
        status: 'pass',
        message: 'Local storage available'
      })
    } catch (error) {
      results[4].tests.push({
        name: 'Local Storage',
        status: 'fail',
        message: 'Local storage not available',
        details: 'Required for application state'
      })
    }

    // JavaScript features test
    const hasAsyncAwait = (async () => {})().constructor === Promise
    results[4].tests.push({
      name: 'JavaScript ES2017+',
      status: hasAsyncAwait ? 'pass' : 'fail',
      message: hasAsyncAwait ? 'Modern JavaScript features available' : 'Browser outdated'
    })

    setDiagnostics(results)
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pass':
        return '✅'
      case 'warn':
        return '⚠️'
      case 'fail':
        return '❌'
      case 'loading':
        return '⏳'
      default:
        return '❓'
    }
  }

  const getStatusColor = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-600'
      case 'warn':
        return 'text-yellow-600'
      case 'fail':
        return 'text-red-600'
      case 'loading':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const generateReport = () => {
    const timestamp = new Date().toISOString()
    const report = {
      timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      diagnostics
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `system-diagnostics-${timestamp.slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const summary = diagnostics.map(section => {
      const passed = section.tests.filter(t => t.status === 'pass').length
      const total = section.tests.length
      return `${section.name}: ${passed}/${total} tests passed`
    }).join('\n')

    navigator.clipboard.writeText(summary).then(() => {
      alert('Diagnostic summary copied to clipboard')
    })
  }

  const totalTests = diagnostics.reduce((sum, section) => sum + section.tests.length, 0)
  const passedTests = diagnostics.reduce((sum, section) => 
    sum + section.tests.filter(test => test.status === 'pass').length, 0
  )
  const failedTests = diagnostics.reduce((sum, section) => 
    sum + section.tests.filter(test => test.status === 'fail').length, 0
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">System Diagnostics</h2>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive system health and configuration check
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isRunning ? 'Running...' : 'Run Diagnostics'}
            </button>
            
            {diagnostics.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Copy Summary
                </button>
                
                <button
                  onClick={generateReport}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Download Report
                </button>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        {diagnostics.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Test Results:</span>
              <div className="flex gap-4">
                <span className="text-green-600">✅ {passedTests} passed</span>
                <span className="text-red-600">❌ {failedTests} failed</span>
                <span className="text-gray-600">Total: {totalTests}</span>
              </div>
            </div>
            
            {lastRun && (
              <div className="text-xs text-gray-500 mt-2">
                Last run: {lastRun.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Diagnostic Sections */}
        <div className="space-y-6">
          {diagnostics.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">{section.name}</h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {section.tests.map((test, testIndex) => (
                    <div key={testIndex} className="flex items-start gap-3">
                      <span className="text-lg">
                        {getStatusIcon(test.status)}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {test.name}
                          </span>
                          <span className={`text-sm ${getStatusColor(test.status)}`}>
                            {test.message}
                          </span>
                        </div>
                        
                        {test.details && (
                          <div className="text-xs text-gray-500 mt-1">
                            {test.details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isRunning && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Running diagnostics...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}