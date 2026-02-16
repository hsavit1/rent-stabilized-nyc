import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import type { KanbanItem } from '../../types/kanban'

const COLUMN_ACCENTS: Record<string, string> = {
  blue: 'border-t-blue-500',
  cyan: 'border-t-cyan-500',
  green: 'border-t-green-500',
  purple: 'border-t-purple-500',
}

const COUNT_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400',
  cyan: 'bg-cyan-500/20 text-cyan-400',
  green: 'bg-green-500/20 text-green-400',
  purple: 'bg-purple-500/20 text-purple-400',
}

interface KanbanColumnProps {
  status: string
  label: string
  color: string
  items: KanbanItem[]
}

export function KanbanColumn({ status, label, color, items }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-[280px] lg:flex-1 bg-gray-950/50 rounded-xl border border-gray-800 border-t-2 ${
        COLUMN_ACCENTS[color] ?? 'border-t-gray-500'
      } ${isOver ? 'ring-2 ring-amber-500/30 bg-gray-950/80' : ''} transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-300">{label}</h3>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${COUNT_COLORS[color] ?? 'bg-gray-500/20 text-gray-400'}`}
        >
          {items.length}
        </span>
      </div>

      {/* Card list */}
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
          {items.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-600">
              Drop items here
            </div>
          ) : (
            items.map((item) => <KanbanCard key={item.id} item={item} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}
