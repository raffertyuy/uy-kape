import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import WelcomePage from './pages/WelcomePage'
import GuestModule from './pages/GuestModule'
import BaristaModule from './pages/BaristaModule'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'
import { ToastProvider } from './hooks/useToast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ErrorContextProvider } from './contexts/ErrorContext'
import { GlobalErrorNotification } from './components/ui/GlobalErrorNotification'
import { useErrorToast } from './hooks/useErrorToast'
import { ErrorHandlingPanel } from './components/dev/ErrorHandlingPanel'
import { usePageTracking } from './hooks/usePageTracking'

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
                  <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/order" element={<GuestModule />} />
                    <Route path="/admin" element={<BaristaModule />} />
                    <Route path="/error" element={<ServerError />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ErrorToastIntegration>
            </BrowserRouter>
          </ToastProvider>
        </ErrorContextProvider>
      </ErrorBoundary>
    </div>
  )
}

export default App