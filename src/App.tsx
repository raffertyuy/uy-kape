import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import WelcomePage from './pages/WelcomePage'
import GuestModule from './pages/GuestModule'
import BaristaModule from './pages/BaristaModule'
import NotFound from './pages/NotFound'
import { ToastProvider } from './hooks/useToast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
          <Layout>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/order" element={<GuestModule />} />
              <Route path="/admin" element={<BaristaModule />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App