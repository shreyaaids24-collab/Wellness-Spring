import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/activity', label: 'Daily Activity', icon: '◎' },
  { to: '/history', label: 'History', icon: '☰' },
  { to: '/goals', label: 'Goals', icon: '◉' },
  { to: '/analytics', label: 'Analytics', icon: '▦' },
  { to: '/profile', label: 'Profile', icon: '☺' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">W</div>
          <div className="brand-text">
            <strong>WellSpring</strong>
            <span>Wellness Tracker</span>
          </div>
        </div>

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">{user?.name || user?.email}</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="mobile-topbar">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
            Menu
          </button>
          <strong>WellSpring</strong>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
