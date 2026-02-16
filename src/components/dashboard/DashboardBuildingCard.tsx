import { Link } from '@tanstack/react-router'
import type { BuildingTracking } from '../../data/tracking'
import type { Building } from '../../types'

const STATUS_COLORS: Record<string, string> = {
  interested: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-cyan-500/20 text-cyan-400',
  visited: 'bg-green-500/20 text-green-400',
  applied: 'bg-purple-500/20 text-purple-400',
  dismissed: 'bg-gray-500/20 text-gray-400',
}

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Low', color: 'bg-green-500/20 text-green-400' },
  2: { label: 'Medium', color: 'bg-amber-500/20 text-amber-400' },
  3: { label: 'High', color: 'bg-red-500/20 text-red-400' },
}

interface DashboardBuildingCardProps {
  tracking: BuildingTracking
  building: Building | undefined
}

export function DashboardBuildingCard({ tracking, building }: DashboardBuildingCardProps) {
  const statusColor = STATUS_COLORS[tracking.status] || STATUS_COLORS.interested

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link
            to="/building/$buildingId"
            params={{ buildingId: tracking.building_id }}
            className="text-amber-400 hover:text-amber-300 hover:underline font-medium text-sm block truncate"
          >
            {building?.a ?? tracking.building_id}
          </Link>
          {building && (
            <p className="text-xs text-gray-500 mt-0.5">
              {building.b}, NY {building.z}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {tracking.is_favorite && (
            <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColor}`}>
          {tracking.status}
        </span>
        {tracking.priority && PRIORITY_LABELS[tracking.priority] && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${PRIORITY_LABELS[tracking.priority].color}`}>
            {PRIORITY_LABELS[tracking.priority].label}
          </span>
        )}
        {building?.su && (
          <span className="text-[10px] text-gray-500">
            {building.su.toLocaleString()} units
          </span>
        )}
      </div>

      {/* Rating stars */}
      {tracking.rating && (
        <div className="flex gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= tracking.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-700'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              fill={star <= tracking.rating! ? 'currentColor' : 'none'}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
      )}

      {/* Notes preview */}
      {tracking.notes && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{tracking.notes}</p>
      )}

      {/* Timestamp */}
      <p className="text-[10px] text-gray-600">
        Updated {new Date(tracking.updated_at).toLocaleDateString()}
      </p>
    </div>
  )
}
