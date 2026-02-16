import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSavedListing } from '../../data/listings'
import type { ListingType } from '../../types/kanban'

const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']

function detectListingType(url: string): ListingType {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('craigslist.org')) return 'craigslist'
    if (host.includes('leasebreak.com')) return 'leasebreak'
  } catch {
    // invalid URL
  }
  return 'other'
}

export function AddListingModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [listingType, setListingType] = useState<ListingType>('other')
  const [price, setPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [borough, setBorough] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  // Auto-detect listing type when URL changes
  useEffect(() => {
    if (url) setListingType(detectListingType(url))
  }, [url])

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof createSavedListing>[0]['data']) =>
      createSavedListing({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-listings'] })
      onClose()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !title.trim()) return
    mutation.mutate({
      url: url.trim(),
      title: title.trim(),
      listingType,
      price: price ? Number(price) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      borough: borough || undefined,
      neighborhood: neighborhood || undefined,
      notes: notes || undefined,
    })
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="bg-gray-900 border border-gray-700 rounded-xl p-0 w-full max-w-lg backdrop:bg-black/60 text-white"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Add Listing</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://craigslist.org/apt/..."
              required
              className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sunny 1BR in Prospect Heights"
              required
              className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
            <div className="flex gap-2">
              {(['craigslist', 'leasebreak', 'other'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setListingType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    listingType === t
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                  }`}
                >
                  {t === 'leasebreak' ? 'Lease Break' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Price + Bedrooms row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2400"
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Bedrooms</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="1"
                min="0"
                max="10"
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Borough + Neighborhood row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Borough</label>
              <select
                value={borough}
                onChange={(e) => setBorough(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="">Select...</option>
                {BOROUGHS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Neighborhood</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Prospect Heights"
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this listing..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-y"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || !url.trim() || !title.trim()}
            className="px-5 py-2 bg-amber-500 text-gray-950 font-semibold rounded-lg hover:bg-amber-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Saving...' : 'Save to Interested'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
