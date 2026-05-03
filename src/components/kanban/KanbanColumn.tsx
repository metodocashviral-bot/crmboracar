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
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        borderRadius: 18,
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px 12px',
          flexShrink: 0,
          borderBottom: '1px solid #f0f0f0',
          background: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', flex: 1 }}>
              {title}
            </span>
            <span style={{
              minWidth: 22, height: 22,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 99, fontSize: 11, fontWeight: 700,
              padding: '0 6px',
              ...counterStyle,
            }}>
              {tickets.length}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={setNodeRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 8px',
            background: isOver ? `${accent}0d` : 'transparent',
            outline: isOver ? `2px dashed ${accent}` : '2px solid transparent',
            outlineOffset: -2,
            transition: 'background 0.15s ease',
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
                accent={accent}
              />
            ))}
          </SortableContext>

          {tickets.length === 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 80, fontSize: 12, color: '#d1d5db',
            }}>
              {isWaiting ? 'Nenhuma nova mensagem' : 'Sem atendimentos'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
