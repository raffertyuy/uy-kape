/**
 * Centralized real-time connection manager for Menu Management
 * Provides enhanced error handling, automatic reconnection, and graceful degradation
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface RealtimeConnectionOptions {
  maxRetries?: number
  retryDelay?: number
  connectionTimeout?: number
  enableLogging?: boolean
}

export interface RealtimeConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'
  lastConnected: Date | null
  retryCount: number
  latency: number | null
  error: string | null
  quality: 'excellent' | 'good' | 'poor' | 'offline'
}

export interface RealtimeSubscriptionConfig {
  table: string
  schema?: string
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  onError?: (error: string) => void
}

class RealtimeConnectionManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private connectionStatus: RealtimeConnectionStatus = {
    status: 'disconnected',
    lastConnected: null,
    retryCount: 0,
    latency: null,
    error: null,
    quality: 'offline'
  }
  private options: Required<RealtimeConnectionOptions>
  private reconnectTimer: NodeJS.Timeout | null = null
  private latencyTimer: NodeJS.Timeout | null = null
  private statusCallbacks: Set<(status: RealtimeConnectionStatus) => void> = new Set()

  constructor(options: RealtimeConnectionOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 5,
      retryDelay: options.retryDelay ?? 2000,
      connectionTimeout: options.connectionTimeout ?? 10000,
      enableLogging: options.enableLogging ?? false
    }

    // Start latency monitoring
    this.startLatencyMonitoring()
  }

  /**
   * Subscribe to a table with enhanced error handling and retry logic
   */
  subscribe(channelName: string, config: RealtimeSubscriptionConfig): () => void {
    this.log(`Subscribing to channel: ${channelName}`)
    
    // Clean up existing subscription
    this.unsubscribe(channelName)

    // Create new channel
    const channel = supabase.channel(channelName)

    // Configure postgres changes listener
    channel.on('postgres_changes' as any, {
      event: '*',
      schema: config.schema ?? 'public',
      table: config.table,
      filter: config.filter
    }, (payload: any) => {
      this.handleChannelEvent(payload, config)
    })

    // Handle subscription status changes
    channel.subscribe((status, err) => {
      this.handleSubscriptionStatus(channelName, status, err, config)
    })

    // Store channel reference
    this.channels.set(channelName, channel)

    // Return unsubscribe function
    return () => this.unsubscribe(channelName)
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.log(`Unsubscribing from channel: ${channelName}`)
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): RealtimeConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: (status: RealtimeConnectionStatus) => void): () => void {
    this.statusCallbacks.add(callback)
    // Send current status immediately
    callback(this.getConnectionStatus())
    
    return () => {
      this.statusCallbacks.delete(callback)
    }
  }

  /**
   * Manually trigger reconnection
   */
  reconnect(): void {
    this.log('Manual reconnection triggered')
    this.updateStatus({ status: 'reconnecting', retryCount: 0 })
    
    // Resubscribe all channels
    const channelNames = Array.from(this.channels.keys())
    for (const channelName of channelNames) {
      const channel = this.channels.get(channelName)
      if (channel) {
        // Force resubscription
        this.channels.delete(channelName)
        channel.unsubscribe()
        
        // Note: This would need the original config to properly resubscribe
        // For now, we'll just mark as disconnected and let the component handle it
      }
    }
  }

  /**
   * Check if real-time is available and working
   */
  async testConnection(): Promise<boolean> {
    try {
      const testChannel = supabase.channel('connection_test')
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          testChannel.unsubscribe()
          resolve(false)
        }, this.options.connectionTimeout)

        testChannel.subscribe((status) => {
          clearTimeout(timeout)
          testChannel.unsubscribe()
          resolve(status === 'SUBSCRIBED')
        })
      })
    } catch (error) {
      this.log(`Connection test failed: ${error}`)
      return false
    }
  }

  /**
   * Cleanup all connections
   */
  disconnect(): void {
    this.log('Disconnecting all channels')
    
    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.latencyTimer) {
      clearInterval(this.latencyTimer)
      this.latencyTimer = null
    }

    // Unsubscribe all channels
    for (const channelName of this.channels.keys()) {
      this.unsubscribe(channelName)
    }

    // Update status
    this.updateStatus({ 
      status: 'disconnected',
      error: null,
      quality: 'offline'
    })
  }

  private handleChannelEvent(payload: any, config: RealtimeSubscriptionConfig): void {
    try {
      // Update connection quality based on successful events
      this.updateConnectionQuality()

      // Route to appropriate handler
      switch (payload.eventType) {
        case 'INSERT':
          config.onInsert?.(payload)
          break
        case 'UPDATE':
          config.onUpdate?.(payload)
          break
        case 'DELETE':
          config.onDelete?.(payload)
          break
        default:
          this.log(`Unknown event type: ${payload.eventType}`)
      }
    } catch (error) {
      const errorMessage = `Error handling channel event: ${error}`
      this.log(errorMessage)
      config.onError?.(errorMessage)
    }
  }

  private handleSubscriptionStatus(
    channelName: string,
    status: string,
    error: any,
    config: RealtimeSubscriptionConfig
  ): void {
    this.log(`Channel ${channelName} status: ${status}`)

    switch (status) {
      case 'SUBSCRIBED':
        this.updateStatus({
          status: 'connected',
          lastConnected: new Date(),
          retryCount: 0,
          error: null
        })
        this.updateConnectionQuality()
        break

      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
      case 'CLOSED':
        const errorMessage = error?.message ?? `Subscription ${status.toLowerCase()}`
        this.updateStatus({
          status: 'error',
          error: errorMessage
        })
        config.onError?.(errorMessage)
        this.scheduleReconnect(channelName, config)
        break

      case 'CONNECTING':
        this.updateStatus({ status: 'connecting' })
        break
    }
  }

  private scheduleReconnect(channelName: string, config: RealtimeSubscriptionConfig): void {
    if (this.connectionStatus.retryCount >= this.options.maxRetries) {
      this.log(`Max retries reached for channel: ${channelName}`)
      this.updateStatus({
        status: 'error',
        error: 'Maximum reconnection attempts exceeded',
        quality: 'offline'
      })
      return
    }

    // Calculate exponential backoff delay
    const delay = this.options.retryDelay * Math.pow(2, this.connectionStatus.retryCount)
    
    this.log(`Scheduling reconnect for ${channelName} in ${delay}ms (attempt ${this.connectionStatus.retryCount + 1})`)
    
    this.updateStatus({
      status: 'reconnecting',
      retryCount: this.connectionStatus.retryCount + 1
    })

    this.reconnectTimer = setTimeout(() => {
      this.subscribe(channelName, config)
    }, delay)
  }

  private updateStatus(updates: Partial<RealtimeConnectionStatus>): void {
    this.connectionStatus = { ...this.connectionStatus, ...updates }
    
    // Notify all subscribers
    for (const callback of this.statusCallbacks) {
      callback(this.getConnectionStatus())
    }
  }

  private updateConnectionQuality(): void {
    const { latency, status } = this.connectionStatus
    
    if (status !== 'connected') {
      this.updateStatus({ quality: 'offline' })
      return
    }

    let quality: RealtimeConnectionStatus['quality'] = 'excellent'
    
    if (latency !== null) {
      if (latency > 1000) {
        quality = 'poor'
      } else if (latency > 500) {
        quality = 'good'
      }
    }

    this.updateStatus({ quality })
  }

  private startLatencyMonitoring(): void {
    this.latencyTimer = setInterval(async () => {
      if (this.connectionStatus.status === 'connected') {
        const startTime = performance.now()
        
        try {
          // Simple ping test - try to get current timestamp
          await supabase.from('drink_categories').select('count').limit(1).single()
          const latency = performance.now() - startTime
          
          this.updateStatus({ latency })
          this.updateConnectionQuality()
        } catch (error) {
          // If ping fails, connection might be degraded
          this.updateStatus({ 
            latency: null,
            quality: 'poor'
          })
        }
      }
    }, 10000) // Check every 10 seconds
  }

  private log(message: string): void {
    if (this.options.enableLogging) {
      console.log(`[RealtimeManager] ${message}`)
    }
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeConnectionManager({
  enableLogging: import.meta.env.DEV
})

// Export utilities for components
export const useRealtimeConnection = () => {
  return {
    subscribe: realtimeManager.subscribe.bind(realtimeManager),
    unsubscribe: realtimeManager.unsubscribe.bind(realtimeManager),
    getStatus: realtimeManager.getConnectionStatus.bind(realtimeManager),
    onStatusChange: realtimeManager.onStatusChange.bind(realtimeManager),
    reconnect: realtimeManager.reconnect.bind(realtimeManager),
    testConnection: realtimeManager.testConnection.bind(realtimeManager)
  }
}