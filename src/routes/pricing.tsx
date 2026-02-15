import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

const freeTierFeatures = [
  'Browse 46,000+ rent-stabilized buildings',
  'Search by address, owner, zip code, or BBL',
  'Filter by borough, zip code, and unit count',
  'Quick links to DHCR Building Search',
  'Quick links to StreetEasy listings',
  'Nearby buildings discovery',
]

const proTierFeatures = [
  'Live availability feed from StreetEasy, Craigslist, and broker sites',
  'Email and text alerts when units in watched buildings become available',
  'Historical rent data and trends',
  'Vacancy rate estimates by building',
  'Save and track favorite buildings',
  'Priority support',
]

function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Find Your Next{' '}
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Rent-Stabilized Apartment
          </span>
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          We're building tools to help you find available units in rent-stabilized buildings across NYC.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Tier */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Free</h2>
            <span className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
              Available Now
            </span>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">$0</span>
            <span className="text-gray-500 ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {freeTierFeatures.map(feature => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/search"
            className="block w-full text-center px-6 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors"
          >
            Start Searching
          </Link>
        </div>

        {/* Pro Tier */}
        <div className="bg-gray-900 border border-amber-500/30 rounded-xl p-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 text-xs font-bold bg-amber-500 text-gray-950 rounded-full uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Pro</h2>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">TBD</span>
            <span className="text-gray-500 ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {proTierFeatures.map(feature => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          <a
            href="mailto:hello@rentstabilized.nyc?subject=Pro%20Tier%20Interest"
            className="block w-full text-center px-6 py-3 rounded-lg bg-amber-500 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
          >
            Get Notified When It Launches
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              title: 'Browse Buildings',
              description: 'Search our database of 46,000+ rent-stabilized buildings across all five boroughs.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              ),
            },
            {
              title: 'Check Availability',
              description: 'Use our links to DHCR and StreetEasy to check which buildings have current vacancies.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              ),
            },
            {
              title: 'Get Alerts (Soon)',
              description: 'The Pro tier will aggregate listings and alert you when units become available in your target buildings.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              ),
            },
          ].map(item => (
            <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
