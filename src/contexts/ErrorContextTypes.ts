import { createContext } from 'react'
import type { ErrorDetails } from '../hooks/useErrorHandling'

export interface ErrorContextState {
  errors: ErrorDetails[]
  isGlobalError: boolean
  addError: (_error: unknown, _context?: string) => void
  clearError: (_id: string) => void
  clearAllErrors: () => void
  getLatestError: () => ErrorDetails | null
  hasErrors: boolean
}

export interface ErrorWithId extends ErrorDetails {
  id: string
}

export const ErrorContext = createContext<ErrorContextState | null>(null)