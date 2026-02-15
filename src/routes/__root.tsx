import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Outlet,
  Link,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
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

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-gray-950 text-gray-100">
          <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-gray-950 font-bold text-sm group-hover:bg-amber-400 transition-colors">
                    RS
                  </div>
                  <span className="font-semibold text-lg tracking-tight hidden sm:block">
                    NYC Rent Stabilized
                  </span>
                </Link>
                <div className="flex items-center gap-1">
                  {[
                    { to: '/' as const, label: 'Home' },
                    { to: '/search' as const, label: 'Search' },
                    { to: '/map' as const, label: 'Map' },
                    { to: '/pricing' as const, label: 'Pricing' },
                    { to: '/about' as const, label: 'About' },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      activeProps={{ className: 'px-3 py-2 rounded-md text-sm font-medium text-amber-400 bg-gray-800/50' }}
                      activeOptions={{ exact: link.to === '/' }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
          <main>
            <Outlet />
          </main>
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
        </div>
        <Scripts />
      </body>
    </html>
  )
}
