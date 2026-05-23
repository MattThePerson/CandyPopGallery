import { NavLink, Outlet } from 'react-router-dom'

type SidebarLink = {
  to: string
  label: string
  icon: string
}

type Props = {
  links: SidebarLink[]
}

export default function SidebarLayout({ links }: Props) {
  return (
    <>
      <aside
        style={{ width: 'var(--sidebar-w)' }}
        className="border-r border-[var(--border)] bg-[var(--bg)] flex-shrink-0 flex flex-col p-2 gap-0.5 overflow-y-auto"
      >
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-colors ` +
              (isActive
                ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-medium'
                : 'text-[var(--text)] hover:bg-[var(--bg2)] hover:text-[var(--text-h)]')
            }
          >
            <span className="w-4 text-center text-sm opacity-60 flex-shrink-0">{icon}</span>
            {label}
          </NavLink>
        ))}
      </aside>
      <div className="flex-1 overflow-y-auto p-7">
        <Outlet />
      </div>
    </>
  )
}
