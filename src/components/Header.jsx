// Top bar: the Onramp brand plus the toggle that flips between the two sides of the demo.
// Tenant pages are navigated from the sidebar, not from here.
import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const { pathname } = useLocation()
  const isManager = pathname.startsWith('/manager')

  return (
    <header className="header">
      <Link to="/" className="brand">
        <span className="brand-mark">▲</span> Onramp
      </Link>
      <nav className="view-toggle" aria-label="Switch view">
        <Link to="/" className={isManager ? '' : 'active'}>Tenant</Link>
        <Link to="/manager" className={isManager ? 'active' : ''}>Property Manager</Link>
      </nav>
    </header>
  )
}
