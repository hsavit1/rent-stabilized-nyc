import { useState, useRef, useEffect } from 'react'
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Outlet,
  Link,
  useMatches,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { useSession, signOut } from '../lib/auth-client'
import '../index.css'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'NYC Rent Stabilized Buildings' },
      { name: 'description', content: 'Explore 46,000+ rent-stabilized buildings across all five boroughs of New York City' },
    ],
    links: [
      { rel: 'icon', href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏢</text></svg>" },
    ],
  }),
  component: RootComponent,
})

const NAV_ITEMS = [
  {
    to: '/' as const,
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    to: '/map' as const,
    label: 'Map',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0-8.25a2.25 2.25 0 112.25 2.25H9m0-2.25V15m0 0a2.25 2.25 0 10-2.25 2.25H9m0-2.25V15m12-12l-4.5 1.636M21 3l-4.5 1.636M21 3v11.25M3 3v11.25m0 0l4.5-1.636M3 14.25l4.5-1.636m0 0L12 10.5m-4.5 2.114L12 10.5m0 0l4.5 2.114M12 10.5V21m4.5-9.386L21 14.25" />
      </svg>
    ),
  },
  {
    to: '/search' as const,
    label: 'Search',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    to: '/lotteries' as const,
    label: 'Lotteries',
    green: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    to: '/browse' as const,
    label: 'Browse Listings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
]

const AUTH_NAV_ITEMS = [
  {
    to: '/dashboard' as const,
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
]

const BOTTOM_NAV_ITEMS = [
  {
    to: '/about' as const,
    label: 'About',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
]

function RootComponent() {
  const { data: session, isPending } = useSession()
  const isLoggedIn = !!session?.user
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const matches = useMatches()

  // Check if current route is the full-screen map page
  const isMapPage = matches.some((m) => m.fullPath === '/map')

  // Close sidebar on click outside (mobile)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false)
      }
    }
    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen])

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [matches])

  const allNavItems = [
    ...NAV_ITEMS,
    ...(isLoggedIn ? AUTH_NAV_ITEMS : []),
  ]

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-gray-950 text-gray-100">
          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar — fixed to viewport on all screen sizes */}
          <aside
            ref={sidebarRef}
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-800 shrink-0">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-gray-950 font-bold text-sm group-hover:bg-amber-400 transition-colors">
                  RS
                </div>
                <span className="font-semibold text-sm tracking-tight text-white">
                  NYC Rent Stabilized
                </span>
              </Link>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {allNavItems.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    'green' in link && link.green
                      ? 'text-green-400 hover:text-green-300 hover:bg-gray-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  activeProps={{
                    className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-800/70 ${
                      'green' in link && link.green ? 'text-green-400' : 'text-amber-400'
                    }`,
                  }}
                  activeOptions={{ exact: link.to === '/' }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-gray-800 px-3 py-3 space-y-1">
              {BOTTOM_NAV_ITEMS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  activeProps={{
                    className: 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-800/70 text-amber-400',
                  }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {/* User */}
              {!isPending && (
                isLoggedIn ? (
                  <UserSection user={session!.user} />
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign In
                  </Link>
                )
              )}
            </div>
          </aside>

          {/* Main content — offset by sidebar width on desktop */}
          <div className="flex-1 flex flex-col min-w-0 isolate lg:ml-64">
            {/* Mobile header */}
            <header className="lg:hidden sticky top-0 z-30 h-14 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 flex items-center px-4 gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center text-gray-950 font-bold text-xs">
                  RS
                </div>
                <span className="font-semibold text-sm text-white">NYC Rent Stabilized</span>
              </Link>
            </header>

            <main className={isMapPage ? 'flex-1' : ''}>
              <Outlet />
            </main>

            {!isMapPage && (
              <footer className="border-t border-gray-800 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                  <p>
                    Data from NYC Rent Guidelines Board & DHCR.
                    Building counts reflect tax lot registrations.
                  </p>
                  <p className="mt-1">
                    Not an official government website. Data may not reflect current status.
                  </p>
                </div>
              </footer>
            )}
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

function UserSection({ user }: { user: { name: string; email: string; image?: string | null } }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = (user.name || user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join('')

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-[11px] font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="truncate text-sm text-white">{user.name}</p>
        </div>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-800">
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={async () => {
              setOpen(false)
              await signOut()
              window.location.href = '/'
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
