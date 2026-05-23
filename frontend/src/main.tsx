import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, redirect, Navigate } from 'react-router-dom'
import './index.css'

import RootLayout from './layouts/RootLayout'
import SidebarLayout from './layouts/SidebarLayout'

import Home from './pages/Home'
import Posts from './pages/Posts'
import Media from './pages/Media'
import Discover from './pages/Discover'
import Setup from './pages/Setup'

import Favourites  from './pages/library/Favourites'
import Collections from './pages/library/Collections'
import Tags        from './pages/library/Tags'
import Comments    from './pages/library/Comments'
import ViewHistory from './pages/library/ViewHistory'

import Settings  from './pages/dashboard/Settings'
import Backend   from './pages/dashboard/Backend'
import Configure from './pages/dashboard/Configure'
import Logs      from './pages/dashboard/Logs'

const LIBRARY_LINKS = [
  { to: '/library/favourites',  label: 'Favourites',   icon: '♡' },
  { to: '/library/collections', label: 'Collections',  icon: '⊟' },
  { to: '/library/tags',        label: 'Tags',          icon: '#' },
  { to: '/library/comments',    label: 'Comments',      icon: '✎' },
  { to: '/library/history',     label: 'View History',  icon: '◷' },
]

const DASHBOARD_LINKS = [
  { to: '/dashboard/backend',   label: 'Backend',   icon: '⚡' },
  { to: '/dashboard/configure', label: 'Configure', icon: '⊟' },
  { to: '/dashboard/settings',  label: 'Settings',  icon: '⚙' },
  { to: '/dashboard/logs',      label: 'Logs',      icon: '≡' },
]

const router = createBrowserRouter([
  {
    path: '/setup',
    element: <Setup />,
  },
  {
    path: '/',
    id: 'root',
    element: <RootLayout />,
    loader: async () => {
      const res = await fetch('/admin/setup-complete')
      const { done } = await res.json()
      if (!done) return redirect('/setup')
      return { done: true }
    },
    children: [
      { index: true, element: <Home /> },
      { path: 'posts',    element: <Posts /> },
      { path: 'media',    element: <Media /> },
      { path: 'discover', element: <Discover /> },
      {
        path: 'library',
        element: <SidebarLayout links={LIBRARY_LINKS} />,
        children: [
          { index: true, element: <Navigate to="favourites" replace /> },
          { path: 'favourites',  element: <Favourites /> },
          { path: 'collections', element: <Collections /> },
          { path: 'tags',        element: <Tags /> },
          { path: 'comments',    element: <Comments /> },
          { path: 'history',     element: <ViewHistory /> },
        ],
      },
      {
        path: 'dashboard',
        element: <SidebarLayout links={DASHBOARD_LINKS} />,
        children: [
          { index: true, element: <Navigate to="settings" replace /> },
          { path: 'backend',   element: <Backend /> },
          { path: 'configure', element: <Configure /> },
          { path: 'settings',  element: <Settings /> },
          { path: 'logs',      element: <Logs /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
