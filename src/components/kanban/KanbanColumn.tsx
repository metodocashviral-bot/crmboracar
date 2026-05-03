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
  isWaiting?: boolean
  onStartAttendance?: (ticket: Ticket) => void
}

export default function KanbanColumn({ id, title, tickets, accent, counterStyle, activeTicketId, isWaiting, onStartAttendance }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col" style={{ minWidth: 0, minHeight: 0 }}>
      <div
        style={{
          background: 'var(--bg-surface-2)',
          borderRadius: 'var(--radius-lg)',
          borderTop: `3px solid ${accent}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '12px 12px 8px 12px' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          </div>
          <span className="font-bold" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', ...counterStyle }}>
            {tickets.length}
          </span>
        </div>

        {/* Scrollable drop area */}
        <div
          ref={setNodeRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 8px 8px 8px',
            borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
            border: isOver ? '2px dashed var(--brand-primary)' : '2px solid transparent',
            background: isOver ? 'var(--brand-glow)' : 'transparent',
            transition: 'var(--transition-fast)',
            minHeight: 0,
          }}
        >
          <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tickets.map((ticket) => (
              <KanbanCard
                key={ticket.id}
                ticket={ticket}
                isActive={ticket.id === activeTicketId}
                isWaiting={isWaiting}
                onStartAttendance={onStartAttendance}
              />
            ))}
          </SortableContext>
          {tickets.length === 0 && (
            <div className="flex items-center justify-center" style={{ height: 80, fontSize: 12, color: 'var(--text-muted)' }}>
              {isWaiting ? 'Nenhuma mensagem nova' : 'Nenhum atendimento'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
