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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '0 12px',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          borderBottom: `2px solid ${accent}`,
          background: 'var(--bg-surface)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}>
            {/* Count badge */}
            <span style={{
              minWidth: 26, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-full)',
              fontSize: 12, fontWeight: 800,
              padding: '0 6px',
              flexShrink: 0,
              ...counterStyle,
            }}>
              {tickets.length}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {title}
            </span>
          </div>
          {/* Accent bar indicator */}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
        </div>

        {/* Scrollable list */}
        <div
          ref={setNodeRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '6px 8px 8px',
            border: isOver ? `2px dashed ${accent}` : '2px solid transparent',
            background: isOver ? `${accent}10` : 'transparent',
            transition: 'var(--transition-fast)',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
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
                accent={accent}
              />
            ))}
          </SortableContext>
          {tickets.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '24px 0' }}>
              {isWaiting ? 'Nenhuma nova mensagem' : 'Nenhum atendimento'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
