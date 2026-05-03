'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTickets } from '@/hooks/useRealtime'
import KanbanColumn from './KanbanColumn'
import FollowUpModal from '@/components/modals/FollowUpModal'
import type { Ticket, TicketStatus } from '@/types'
import toast from 'react-hot-toast'

const COLUMNS: {
  id: TicketStatus
  title: string
  accent: string
  counterStyle: React.CSSProperties
}[] = [
  { id: 'in_progress', title: 'Em Atendimento', accent: '#3b82f6', counterStyle: { background: '#eff6ff', color: '#3b82f6' } },
  { id: 'finished', title: 'Finalizado', accent: '#21d162', counterStyle: { background: 'var(--brand-primary-light)', color: 'var(--brand-primary)' } },
  { id: 'follow_up', title: 'Entrar em Contato', accent: '#f59e0b', counterStyle: { background: '#fffbeb', color: '#f59e0b' } },
]

interface KanbanBoardProps {
  tickets: Ticket[]
  onRefresh: () => void
  activeTicketId?: string | null
}

export default function KanbanBoard({ tickets, onRefresh, activeTicketId }: KanbanBoardProps) {
  const [followUpTicket, setFollowUpTicket] = useState<Ticket | null>(null)

  useRealtimeTickets(onRefresh)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function moveTicket(ticketId: string, newStatus: TicketStatus, followUpDate?: string) {
    const supabase = createClient()
    const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() }
    if (newStatus === 'finished') updates.finished_at = new Date().toISOString()
    if (newStatus === 'follow_up' && followUpDate) updates.follow_up_date = followUpDate
    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId)
    if (error) toast.error('Erro ao mover atendimento')
    else onRefresh()
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const ticket = tickets.find((t) => t.id === active.id)
    const newStatus = over.id as TicketStatus
    if (!ticket || ticket.status === newStatus) return
    if (newStatus === 'follow_up') { setFollowUpTicket(ticket); return }
    moveTicket(ticket.id, newStatus)
  }

  const getByStatus = (status: TicketStatus) => tickets.filter((t) => t.status === status)

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, height: '100%' }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              accent={col.accent}
              counterStyle={col.counterStyle}
              tickets={getByStatus(col.id)}
              activeTicketId={activeTicketId}
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
