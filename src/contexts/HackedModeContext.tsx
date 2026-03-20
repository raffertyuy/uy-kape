import React, { createContext, useState, useCallback, useEffect, useContext } from 'react'
import { getHackedMode, setHackedMode as persistHackedMode } from '@/services/appSettingsService'

// localStorage is used as a session cache to provide an instant initial render value
// and to avoid re-querying the DB on in-app navigation. The DB is the authoritative source
// and is read once on app load to reconcile the cache.
const STORAGE_KEY = 'uy-kape-hacked-mode'

interface HackedModeContextType {
  isHackedMode: boolean
  toggleHackedMode: () => Promise<void>
}

const HackedModeContext = createContext<HackedModeContextType | null>(null)

interface HackedModeProviderProps {
  children: React.ReactNode
}

export const HackedModeProvider: React.FC<HackedModeProviderProps> = ({ children }) => {
  const [isHackedMode, setHackedMode] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  )

  // Apply/remove the CSS class on the root element whenever state changes
  useEffect(() => {
    document.documentElement.classList.toggle('hacked-mode', isHackedMode)
  }, [isHackedMode])

  // One-time fetch on mount — reconcile with the authoritative DB value
  useEffect(() => {
    getHackedMode().then((dbValue) => {
      setHackedMode(dbValue)
      localStorage.setItem(STORAGE_KEY, String(dbValue))
    })
    // getHackedMode never throws — errors already handled inside the service
  }, [])

  const toggleHackedMode = useCallback(async () => {
    const next = !isHackedMode
    // Optimistic update
    setHackedMode(next)
    localStorage.setItem(STORAGE_KEY, String(next))

    try {
      await persistHackedMode(next)
    } catch (err) {
      // Revert optimistic update on DB failure — let the caller handle the error toast
      setHackedMode(!next)
      localStorage.setItem(STORAGE_KEY, String(!next))
      throw err
    }
  }, [isHackedMode])

  return (
    <HackedModeContext.Provider value={{ isHackedMode, toggleHackedMode }}>
      {children}
    </HackedModeContext.Provider>
  )
}

export const useHackedMode = (): HackedModeContextType => {
  const ctx = useContext(HackedModeContext)
  if (!ctx) throw new Error('useHackedMode must be used within HackedModeProvider')
  return ctx
}
