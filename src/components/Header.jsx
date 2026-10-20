// Top bar: the Onramp brand plus the toggle that flips between the two sides of the demo.
import { Link, useLocation } from 'react-router-dom'
import { useSession } from '../data/store.js'

export default function Header() {
  const { pathname } = useLocation()
  const isManager = pathname.startsWith('/manager')
  const [session] = useSession()

  return (
    <header className="header">
      <Link to="/" className="brand">
        <span className="brand-mark">▲</span> Onramp
      </Link>
      {!isManager && session.inquiryId && (
        <Link to="/messages" className={pathname === '/messages' ? 'header-link active' : 'header-link'}>Messages</Link>
      )}
      <nav className="view-toggle" aria-label="Switch view">
        <Link to="/" className={isManager ? '' : 'active'}>Tenant</Link>
        <Link to="/manager" className={isManager ? 'active' : ''}>Property Manager</Link>
      </nav>
    </header>
  )
}
