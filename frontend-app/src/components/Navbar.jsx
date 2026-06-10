import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">⬡ MANIQUÍES S.A.</NavLink>
      <div className="navbar-links">
        <NavLink to="/piezas"    className={({ isActive }) => isActive ? 'active' : ''}>Piezas</NavLink>
        <NavLink to="/maniquies" className={({ isActive }) => isActive ? 'active' : ''}>Maniquíes</NavLink>
      </div>
    </nav>
  )
}
