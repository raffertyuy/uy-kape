import type { MenuChange } from '@/hooks/useMenuSubscriptions'

export interface ConflictResolution {
  action: 'accept_remote' | 'keep_local' | 'merge' | 'manual'
  data?: any
  reason?: string
}

export interface ConflictContext {
  localData: any
  remoteData: any
  change: MenuChange
  timestamp: Date
}

/**
 * Automatic conflict resolution strategies for menu items
 */
export class ConflictResolver {
  /**
   * Detect if a conflict exists between local and remote data
   */
  static detectConflict(local: any, _remote: any, change: MenuChange): boolean {
    // No conflict if local data doesn't exist (new item)
    if (!local) return false
    
    // Conflict if both have been modified recently
    const localModified = new Date(local.updated_at || local.created_at)
    const changeTime = change.timestamp
    
    // Consider it a conflict if local was modified within 30 seconds of remote change
    const timeDifference = Math.abs(localModified.getTime() - changeTime.getTime())
    return timeDifference < 30000 // 30 seconds
  }

  /**
   * Automatically resolve conflicts based on predefined strategies
   */
  static autoResolve(context: ConflictContext): ConflictResolution {
    const { localData, remoteData, change } = context
    
    // Strategy 1: Last writer wins for simple fields
    if (this.isSimpleFieldUpdate(change)) {
      return {
        action: 'accept_remote',
        data: remoteData,
        reason: 'Last writer wins for simple field updates'
      }
    }
    
    // Strategy 2: Merge non-conflicting fields
    if (this.canMergeFields(localData, remoteData)) {
      const merged = this.mergeData(localData, remoteData)
      return {
        action: 'merge',
        data: merged,
        reason: 'Merged non-conflicting fields'
      }
    }
    
    // Strategy 3: Prefer remote for structural changes (categories, ordering)
    if (this.isStructuralChange(change)) {
      return {
        action: 'accept_remote',
        data: remoteData,
        reason: 'Remote takes priority for structural changes'
      }
    }
    
    // Default: Manual resolution required
    return {
      action: 'manual',
      reason: 'Complex conflict requires manual resolution'
    }
  }

  /**
   * Check if this is a simple field update (name, description, etc.)
   */
  private static isSimpleFieldUpdate(change: MenuChange): boolean {
    if (change.event !== 'UPDATE') return false
    
    // Check if only simple fields were changed
    // This would require comparing old and new data
    return true // Simplified for now
  }

  /**
   * Check if local and remote data can be merged without conflicts
   */
  private static canMergeFields(local: any, remote: any): boolean {
    if (!local || !remote) return false
    
    // Compare critical fields that shouldn't be merged
    const criticalFields = ['id', 'display_order', 'category_id']
    
    for (const field of criticalFields) {
      if (local[field] !== remote[field]) {
        return false
      }
    }
    
    return true
  }

  /**
   * Merge local and remote data, preferring non-null values
   */
  private static mergeData(local: any, remote: any): any {
    const merged = { ...local }
    
    // Merge strategy: prefer non-null values, use most recent timestamp
    Object.keys(remote).forEach(key => {
      if (remote[key] !== null && remote[key] !== undefined) {
        // For timestamps, prefer more recent
        if (key.includes('_at')) {
          const localTime = new Date(local[key] || 0)
          const remoteTime = new Date(remote[key] || 0)
          merged[key] = remoteTime > localTime ? remote[key] : local[key]
        } else {
          // For other fields, prefer remote if different
          merged[key] = remote[key]
        }
      }
    })
    
    return merged
  }

  /**
   * Check if this is a structural change (ordering, relationships)
   */
  private static isStructuralChange(change: MenuChange): boolean {
    const structuralTables = ['drink_options', 'drink_categories']
    const structuralFields = ['display_order', 'category_id', 'option_category_id']
    
    if (structuralTables.includes(change.table)) {
      return true
    }
    
    // Check if structural fields were modified
    if (change.data) {
      return structuralFields.some(field => change.data.hasOwnProperty(field))
    }
    
    return false
  }

  /**
   * Generate user-friendly conflict description
   */
  static describeConflict(context: ConflictContext): string {
    const { change } = context
    const tableName = change.table.replace('_', ' ')
    const itemName = change.data?.name || change.data?.id || 'item'
    
    switch (change.event) {
      case 'UPDATE':
        return `The ${tableName} "${itemName}" was modified by another user while you were editing it.`
      case 'DELETE':
        return `The ${tableName} "${itemName}" was deleted by another user while you were editing it.`
      case 'INSERT':
        return `A new ${tableName} "${itemName}" was added that may conflict with your changes.`
      default:
        return `The ${tableName} "${itemName}" was changed by another user.`
    }
  }

  /**
   * Validate that a resolution is safe to apply
   */
  static validateResolution(resolution: ConflictResolution, context: ConflictContext): boolean {
    // Basic validation
    if (!resolution.action) return false
    
    // Ensure data is provided for data-changing actions
    if (['accept_remote', 'merge'].includes(resolution.action) && !resolution.data) {
      return false
    }
    
    // Validate merged data structure
    if (resolution.action === 'merge') {
      return this.isValidMergedData(resolution.data, context)
    }
    
    return true
  }

  /**
   * Check if merged data maintains required structure
   */
  private static isValidMergedData(data: any, context: ConflictContext): boolean {
    if (!data) return false
    
    // Ensure required fields are present
    const requiredFields = ['id']
    if (context.change.table === 'drinks') {
      requiredFields.push('name', 'category_id')
    } else if (context.change.table === 'drink_categories') {
      requiredFields.push('name')
    }
    
    return requiredFields.every(field => data.hasOwnProperty(field))
  }
}