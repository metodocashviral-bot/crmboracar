'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { PlayCircle, MoreVertical, Calendar, AlertCircle } from 'lucide-react'
import { timeAgo, formatPhone } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import type { Ticket } from '@/types'
import { format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface KanbanCardProps {
  ticket: Ticket
  isActive?: boolean
  isWaiting?: boolean
  onStartAttendance?: (ticket: Ticket) => void
  accent: string
}

export default function KanbanCard({ ticket, isActive, isWaiting, onStartAttendance, accent }: KanbanCardProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { ticket },
  })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const contactName = ticket.contact?.name || formatPhone(ticket.contact?.phone || '')
  const lastMsg = ticket.last_message || ''
  const followUpPast = ticket.follow_up_date && isPast(new Date(ticket.follow_up_date))

  function handleClick() {
    if (isWaiting && onStartAttendance) return
    router.push(`/chat/${ticket.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDragging ? 0.4 : 1,
        userSelect: 'none',
        marginBottom: 2,
      }}
      {...attributes}
      {...listeners}
    >
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '10px 12px',
          background: isActive ? 'var(--brand-primary-light)' : 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          cursor: isWaiting ? 'default' : 'pointer',
          borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
          transition: 'var(--transition-fast)',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface-2)'
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'
        }}
      >
        {/* Avatar with unread badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            name={ticket.contact?.name}
            phone={ticket.contact?.phone}
            src={ticket.contact?.profile_pic_url}
            size="xl"
          />
          {ticket.unread_count > 0 && (
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              minWidth: 18, height: 18,
              background: accent, color: 'white',
              borderRadius: 'var(--radius-full)',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--bg-surface)',
            }}>
              {ticket.unread_count > 99 ? '99+' : ticket.unread_count}
            </span>
          )}
          {isWaiting && (
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 14, height: 14, borderRadius: '50%',
              background: '#f59e0b', border: '2px solid var(--bg-surface)',
            }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: Name + time */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {contactName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {ticket.priority === 'high' && <AlertCircle size={11} style={{ color: '#ef4444' }} />}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {timeAgo(ticket.last_message_at)}
              </span>
            </div>
          </div>

          {/* Row 2: Message preview */}
          <p style={{
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: '17px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 6,
          }}>
            {lastMsg || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sem mensagens</span>}
          </p>

          {/* Row 3: Agent + follow_up badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              {isWaiting ? (
                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Aguardando</span>
              ) : ticket.assigned_agent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Avatar name={ticket.assigned_agent.full_name} size="xs" />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
                    {ticket.assigned_agent.full_name.split(' ')[0]}
                  </span>
                </div>
              ) : null}

              {ticket.status === 'follow_up' && ticket.follow_up_date && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 10, fontWeight: 600,
                  padding: '2px 6px', borderRadius: 'var(--radius-full)',
                  background: followUpPast ? '#fef2f2' : '#f5f3ff',
                  color: followUpPast ? '#ef4444' : '#7c3aed',
                  border: `1px solid ${followUpPast ? '#fecaca' : '#ddd6fe'}`,
                  flexShrink: 0,
                }}>
                  <Calendar size={9} />
                  {format(new Date(ticket.follow_up_date), "dd/MM HH:mm", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Iniciar Atendimento button */}
      {isWaiting && onStartAttendance && (
        <button
          onClick={(e) => { e.stopPropagation(); onStartAttendance(ticket) }}
          style={{
            width: '100%', height: 30, marginTop: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: accent, color: 'white', border: 'none',
            borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'var(--transition-fast)',
          }}
        >
          <PlayCircle size={13} />
          Iniciar Atendimento
        </button>
      )}
    </div>
  )
}
