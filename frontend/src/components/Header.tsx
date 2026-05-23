import { Link, NavLink } from 'react-router-dom'
import ActivityIndicator from './ActivityIndicator'

const TAB_BASE = 'h-full px-3 text-[13px] border-b-2 relative top-px flex items-center gap-1 transition-colors whitespace-nowrap'
const TAB_ACTIVE = 'text-[var(--accent)] border-[var(--accent)] font-medium'
const TAB_IDLE = 'text-[var(--text)] border-transparent hover:text-[var(--text-h)]'

const DROP_ITEM_BASE = 'block w-full px-2.5 py-[7px] text-left text-[13px] rounded-md transition-colors whitespace-nowrap'
const DROP_ITEM_ACTIVE = 'text-[var(--accent)] font-medium'
const DROP_ITEM_IDLE = 'text-[var(--text)] hover:bg-[var(--bg2)] hover:text-[var(--text-h)]'

function tabClass({ isActive }: { isActive: boolean }) {
  return `${TAB_BASE} ${isActive ? TAB_ACTIVE : TAB_IDLE}`
}

function dropClass({ isActive }: { isActive: boolean }) {
  return `${DROP_ITEM_BASE} ${isActive ? DROP_ITEM_ACTIVE : DROP_ITEM_IDLE}`
}

const LIBRARY_LINKS = [
  { to: '/library/favourites',  label: 'Favourites'   },
  { to: '/library/collections', label: 'Collections'  },
  { to: '/library/tags',        label: 'Tags'          },
  { to: '/library/comments',    label: 'Comments'      },
  { to: '/library/history',     label: 'View History'  },
]

const DASHBOARD_LINKS = [
  { to: '/dashboard/backend',   label: 'Backend'   },
  { to: '/dashboard/configure', label: 'Configure' },
  { to: '/dashboard/settings',  label: 'Settings'  },
  { to: '/dashboard/logs',      label: 'Logs'      },
]

function DropdownPanel({ links, alignRight = false }: { links: typeof LIBRARY_LINKS; alignRight?: boolean }) {
  return (
    <div
      className={`absolute top-full z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 ${alignRight ? 'right-0' : 'left-0'}`}
    >
      {/* 4px invisible bridge so cursor can travel into the panel without the hover dropping */}
      <div className="h-1 w-full" />
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg p-1 min-w-36">
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} className={dropClass}>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default function Header() {
  return (
    <header
      style={{ height: 'var(--header-h)' }}
      className="border-b border-[var(--border)] flex items-stretch flex-shrink-0 bg-[var(--bg)] relative z-[100]"
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center px-3.5 no-underline flex-shrink-0 hover:opacity-90 transition-opacity"
      >
        <span className="text-[18px] font-bold tracking-tight text-[var(--accent)]">CandyPop</span>
        <span className="text-[18px] font-medium tracking-tight text-[var(--text-h)] opacity-60 ml-1.5">Gallery</span>
      </Link>

      <div className="w-px bg-[var(--border)] my-2.5 flex-shrink-0" />

      {/* Left nav */}
      <nav className="flex items-stretch px-1 flex-1 min-w-0">
        <NavLink to="/" end className={tabClass}>Home</NavLink>
        <NavLink to="/posts" className={tabClass}>Posts</NavLink>
        <NavLink to="/media" className={tabClass}>Media</NavLink>
        <NavLink to="/discover" className={tabClass}>Discover</NavLink>

        {/* Library with dropdown */}
        <div className="group relative flex items-stretch">
          <NavLink to="/library" className={tabClass}>
            Library
            <span className="text-[9px] opacity-40 group-hover:rotate-180 transition-transform duration-150 inline-block">▾</span>
          </NavLink>
          <DropdownPanel links={LIBRARY_LINKS} />
        </div>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-1 px-2.5 flex-shrink-0">
        <button
          className="w-[30px] h-[30px] border border-[var(--border)] rounded-md flex items-center justify-center text-[var(--text)] text-sm hover:bg-[var(--bg2)] hover:text-[var(--text-h)] hover:border-[var(--text)] transition-colors cursor-pointer bg-transparent"
          title="Quick scan"
        >
          ↺
        </button>

        <ActivityIndicator />

        {/* Dashboard pill with dropdown */}
        <div className="group relative flex items-center">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `h-[30px] px-3 border rounded-md flex items-center gap-1 text-[13px] transition-colors ` +
              (isActive
                ? 'bg-[var(--accent-bg)] text-[var(--accent)] border-[var(--accent-border)] font-medium'
                : 'text-[var(--text)] border-[var(--border)] hover:bg-[var(--bg2)] hover:text-[var(--text-h)]')
            }
          >
            Dashboard
            <span className="text-[9px] opacity-40 group-hover:rotate-180 transition-transform duration-150 inline-block">▾</span>
          </NavLink>
          <DropdownPanel links={DASHBOARD_LINKS} alignRight />
        </div>
      </div>
    </header>
  )
}
