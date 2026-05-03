'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { AlertCircle, Calendar, PlayCircle } from 'lucide-react'
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
}

export default function KanbanCard({ ticket, isActive, isWaiting, onStartAttendance }: KanbanCardProps) {
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

  function handleClick() {
    if (isWaiting && onStartAttendance) return // handled by button
    router.push(`/chat/${ticket.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isWaiting ? 'var(--bg-surface)' : 'var(--bg-surface)',
        border: isWaiting
          ? '1px solid rgba(245,158,11,0.35)'
          : `1px solid ${isActive ? 'var(--brand-primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 12,
        marginBottom: 8,
        cursor: isWaiting ? 'default' : 'pointer',
        boxShadow: isDragging ? 'var(--shadow-lg)' : isWaiting ? '0 0 0 2px rgba(245,158,11,0.08)' : 'var(--shadow-xs)',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? `${CSS.Transform.toString(transform)} scale(1.02) rotate(1.5deg)` : CSS.Transform.toString(transform) || undefined,
        transition: 'var(--transition-fast)',
        outline: isActive ? '2px solid var(--brand-primary)' : undefined,
        outlineOffset: isActive ? 1 : undefined,
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isDragging && !isWaiting) {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'var(--shadow-sm)'
          el.style.borderColor = 'var(--border-strong)'
          el.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = isWaiting ? '0 0 0 2px rgba(245,158,11,0.08)' : 'var(--shadow-xs)'
        el.style.borderColor = isWaiting ? 'rgba(245,158,11,0.35)' : isActive ? 'var(--brand-primary)' : 'var(--border)'
        el.style.transform = ''
      }}
    >
      {/* Linha 1: Avatar + Nome + Badge */}
      <div className="flex items-start gap-2">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar name={ticket.contact?.name} phone={ticket.contact?.phone} src={ticket.contact?.profile_pic_url} size="sm" />
          {isWaiting && (
            <span style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#f59e0b', border: '2px solid var(--bg-surface)',
            }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate font-semibold" style={{ fontSize: 13, color: 'var(--text-primary)' }}>
              {contactName}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {ticket.priority === 'high' && <AlertCircle size={12} style={{ color: '#ef4444' }} />}
              {ticket.unread_count > 0 && (
                <span
                  className="flex items-center justify-center font-bold text-white"
                  style={{ minWidth: 18, height: 18, background: '#ef4444', borderRadius: 'var(--radius-full)', fontSize: 10, padding: '0 4px' }}
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

      {/* Preview */}
      {lastMsg && (
        <>
          <div style={{ height: 1, background: 'var(--border)', opacity: 0.5, margin: '8px 0' }} />
          <p style={{
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: '18px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {lastMsg}
          </p>
        </>
      )}

      {/* Follow-up badge — shown above footer when applicable */}
      {ticket.status === 'follow_up' && ticket.follow_up_date && (
        <div style={{ marginTop: 8 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 11, fontWeight: 600,
            background: followUpPast ? '#fef2f2' : '#f5f3ff',
            color: followUpPast ? '#ef4444' : '#7c3aed',
            border: `1px solid ${followUpPast ? '#fecaca' : '#ddd6fe'}`,
          }}>
            <Calendar size={11} style={{ flexShrink: 0 }} />
            {followUpPast
              ? `Vencido · ${format(new Date(ticket.follow_up_date), "dd/MM 'às' HH:mm", { locale: ptBR })}`
              : format(new Date(ticket.follow_up_date), "dd/MM 'às' HH:mm", { locale: ptBR })
            }
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between gap-1 mt-2">
        <div className="flex items-center gap-1 min-w-0">
          {isWaiting ? (
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Aguardando atendimento</span>
          ) : (
            ticket.assigned_agent && (
              <span
                className="truncate font-medium"
                style={{ fontSize: 11, padding: '2px 8px', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', maxWidth: 110 }}
              >
                {ticket.assigned_agent.full_name.split(' ')[0]}
              </span>
            )
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {timeAgo(ticket.last_message_at)}
        </span>
      </div>

      {/* Iniciar Atendimento button */}
      {isWaiting && onStartAttendance && (
        <button
          onClick={(e) => { e.stopPropagation(); onStartAttendance(ticket) }}
          style={{
            marginTop: 10,
            width: '100%',
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'var(--brand-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary-hover)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary)' }}
        >
          <PlayCircle size={13} />
          Iniciar Atendimento
        </button>
      )}
    </div>
  )
}
