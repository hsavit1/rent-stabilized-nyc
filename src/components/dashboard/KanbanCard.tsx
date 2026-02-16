import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from '@tanstack/react-router'
import type { KanbanItem } from '../../types/kanban'

const TYPE_BADGE: Record<string, string> = {
  craigslist: 'bg-orange-500/20 text-orange-400',
  leasebreak: 'bg-teal-500/20 text-teal-400',
  other: 'bg-gray-500/20 text-gray-400',
}

const PRIORITY_BADGE: Record<number, { label: string; color: string }> = {
  1: { label: 'Low', color: 'bg-green-500/20 text-green-400' },
  2: { label: 'Med', color: 'bg-amber-500/20 text-amber-400' },
  3: { label: 'High', color: 'bg-red-500/20 text-red-400' },
}

export function KanbanCard({ item }: { item: KanbanItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-900 border border-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 ring-2 ring-amber-500/50 z-50' : 'hover:border-gray-700'
      }`}
    >
      {/* Header row: title + favorite */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {item.kind === 'building' && item.building_id ? (
            <Link
              to="/building/$buildingId"
              params={{ buildingId: item.building_id }}
              className="text-amber-400 hover:text-amber-300 hover:underline font-medium text-sm block truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {item.title}
            </Link>
          ) : (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline font-medium text-sm block truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {item.title}
            </a>
          )}
          {item.subtitle && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.subtitle}</p>
          )}
        </div>
        {item.is_favorite && (
          <svg
            className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        {item.kind === 'listing' && item.listing_type && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_BADGE[item.listing_type] ?? TYPE_BADGE.other}`}
          >
            {item.listing_type === 'leasebreak' ? 'Lease Break' : item.listing_type}
          </span>
        )}
        {item.priority && PRIORITY_BADGE[item.priority] && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_BADGE[item.priority].color}`}
          >
            {PRIORITY_BADGE[item.priority].label}
          </span>
        )}
        {item.kind === 'building' && item.stabilized_units && (
          <span className="text-[10px] text-gray-500">{item.stabilized_units} units</span>
        )}
        {item.kind === 'listing' && item.price && (
          <span className="text-[10px] text-green-400 font-medium">
            ${item.price.toLocaleString()}
          </span>
        )}
        {item.kind === 'listing' && item.bedrooms != null && (
          <span className="text-[10px] text-gray-500">{item.bedrooms}BR</span>
        )}
      </div>

      {/* Rating stars */}
      {item.rating && item.rating > 0 && (
        <div className="flex gap-0.5 mt-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-3 h-3 ${
                star <= item.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-700'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              fill={star <= item.rating! ? 'currentColor' : 'none'}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          ))}
        </div>
      )}

      {/* Notes preview */}
      {item.notes && (
        <p className="text-[11px] text-gray-600 line-clamp-2 mt-1.5">{item.notes}</p>
      )}
    </div>
  )
}
