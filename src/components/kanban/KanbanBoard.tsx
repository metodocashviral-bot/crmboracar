'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTickets } from '@/hooks/useRealtime'
import { useAppStore } from '@/stores/appStore'
import KanbanColumn from './KanbanColumn'
import FollowUpModal from '@/components/modals/FollowUpModal'
import type { Ticket, TicketStatus } from '@/types'
import toast from 'react-hot-toast'

type KanbanCol = 'waiting' | TicketStatus

const COLUMNS: {
  id: KanbanCol
  title: string
  accent: string
  counterStyle: React.CSSProperties
}[] = [
  { id: 'waiting',     title: 'Nova Mensagem',     accent: '#f59e0b', counterStyle: { background: '#fffbeb', color: '#f59e0b' } },
  { id: 'in_progress', title: 'Em Atendimento',    accent: '#3b82f6', counterStyle: { background: '#eff6ff', color: '#3b82f6' } },
  { id: 'follow_up',   title: 'Entrar em Contato', accent: '#8b5cf6', counterStyle: { background: '#f5f3ff', color: '#8b5cf6' } },
  { id: 'finished',    title: 'Finalizado',         accent: '#21d162', counterStyle: { background: 'var(--brand-primary-light)', color: 'var(--brand-primary)' } },
]

interface KanbanBoardProps {
  tickets: Ticket[]
  onRefresh: () => void
  activeTicketId?: string | null
}

export default function KanbanBoard({ tickets, onRefresh, activeTicketId }: KanbanBoardProps) {
  const { profile } = useAppStore()
  const [followUpTicket, setFollowUpTicket] = useState<Ticket | null>(null)

  useRealtimeTickets(onRefresh)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const getByCol = useCallback((col: KanbanCol): Ticket[] => {
    if (col === 'waiting') return tickets.filter((t) => t.status === 'in_progress' && !t.assigned_agent_id)
    if (col === 'in_progress') return tickets.filter((t) => t.status === 'in_progress' && !!t.assigned_agent_id)
    return tickets.filter((t) => t.status === col)
  }, [tickets])

  async function startAttendance(ticket: Ticket) {
    if (!profile) return
    const supabase = createClient()
    await supabase.from('tickets').update({ assigned_agent_id: profile.id }).eq('id', ticket.id)
    await supabase.from('messages').insert({
      ticket_id: ticket.id,
      contact_id: ticket.contact_id,
      sender_type: 'system',
      content: `${profile.full_name} iniciou o atendimento`,
    })
    toast.success('Atendimento iniciado')
    onRefresh()
  }

  async function moveTicket(ticketId: string, toCol: KanbanCol, followUpDate?: string) {
    const supabase = createClient()
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return

    if (toCol === 'waiting') return // não move para fila via drag

    const updates: Record<string, unknown> = { status: toCol as TicketStatus }
    if (toCol === 'finished') updates.finished_at = new Date().toISOString()
    if (toCol === 'follow_up' && followUpDate) updates.follow_up_date = followUpDate
    if (toCol === 'in_progress' && !ticket.assigned_agent_id && profile) {
      updates.assigned_agent_id = profile.id
    }

    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId)
    if (error) toast.error('Erro ao mover atendimento')
    else onRefresh()
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const ticket = tickets.find((t) => t.id === active.id)
    const toCol = over.id as KanbanCol
    if (!ticket) return

    const fromCol: KanbanCol = !ticket.assigned_agent_id && ticket.status === 'in_progress'
      ? 'waiting'
      : ticket.status

    if (fromCol === toCol) return
    if (toCol === 'follow_up') { setFollowUpTicket(ticket); return }
    moveTicket(ticket.id, toCol)
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, height: '100%', minWidth: 0 }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id as TicketStatus}
              title={col.title}
              accent={col.accent}
              counterStyle={col.counterStyle}
              tickets={getByCol(col.id)}
              activeTicketId={activeTicketId}
              isWaiting={col.id === 'waiting'}
              onStartAttendance={startAttendance}
            />
          ))}
        </div>
      </DndContext>

      {followUpTicket && (
        <FollowUpModal
          open
          onClose={() => setFollowUpTicket(null)}
          onConfirm={(date) => { moveTicket(followUpTicket.id, 'follow_up', date); setFollowUpTicket(null) }}
        />
      )}
    </>
  )
}
