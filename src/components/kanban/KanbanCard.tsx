'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { PlayCircle, Calendar } from 'lucide-react'
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

  const contactName = ticket.contact?.name || formatPhone(ticket.contact?.phone || '')
  const phone = ticket.contact?.phone ? formatPhone(ticket.contact.phone) : ''
  const lastMsg = ticket.last_message || ''
  const followUpDate = ticket.follow_up_date ? new Date(ticket.follow_up_date) : null
  const followUpPast = followUpDate ? isPast(followUpDate) : false
  const hasUnread = ticket.unread_count > 0

  function handleClick() {
    if (isWaiting && onStartAttendance) return
    router.push(`/chat/${ticket.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
    >
      <div
        onClick={handleClick}
        style={{
          background: isActive ? '#f0fdf4' : 'white',
          borderRadius: 14,
          padding: '12px 14px',
          marginBottom: 6,
          cursor: isWaiting ? 'default' : 'pointer',
          boxShadow: isActive
            ? `0 0 0 1.5px ${accent}, 0 2px 8px rgba(0,0,0,0.06)`
            : '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive && !isWaiting) {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)'
            ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)'
            ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          }
        }}
      >
        {/* Main row */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              name={ticket.contact?.name}
              phone={ticket.contact?.phone}
              src={ticket.contact?.profile_pic_url}
              size="md"
            />
            {hasUnread && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                minWidth: 16, height: 16,
                background: accent, color: 'white',
                borderRadius: 99, fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
                border: '1.5px solid white',
                lineHeight: 1,
              }}>
                {ticket.unread_count > 99 ? '99+' : ticket.unread_count}
              </span>
            )}
          </div>

          {/* Text content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + time */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, marginBottom: 1 }}>
              <span style={{
                fontSize: 13.5, fontWeight: 600,
                color: '#111827',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flex: 1,
              }}>
                {contactName}
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {timeAgo(ticket.last_message_at)}
              </span>
            </div>

            {/* Phone (only if name exists and is different) */}
            {ticket.contact?.name && phone && (
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{phone}</p>
            )}

            {/* Message preview */}
            {lastMsg ? (
              <p style={{
                fontSize: 12.5, color: '#6b7280', lineHeight: '18px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 0,
              }}>
                {lastMsg}
              </p>
            ) : (
              <p style={{ fontSize: 12, color: '#d1d5db', fontStyle: 'italic' }}>Sem mensagens</p>
            )}
          </div>
        </div>

        {/* Footer row — only rendered when there's something to show */}
        {(ticket.assigned_agent || followUpDate || isWaiting) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px solid #f3f4f6',
          }}>
            {/* Left: agent or waiting label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {isWaiting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Aguardando</span>
                </div>
              ) : ticket.assigned_agent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Avatar name={ticket.assigned_agent.full_name} size="xs" />
                  <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
                    {ticket.assigned_agent.full_name.split(' ')[0]}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Right: follow-up date */}
            {followUpDate && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 10.5, fontWeight: 600,
                padding: '3px 7px', borderRadius: 99,
                background: followUpPast ? '#fef2f2' : '#faf5ff',
                color: followUpPast ? '#ef4444' : '#7c3aed',
                border: `1px solid ${followUpPast ? '#fecaca' : '#e9d5ff'}`,
              }}>
                <Calendar size={9} />
                {format(followUpDate, "dd/MM 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Iniciar Atendimento */}
      {isWaiting && onStartAttendance && (
        <button
          onClick={(e) => { e.stopPropagation(); onStartAttendance(ticket) }}
          style={{
            width: '100%', height: 34, marginBottom: 6, marginTop: -2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: accent, color: 'white', border: 'none',
            borderRadius: '0 0 14px 14px',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          <PlayCircle size={13} />
          Iniciar Atendimento
        </button>
      )}
    </div>
  )
}
