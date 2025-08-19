import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import WelcomePage from './pages/WelcomePage'
import GuestModule from './pages/GuestModule'
import BaristaModule from './pages/BaristaModule'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/order" element={<GuestModule />} />
          <Route path="/admin" element={<BaristaModule />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App