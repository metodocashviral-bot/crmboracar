'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { AlertCircle, Clock, Calendar } from 'lucide-react'
import { timeAgo, formatPhone } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import type { Ticket } from '@/types'
import { format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface KanbanCardProps {
  ticket: Ticket
  isActive?: boolean
}

export default function KanbanCard({ ticket, isActive }: KanbanCardProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { ticket },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const contactName = ticket.contact?.name || formatPhone(ticket.contact?.phone || '')
  const lastMsg = ticket.last_message || ''
  const followUpPast = ticket.follow_up_date && isPast(new Date(ticket.follow_up_date))

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--bg-surface)',
        border: `1px solid ${isActive ? 'var(--brand-primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 12,
        marginBottom: 8,
        cursor: 'pointer',
        boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? `${CSS.Transform.toString(transform)} scale(1.02) rotate(1.5deg)` : CSS.Transform.toString(transform) || undefined,
        transition: 'var(--transition-fast)',
        outline: isActive ? '2px solid var(--brand-primary)' : undefined,
        outlineOffset: isActive ? 1 : undefined,
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={() => router.push(`/chat/${ticket.id}`)}
      onMouseEnter={(e) => {
        if (!isDragging) {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'var(--shadow-sm)'
          el.style.borderColor = 'var(--border-strong)'
          el.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = 'var(--shadow-xs)'
        el.style.borderColor = isActive ? 'var(--brand-primary)' : 'var(--border)'
        el.style.transform = ''
      }}
    >
      {/* Linha 1: Avatar + Nome + Badge nao lidas */}
      <div className="flex items-start gap-2">
        <Avatar name={ticket.contact?.name} phone={ticket.contact?.phone} src={ticket.contact?.profile_pic_url} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate font-semibold" style={{ fontSize: 13, color: 'var(--text-primary)' }}>
              {contactName}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {ticket.priority === 'high' && (
                <AlertCircle size={12} style={{ color: 'var(--priority-high)' }} />
              )}
              {ticket.unread_count > 0 && (
                <span
                  className="flex items-center justify-center font-bold text-white"
                  style={{
                    minWidth: 18, height: 18,
                    background: '#ef4444',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 10,
                    padding: '0 4px',
                  }}
                >
                  {ticket.unread_count > 99 ? '99+' : ticket.unread_count}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {formatPhone(ticket.contact?.phone || '')}
          </p>
        </div>
      </div>

      {/* Divider */}
      {lastMsg && (
        <>
          <div style={{ height: 1, background: 'var(--border)', opacity: 0.5, margin: '8px 0' }} />
          <p style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: '18px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {lastMsg}
          </p>
        </>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between gap-1 mt-2">
        <div className="flex items-center gap-1 min-w-0">
          {ticket.assigned_agent && (
            <span
              className="truncate font-medium"
              style={{
                fontSize: 11, padding: '2px 8px',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                maxWidth: 90,
              }}
            >
              {ticket.assigned_agent.full_name.split(' ')[0]}
            </span>
          )}
          {ticket.priority === 'high' && (
            <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--priority-high-bg)', color: 'var(--priority-high)', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              Alta
            </span>
          )}
          {ticket.status === 'follow_up' && ticket.follow_up_date && (
            <span
              className="flex items-center gap-1"
              style={{ fontSize: 11, color: followUpPast ? '#ef4444' : 'var(--status-follow-up)', fontWeight: 500 }}
            >
              <Calendar size={10} />
              {followUpPast ? 'Vencido' : format(new Date(ticket.follow_up_date), "dd/MM HH:mm", { locale: ptBR })}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {timeAgo(ticket.last_message_at)}
        </span>
      </div>
    </div>
  )
}
