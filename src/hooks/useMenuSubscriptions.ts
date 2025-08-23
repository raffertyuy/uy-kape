import { useEffect, useState, useCallback } from 'react'
import { useRealtimeConnection, type RealtimeConnectionStatus } from '@/lib/realtime'

export interface MenuChange {
  table: string
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  data: any
  timestamp: Date
  userId?: string
}

// Legacy interface for backward compatibility
export interface ConnectionStatus {
  connected: boolean
  lastUpdate: Date | null
  error: string | null
}

// Enhanced connection status with real-time manager features
export interface EnhancedConnectionStatus extends ConnectionStatus {
  status: RealtimeConnectionStatus['status']
  retryCount: number
  latency: number | null
  quality: RealtimeConnectionStatus['quality']
}

export const useMenuSubscriptions = () => {
  const [connectionStatus, setConnectionStatus] = useState<EnhancedConnectionStatus>({
    connected: false,
    lastUpdate: null,
    error: null,
    status: 'disconnected',
    retryCount: 0,
    latency: null,
    quality: 'offline'
  })
  
  const [recentChanges, setRecentChanges] = useState<MenuChange[]>([])
  const [conflictItems, setConflictItems] = useState<Set<string>>(new Set())
  const [subscribed, setSubscribed] = useState(false)

  const { subscribe, onStatusChange, reconnect } = useRealtimeConnection()

  // Track external changes (not from current user)
  const handleExternalChange = useCallback((change: MenuChange) => {
    // Add to recent changes (keep last 10)
    setRecentChanges(prev => [change, ...prev].slice(0, 10))
    
    // Update connection status with last update time
    setConnectionStatus(prev => ({
      ...prev,
      lastUpdate: new Date(),
      connected: prev.status === 'connected'
    }))
  }, [])

  // Create change handler for each table
  const createChangeHandler = useCallback((tableName: string) => ({
    onInsert: (payload: any) => {
      const change: MenuChange = {
        table: tableName,
        event: 'INSERT',
        data: payload.new,
        timestamp: new Date()
      }
      handleExternalChange(change)
    },
    onUpdate: (payload: any) => {
      const change: MenuChange = {
        table: tableName,
        event: 'UPDATE',
        data: payload.new,
        timestamp: new Date()
      }
      handleExternalChange(change)
    },
    onDelete: (payload: any) => {
      const change: MenuChange = {
        table: tableName,
        event: 'DELETE',
        data: payload.old,
        timestamp: new Date()
      }
      handleExternalChange(change)
    },
    onError: (error: string) => {
      console.error(`Real-time error for ${tableName}:`, error)
      setConnectionStatus(prev => ({
        ...prev,
        error
      }))
    }
  }), [handleExternalChange])

  // Subscribe to real-time status changes
  useEffect(() => {
    const unsubscribeStatus = onStatusChange((status: RealtimeConnectionStatus) => {
      setConnectionStatus(prev => ({
        ...prev,
        connected: status.status === 'connected',
        error: status.error,
        status: status.status,
        retryCount: status.retryCount,
        latency: status.latency,
        quality: status.quality,
        lastUpdate: status.lastConnected || prev.lastUpdate
      }))
    })

    return unsubscribeStatus
  }, [onStatusChange])

  // Setup all subscriptions
  useEffect(() => {
    if (subscribed) return

    const unsubscribeFunctions: (() => void)[] = []

    // Subscribe to all menu-related tables
    const tables = [
      'drink_categories',
      'drinks', 
      'option_categories',
      'option_values',
      'drink_options'
    ]

    for (const table of tables) {
      const unsubscribeTable = subscribe(`${table}_realtime`, {
        table,
        ...createChangeHandler(table)
      })
      unsubscribeFunctions.push(unsubscribeTable)
    }

    setSubscribed(true)

    return () => {
      for (const unsub of unsubscribeFunctions) {
        unsub()
      }
      setSubscribed(false)
    }
  }, [subscribe, createChangeHandler, subscribed])

  // Add conflict detection
  const markAsConflicted = useCallback((itemId: string) => {
    setConflictItems(prev => new Set(prev).add(itemId))
  }, [])

  const resolveConflict = useCallback((itemId: string) => {
    setConflictItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
  }, [])

  // Clear old changes
  const clearRecentChanges = useCallback(() => {
    setRecentChanges([])
  }, [])

  // Manual reconnection
  const handleReconnect = useCallback(() => {
    reconnect()
  }, [reconnect])

  return {
    connectionStatus,
    recentChanges,
    conflictItems,
    markAsConflicted,
    resolveConflict,
    clearRecentChanges,
    reconnect: handleReconnect
  }
}