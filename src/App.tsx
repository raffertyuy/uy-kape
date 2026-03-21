import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import WelcomePage from './pages/WelcomePage'
import { ToastProvider } from './hooks/useToast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ErrorContextProvider } from './contexts/ErrorContext'
import { HackedModeProvider } from './contexts/HackedModeContext'
import { GlobalErrorNotification } from './components/ui/GlobalErrorNotification'
import { useErrorToast } from './hooks/useErrorToast'
import { ErrorHandlingPanel } from './components/dev/ErrorHandlingPanel'
import { usePageTracking } from './hooks/usePageTracking'

// Lazy-loaded page routes — each gets its own chunk so users only download what they visit
const GuestModule = lazy(() => import('./pages/GuestModule'))
const BaristaModule = lazy(() => import('./pages/BaristaModule'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ServerError = lazy(() => import('./pages/ServerError'))

/** Minimal loading fallback shown while a lazy route chunk is being fetched */
const RouteLoadingFallback: React.FC = () => (
  <div
    className="flex items-center justify-center min-h-[50vh]"
    role="status"
    aria-label="Loading page"
  >
    <div className="text-center">
      <div className="coffee-loading text-4xl mb-2" aria-hidden="true">☕</div>
      <p className="text-coffee-600 text-sm">Loading...</p>
    </div>
  </div>
)

// Component to handle error toast integration and page tracking
const ErrorToastIntegration: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useErrorToast() // This hook automatically shows toasts for errors
  usePageTracking() // This hook automatically tracks page views with Google Analytics
  return <>{children}</>
}

function App() {
  return (
    <div data-testid="app-loaded">
      <ErrorBoundary>
        <HackedModeProvider>
          <ErrorContextProvider>
          <ToastProvider>
            <GlobalErrorNotification />
            <ErrorHandlingPanel />
            <BrowserRouter future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}>
              <ErrorToastIntegration>
                <Layout>
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<WelcomePage />} />
                      <Route path="/order" element={<GuestModule />} />
                      <Route path="/admin" element={<BaristaModule />} />
                      <Route path="/error" element={<ServerError />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </ErrorToastIntegration>
            </BrowserRouter>
          </ToastProvider>
          </ErrorContextProvider>
        </HackedModeProvider>
      </ErrorBoundary>
    </div>
  )
}

export default App