import { useState } from 'react'
import type { KanbanItem } from '../../types/kanban'

interface DismissedSectionProps {
  items: KanbanItem[]
  onRestore: (item: KanbanItem) => void
}

export function DismissedSection({ items, onRestore }: DismissedSectionProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-6 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span>Dismissed</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[11px] font-medium text-gray-500">
          {items.length}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 divide-y divide-gray-800/50">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-[11px] text-gray-600 truncate">{item.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="text-[10px] text-gray-600 capitalize">
                  {item.kind}
                </span>
                <button
                  onClick={() => onRestore(item)}
                  className="px-3 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
