'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import type { Ticket, TicketStatus } from '@/types'

interface KanbanColumnProps {
  id: TicketStatus
  title: string
  tickets: Ticket[]
  accent: string
  counterStyle: React.CSSProperties
  activeTicketId?: string | null
}

export default function KanbanColumn({ id, title, tickets, accent, counterStyle, activeTicketId }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col" style={{ minWidth: 0 }}>
      {/* Column container */}
      <div
        style={{
          background: 'var(--bg-surface-2)',
          borderRadius: 'var(--radius-lg)',
          padding: 12,
          borderTop: `3px solid ${accent}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '4px 4px 12px 4px' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          </div>
          <span
            className="font-bold"
            style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', ...counterStyle }}
          >
            {tickets.length}
          </span>
        </div>

        {/* Drop area */}
        <div
          ref={setNodeRef}
          style={{
            flex: 1,
            minHeight: 200,
            borderRadius: 'var(--radius-md)',
            border: isOver ? '2px dashed var(--brand-primary)' : '2px solid transparent',
            background: isOver ? 'var(--brand-glow)' : 'transparent',
            transition: 'var(--transition-fast)',
            overflowY: 'auto',
            padding: isOver ? 4 : 0,
          }}
        >
          <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tickets.map((ticket) => (
              <KanbanCard key={ticket.id} ticket={ticket} isActive={ticket.id === activeTicketId} />
            ))}
          </SortableContext>
          {tickets.length === 0 && (
            <div className="flex items-center justify-center" style={{ height: 80, fontSize: 12, color: 'var(--text-muted)' }}>
              Nenhum atendimento
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
