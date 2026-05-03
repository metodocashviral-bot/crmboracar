'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { AlertCircle, Clock } from 'lucide-react'
import { cn, timeAgo, truncate, formatPhone, formatTime } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import type { Ticket } from '@/types'
import { format } from 'date-fns'
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => router.push(`/chat/${ticket.id}`)}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 cursor-pointer hover:shadow-md transition-all select-none',
        isDragging && 'opacity-50 shadow-xl',
        isActive && 'ring-2 ring-green-500'
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar
          name={ticket.contact?.name}
          phone={ticket.contact?.phone}
          src={ticket.contact?.profile_pic_url}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {contactName}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {ticket.priority === 'high' && (
                <AlertCircle size={13} className="text-red-500" />
              )}
              {ticket.unread_count > 0 && (
                <span className="min-w-[18px] h-[18px] bg-green-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {ticket.unread_count > 99 ? '99+' : ticket.unread_count}
                </span>
              )}
            </div>
          </div>

          {lastMsg && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {truncate(lastMsg, 50)}
            </p>
          )}

          <div className="flex items-center justify-between mt-1.5 gap-1">
            <div className="flex items-center gap-1 min-w-0">
              {ticket.assigned_agent && (
                <Badge variant="default" className="truncate max-w-[100px]">
                  {ticket.assigned_agent.full_name.split(' ')[0]}
                </Badge>
              )}
              {ticket.status === 'follow_up' && ticket.follow_up_date && (
                <div className="flex items-center gap-0.5 text-yellow-600 dark:text-yellow-400">
                  <Clock size={11} />
                  <span className="text-[10px]">
                    {format(new Date(ticket.follow_up_date), "dd/MM HH:mm", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {timeAgo(ticket.last_message_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
