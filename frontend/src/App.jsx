import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Piezas from './pages/Piezas.jsx'
import Maniquies from './pages/Maniquies.jsx'

export default function App() {
  return (
    <div className="layout">
      <Navbar />
      <Routes>
        <Route path="/"          element={<Navigate to="/piezas" replace />} />
        <Route path="/piezas"    element={<Piezas />} />
        <Route path="/maniquies" element={<Maniquies />} />
      </Routes>
    </div>
  )
}
