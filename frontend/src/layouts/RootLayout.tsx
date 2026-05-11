import { NavLink, Outlet } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard', end: false },
  { to: '/settings', label: 'Settings', end: false },
]

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <nav className="flex border-t border-[var(--border)] sticky bottom-0 bg-[var(--bg)]">
        {navLinks.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm transition-colors ${
                isActive
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--text)] hover:text-[var(--text-h)]'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
