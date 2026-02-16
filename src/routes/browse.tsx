import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scrapedListingsOptions, scrapedListingCountOptions } from '../data/scraped-listing-queries'
import { createSavedListing } from '../data/listings'
import { useSession } from '../lib/auth-client'
import type { ScrapedListing } from '../data/scraped-listings'
import type { ListingType } from '../types/kanban'

export const Route = createFileRoute('/browse')({
  component: BrowsePage,
})

const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']
const BEDROOMS = [
  { value: '', label: 'Any Beds' },
  { value: '0', label: 'Studio' },
  { value: '1', label: '1 Bed' },
  { value: '2', label: '2 Beds' },
  { value: '3', label: '3 Beds' },
  { value: '4', label: '4+ Beds' },
]

function BrowsePage() {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const queryClient = useQueryClient()

  const [source, setSource] = useState('')
  const [borough, setBorough] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(0)
  const limit = 30

  const filters = useMemo(() => ({
    source: source || undefined,
    borough: borough || undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    onlyAffordable: true,
    limit,
    offset: page * limit,
  }), [source, borough, bedrooms, minPrice, maxPrice, page])

  const { data: listings, isPending } = useQuery(scrapedListingsOptions(filters))
  const { data: counts } = useQuery(scrapedListingCountOptions())

  const saveMutation = useMutation({
    mutationFn: (listing: ScrapedListing) =>
      createSavedListing({
        data: {
          url: listing.url,
          title: listing.title,
          listingType: listing.source as ListingType,
          price: listing.price,
          bedrooms: listing.bedrooms,
          neighborhood: listing.neighborhood ?? undefined,
          borough: listing.borough ?? undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-listings'] })
    },
  })

  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set())

  const handleSave = (listing: ScrapedListing) => {
    saveMutation.mutate(listing)
    setSavedUrls(prev => new Set([...prev, listing.url]))
  }

  const activeCount = Number(counts?.active_count ?? 0)
  const clCount = Number(counts?.craigslist_count ?? 0)
  const lbCount = Number(counts?.leasebreak_count ?? 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Browse Listings</h1>
        <p className="text-gray-400 mt-1">
          Curated affordable listings from Craigslist & LeaseBreak.
          {activeCount > 0 && (
            <span className="text-amber-400 font-medium"> {activeCount.toLocaleString()} curated listings</span>
          )}
        </p>
      </div>

      {/* Source tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { value: '', label: 'All', count: activeCount },
          { value: 'craigslist', label: 'Craigslist', count: clCount },
          { value: 'leasebreak', label: 'LeaseBreak', count: lbCount },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setSource(tab.value); setPage(0) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              source === tab.value
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={borough}
          onChange={e => { setBorough(e.target.value); setPage(0) }}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All Boroughs</option>
          {BOROUGHS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select
          value={bedrooms}
          onChange={e => { setBedrooms(e.target.value); setPage(0) }}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-amber-500/50"
        >
          {BEDROOMS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={minPrice}
            onChange={e => { setMinPrice(e.target.value); setPage(0) }}
            className="w-24 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-amber-500/50"
          />
          <span className="text-gray-600">-</span>
          <input
            type="number"
            placeholder="Max $"
            value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); setPage(0) }}
            className="w-24 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {(borough || bedrooms || minPrice || maxPrice) && (
          <button
            onClick={() => { setBorough(''); setBedrooms(''); setMinPrice(''); setMaxPrice(''); setPage(0) }}
            className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading */}
      {isPending && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-gray-400 mt-3 text-sm">Loading listings...</p>
        </div>
      )}

      {/* Empty state */}
      {!isPending && (!listings || listings.length === 0) && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-gray-400 text-lg">No listings found</p>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount === 0
              ? 'Curated affordable listings will appear here once scrape and curation workflows run.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      )}

      {/* Listing grid */}
      {!isPending && listings && listings.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isLoggedIn={isLoggedIn}
                isSaved={savedUrls.has(listing.url)}
                onSave={() => handleSave(listing)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={listings.length < limit}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function ListingCard({
  listing,
  isLoggedIn,
  isSaved,
  onSave,
}: {
  listing: ScrapedListing
  isLoggedIn: boolean
  isSaved: boolean
  onSave: () => void
}) {
  const sourceColor = listing.source === 'craigslist'
    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    : 'bg-teal-500/20 text-teal-400 border-teal-500/30'

  const sourceLabel = listing.source === 'craigslist' ? 'Craigslist' : 'LeaseBreak'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${sourceColor}`}>
          {sourceLabel}
        </span>
        {listing.lease_type && (
          <span className="text-[11px] text-gray-500 uppercase tracking-wider">
            {listing.lease_type.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Title */}
      <a
        href={listing.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-white font-medium text-sm hover:text-amber-400 transition-colors line-clamp-2 mb-2"
      >
        {listing.title}
      </a>

      {/* Details */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
        {listing.price != null && (
          <span className="text-green-400 font-semibold text-sm">${listing.price.toLocaleString()}/mo</span>
        )}
        {listing.bedrooms != null && (
          <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`}</span>
        )}
        {listing.bathrooms != null && (
          <span>{listing.bathrooms} bath</span>
        )}
        {listing.sqft != null && (
          <span>{listing.sqft.toLocaleString()} sqft</span>
        )}
      </div>

      {/* Location */}
      <div className="text-xs text-gray-500 mb-3">
        {[listing.neighborhood, listing.borough].filter(Boolean).join(', ') || 'NYC'}
        {listing.address && <div className="text-gray-600 truncate mt-0.5">{listing.address}</div>}
      </div>

      {/* Date + meta */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex gap-3">
          {listing.posted_at && (
            <span>Posted {new Date(listing.posted_at).toLocaleDateString()}</span>
          )}
          {listing.pet_friendly && (
            <span className="text-green-500">Pet friendly</span>
          )}
        </div>
        {listing.lease_end_date && (
          <span>Lease ends {new Date(listing.lease_end_date).toLocaleDateString()}</span>
        )}
      </div>

      {/* Save button */}
      {isLoggedIn && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
              isSaved
                ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {isSaved ? 'Saved to Dashboard' : 'Save to Dashboard'}
          </button>
        </div>
      )}
    </div>
  )
}
