import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '../../lib/auth-client'
import { buildingTrackingOptions } from '../../data/tracking-queries'
import { upsertBuildingTracking, toggleFavorite, deleteBuildingTracking } from '../../data/tracking'

const STATUSES = [
  { value: 'interested', label: 'Interested' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'visited', label: 'Visited' },
  { value: 'applied', label: 'Applied' },
  { value: 'dismissed', label: 'Dismissed' },
] as const

const PRIORITIES = [
  { value: 1, label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 2, label: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 3, label: 'High', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
] as const

export function BuildingTrackingSection({ buildingId }: { buildingId: string }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { data: tracking } = useQuery({
    ...buildingTrackingOptions(buildingId),
    enabled: !!session?.user,
  })
  const [notesValue, setNotesValue] = useState<string | null>(null)
  const [showNotes, setShowNotes] = useState(false)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['building-tracking', buildingId] })
    queryClient.invalidateQueries({ queryKey: ['tracked-buildings'] })
  }

  const upsertMutation = useMutation({
    mutationFn: (data: Parameters<typeof upsertBuildingTracking>[0]['data']) =>
      upsertBuildingTracking({ data }),
    onSuccess: invalidate,
  })

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite({ data: buildingId }),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteBuildingTracking({ data: buildingId }),
    onSuccess: invalidate,
  })

  if (!session?.user) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Track This Building</h2>
            <p className="text-sm text-gray-400 mt-1">Sign in to save, rate, and track this building.</p>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-amber-500 text-gray-950 font-semibold rounded-lg hover:bg-amber-400 transition-colors text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const currentStatus = tracking?.status ?? null
  const currentNotes = notesValue ?? tracking?.notes ?? ''

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Track This Building</h2>
        <div className="flex items-center gap-2">
          {/* Favorite toggle */}
          <button
            onClick={() => favoriteMutation.mutate()}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title={tracking?.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-5 h-5 transition-colors ${tracking?.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              fill={tracking?.is_favorite ? 'currentColor' : 'none'}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* Remove tracking */}
          {tracking && (
            <button
              onClick={() => deleteMutation.mutate()}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-600 hover:text-red-400"
              title="Remove tracking"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</label>
        <div className="flex flex-wrap gap-1">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => upsertMutation.mutate({ buildingId, status: value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentStatus === value
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visited date */}
      {currentStatus && ['visited', 'applied'].includes(currentStatus) && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Visited Date</label>
          <input
            type="date"
            value={tracking?.visited_date ?? ''}
            onChange={(e) =>
              upsertMutation.mutate({ buildingId, visitedDate: e.target.value || null })
            }
            className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>
      )}

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() =>
                upsertMutation.mutate({
                  buildingId,
                  rating: tracking?.rating === star ? null : star,
                })
              }
              className="p-0.5"
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  tracking?.rating && star <= tracking.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-700'
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                fill={tracking?.rating && star <= tracking.rating ? 'currentColor' : 'none'}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Priority</label>
        <div className="flex gap-1">
          {PRIORITIES.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() =>
                upsertMutation.mutate({
                  buildingId,
                  priority: tracking?.priority === value ? null : value,
                })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                tracking?.priority === value ? color : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <button
          onClick={() => setShowNotes(v => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-300 transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${showNotes ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Notes {tracking?.notes ? `(${tracking.notes.length} chars)` : ''}
        </button>
        {showNotes && (
          <textarea
            value={currentNotes}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={() => {
              if (notesValue !== null && notesValue !== (tracking?.notes ?? '')) {
                upsertMutation.mutate({ buildingId, notes: notesValue })
              }
            }}
            placeholder="Add notes about this building..."
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-y min-h-[80px]"
          />
        )}
      </div>
    </div>
  )
}
