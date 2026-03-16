import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/list', label: 'Grid', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { to: '/analytics', label: 'Analytics', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = user?.username?.[0]?.toUpperCase() || 'U'

  return (
    <nav className="navbar">
      <Link to="/list" className="navbar-brand">
        <div className="dot" />
        Jotish <span style={{ color: 'var(--accent-light)' }}>Insights</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="btn btn-ghost btn-sm"
            style={{
              color: location.pathname.startsWith(link.to) ? 'var(--accent-light)' : 'var(--text-secondary)',
              borderColor: location.pathname.startsWith(link.to) ? 'var(--border-active)' : 'transparent',
              background: location.pathname.startsWith(link.to) ? 'rgba(99,102,241,0.1)' : 'transparent',
            }}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-actions">
        <div className="nav-user">
          <div className="nav-avatar">{initial}</div>
          <span style={{ fontSize: '0.82rem' }}>{user?.username}</span>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </nav>
  )
}
