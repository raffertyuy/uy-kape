import { appConfig } from '@/config/app.config'

// Helper function to calculate estimated time based on position
export const calculateEstimatedTime = (position: number, averageTimePerOrder?: number): string => {
  const waitTime = averageTimePerOrder ?? appConfig.waitTimePerOrder
  
  if (position <= 0) return 'Ready'
  
  const minutes = position * waitTime
  
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

// Helper function to format queue position display
export const formatQueuePosition = (position: number, total?: number): string => {
  if (position <= 0) return 'Not in queue'
  return total ? `${position} of ${total}` : `#${position}`
}

// Helper function to determine queue urgency level
export const getQueueUrgency = (position: number, waitTime: number): 'normal' | 'high' | 'urgent' => {
  if (waitTime > 30) return 'urgent'
  if (waitTime > 15 || position <= 3) return 'high'
  return 'normal'
}