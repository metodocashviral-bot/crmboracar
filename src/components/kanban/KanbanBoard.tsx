'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTickets } from '@/hooks/useRealtime'
import { useAppStore } from '@/stores/appStore'
import { useRouter } from 'next/navigation'
import KanbanColumn from './KanbanColumn'
import FollowUpModal from '@/components/modals/FollowUpModal'
import type { Ticket, TicketStatus } from '@/types'
import toast from 'react-hot-toast'

type KanbanCol = 'waiting' | TicketStatus

const COLUMNS: { id: KanbanCol; title: string; accent: string; counterStyle: React.CSSProperties }[] = [
  { id: 'waiting',     title: 'Nova Mensagem',     accent: '#f59e0b', counterStyle: { background: '#fffbeb', color: '#f59e0b' } },
  { id: 'in_progress', title: 'Em Atendimento',    accent: '#3b82f6', counterStyle: { background: '#eff6ff', color: '#3b82f6' } },
  { id: 'follow_up',   title: 'Entrar em Contato', accent: '#8b5cf6', counterStyle: { background: '#f5f3ff', color: '#8b5cf6' } },
  { id: 'finished',    title: 'Finalizado',         accent: '#21d162', counterStyle: { background: 'var(--brand-primary-light)', color: 'var(--brand-primary)' } },
]

const COLUMN_IDS = new Set(COLUMNS.map((c) => c.id))

interface KanbanBoardProps {
  tickets: Ticket[]
  onRefresh: () => void
  activeTicketId?: string | null
}

export default function KanbanBoard({ tickets, onRefresh, activeTicketId }: KanbanBoardProps) {
  const { profile } = useAppStore()
  const router = useRouter()
  const [followUpTicket, setFollowUpTicket] = useState<Ticket | null>(null)

  useRealtimeTickets(onRefresh)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const getTicketCol = useCallback((t: Ticket): KanbanCol => {
    if (t.status === 'in_progress' && !t.assigned_agent_id) return 'waiting'
    return t.status
  }, [])

  const getByCol = useCallback((col: KanbanCol): Ticket[] => {
    const filtered = tickets.filter((t) => getTicketCol(t) === col)
    if (col === 'follow_up') {
      return [...filtered].sort((a, b) => {
        if (!a.follow_up_date) return 1
        if (!b.follow_up_date) return -1
        return new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime()
      })
    }
    return filtered
  }, [tickets, getTicketCol])

  // Resolve over.id → column (over.id may be a ticket id or a column id)
  function resolveTargetCol(overId: string): KanbanCol | null {
    if (COLUMN_IDS.has(overId as KanbanCol)) return overId as KanbanCol
    const overTicket = tickets.find((t) => t.id === overId)
    if (overTicket) return getTicketCol(overTicket)
    return null
  }

  async function startAttendance(ticket: Ticket) {
    if (!profile) return
    const supabase = createClient()

    await supabase.from('tickets').update({ assigned_agent_id: profile.id }).eq('id', ticket.id)

    const greeting = `${profile.full_name} iniciou o atendimento`
    const greetingWpp = `*${profile.full_name}* iniciou o atendimento`

    // System message in DB
    await supabase.from('messages').insert({
      ticket_id: ticket.id,
      contact_id: ticket.contact_id,
      sender_type: 'system',
      content: greeting,
    })

    // Send WhatsApp message to contact
    fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticket.id, content: greetingWpp, agentId: profile.id, noPrefix: true }),
    }).catch(() => {})

    onRefresh()
    router.push(`/chat/${ticket.id}`)
  }

  async function moveTicket(ticket: Ticket, toCol: KanbanCol, followUpDate?: string) {
    if (toCol === 'waiting') return
    const supabase = createClient()
    const updates: Record<string, unknown> = { status: toCol as TicketStatus }
    if (toCol === 'finished') updates.finished_at = new Date().toISOString()
    if (toCol === 'follow_up' && followUpDate) updates.follow_up_date = followUpDate
    if (toCol === 'in_progress' && !ticket.assigned_agent_id && profile) {
      updates.assigned_agent_id = profile.id
    }
    const { error } = await supabase.from('tickets').update(updates).eq('id', ticket.id)
    if (error) { toast.error('Erro ao mover atendimento'); return }

    if (toCol === 'finished' && profile) {
      const msg = `${profile.full_name} finalizou o atendimento`
      await supabase.from('messages').insert({
        ticket_id: ticket.id,
        contact_id: ticket.contact_id,
        sender_type: 'system',
        content: msg,
      })
      fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, content: `*${profile.full_name}* finalizou o atendimento`, agentId: profile.id, noPrefix: true }),
      }).catch(() => {})
    }

    onRefresh()
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const draggedTicket = tickets.find((t) => t.id === active.id)
    if (!draggedTicket) return

    const fromCol = getTicketCol(draggedTicket)
    const toCol = resolveTargetCol(String(over.id))
    if (!toCol || fromCol === toCol) return

    if (toCol === 'follow_up') { setFollowUpTicket(draggedTicket); return }
    moveTicket(draggedTicket, toCol)
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, height: '100%' }}>
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
          onConfirm={(date) => { moveTicket(followUpTicket, 'follow_up', date); setFollowUpTicket(null) }}
        />
      )}
    </>
  )
}
