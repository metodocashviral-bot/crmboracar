'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTickets } from '@/hooks/useRealtime'
import KanbanColumn from './KanbanColumn'
import FollowUpModal from '@/components/modals/FollowUpModal'
import type { Ticket, TicketStatus } from '@/types'
import toast from 'react-hot-toast'

const COLUMNS: { id: TicketStatus; title: string; color: string }[] = [
  { id: 'in_progress', title: 'Em Atendimento', color: 'bg-blue-500' },
  { id: 'finished', title: 'Finalizado', color: 'bg-green-600' },
  { id: 'follow_up', title: 'Entrar em Contato', color: 'bg-yellow-500' },
]

interface KanbanBoardProps {
  tickets: Ticket[]
  onRefresh: () => void
  activeTicketId?: string | null
}

export default function KanbanBoard({ tickets, onRefresh, activeTicketId }: KanbanBoardProps) {
  const [followUpTicket, setFollowUpTicket] = useState<Ticket | null>(null)

  useRealtimeTickets(onRefresh)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  async function moveTicket(ticketId: string, newStatus: TicketStatus, followUpDate?: string) {
    const supabase = createClient()
    const updates: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }
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

    if (newStatus === 'follow_up') {
      setFollowUpTicket(ticket)
      return
    }

    moveTicket(ticket.id, newStatus)
  }

  const getTicketsByStatus = (status: TicketStatus) =>
    tickets.filter((t) => t.status === status)

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              tickets={getTicketsByStatus(col.id)}
              activeTicketId={activeTicketId}
            />
          ))}
        </div>
      </DndContext>

      {followUpTicket && (
        <FollowUpModal
          open
          onClose={() => setFollowUpTicket(null)}
          onConfirm={(date) => {
            moveTicket(followUpTicket.id, 'follow_up', date)
            setFollowUpTicket(null)
          }}
        />
      )}
    </>
  )
}
