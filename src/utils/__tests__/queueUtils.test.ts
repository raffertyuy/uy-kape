import { describe, it, expect, vi } from 'vitest'
import { calculateEstimatedTime, formatQueuePosition, getQueueUrgency } from '../queueUtils'

// Mock the app config
vi.mock('@/config/app.config', () => ({
  appConfig: {
    waitTimePerOrder: 5
  }
}))

describe('queueUtils', () => {
  describe('calculateEstimatedTime', () => {
    it('should return "Ready" for position 0 or less', () => {
      expect(calculateEstimatedTime(0)).toBe('Ready')
      expect(calculateEstimatedTime(-1)).toBe('Ready')
    })

    it('should use default wait time from config', () => {
      expect(calculateEstimatedTime(1)).toBe('5 min')
      expect(calculateEstimatedTime(2)).toBe('10 min')
      expect(calculateEstimatedTime(3)).toBe('15 min')
    })

    it('should accept custom wait time parameter', () => {
      expect(calculateEstimatedTime(1, 3)).toBe('3 min')
      expect(calculateEstimatedTime(2, 7)).toBe('14 min')
      expect(calculateEstimatedTime(4, 2)).toBe('8 min')
    })

    it('should format hours correctly for long wait times', () => {
      expect(calculateEstimatedTime(12, 5)).toBe('1h') // 60 minutes
      expect(calculateEstimatedTime(13, 5)).toBe('1h 5m') // 65 minutes
      expect(calculateEstimatedTime(24, 5)).toBe('2h') // 120 minutes
      expect(calculateEstimatedTime(25, 5)).toBe('2h 5m') // 125 minutes
    })

    it('should handle edge cases', () => {
      expect(calculateEstimatedTime(1, 0)).toBe('0 min')
      expect(calculateEstimatedTime(0, 10)).toBe('Ready')
    })
  })

  describe('formatQueuePosition', () => {
    it('should return "Not in queue" for position 0 or less', () => {
      expect(formatQueuePosition(0)).toBe('Not in queue')
      expect(formatQueuePosition(-1)).toBe('Not in queue')
    })

    it('should format position without total', () => {
      expect(formatQueuePosition(1)).toBe('#1')
      expect(formatQueuePosition(5)).toBe('#5')
      expect(formatQueuePosition(10)).toBe('#10')
    })

    it('should format position with total', () => {
      expect(formatQueuePosition(1, 5)).toBe('1 of 5')
      expect(formatQueuePosition(3, 10)).toBe('3 of 10')
      expect(formatQueuePosition(7, 15)).toBe('7 of 15')
    })
  })

  describe('getQueueUrgency', () => {
    it('should return "normal" for reasonable wait times and position > 3', () => {
      expect(getQueueUrgency(4, 5)).toBe('normal')
      expect(getQueueUrgency(5, 10)).toBe('normal')
      expect(getQueueUrgency(6, 15)).toBe('normal')
    })

    it('should return "high" for position <= 3 or wait time > 15', () => {
      expect(getQueueUrgency(1, 10)).toBe('high') // position <= 3
      expect(getQueueUrgency(2, 5)).toBe('high') // position <= 3
      expect(getQueueUrgency(3, 15)).toBe('high') // position <= 3
      expect(getQueueUrgency(5, 20)).toBe('high') // wait time > 15
    })

    it('should return "urgent" for wait time > 30', () => {
      expect(getQueueUrgency(1, 35)).toBe('urgent')
      expect(getQueueUrgency(5, 45)).toBe('urgent')
      expect(getQueueUrgency(10, 60)).toBe('urgent')
    })

    it('should prioritize urgent over high', () => {
      expect(getQueueUrgency(1, 35)).toBe('urgent') // Both position <= 3 and wait > 30
      expect(getQueueUrgency(2, 40)).toBe('urgent')
    })
  })
})