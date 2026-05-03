'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import KanbanCard from './KanbanCard'
import type { Ticket, TicketStatus } from '@/types'

interface KanbanColumnProps {
  id: TicketStatus
  title: string
  tickets: Ticket[]
  color: string
  activeTicketId?: string | null
}

export default function KanbanColumn({ id, title, tickets, color, activeTicketId }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-t-xl', color)}>
        <span className="font-semibold text-sm text-white">{title}</span>
        <span className="ml-auto bg-white/20 text-white text-xs font-bold rounded-full px-2 py-0.5">
          {tickets.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-b-xl p-2 space-y-2 min-h-[200px] transition-colors',
          isOver
            ? 'bg-green-50 dark:bg-green-900/10 border-2 border-dashed border-green-400'
            : 'bg-gray-100 dark:bg-slate-800/50 border-2 border-transparent'
        )}
      >
        <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <KanbanCard
              key={ticket.id}
              ticket={ticket}
              isActive={ticket.id === activeTicketId}
            />
          ))}
        </SortableContext>
        {tickets.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 dark:text-slate-500">
            Nenhum atendimento
          </div>
        )}
      </div>
    </div>
  )
}
