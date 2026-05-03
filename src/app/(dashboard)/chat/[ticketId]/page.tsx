'use client'

import { useState, useCallback, use, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/appStore'
import ChatHeader from '@/components/chat/ChatHeader'
import ChatWindow from '@/components/chat/ChatWindow'
import KanbanCard from '@/components/kanban/KanbanCard'
import { useTickets } from '@/hooks/useTickets'
import { useRealtimeTickets } from '@/hooks/useRealtime'
import Spinner from '@/components/ui/Spinner'
import type { Ticket } from '@/types'

export default function ChatPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = use(params)
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview') === 'true'
  const { setActiveTicketId } = useAppStore()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loadingTicket, setLoadingTicket] = useState(true)
  const { tickets, refetch } = useTickets()

  useEffect(() => {
    setActiveTicketId(ticketId)
    return () => setActiveTicketId(null)
  }, [ticketId])

  const fetchTicket = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tickets')
      .select('*, contact:contacts(*), assigned_agent:profiles(*)')
      .eq('id', ticketId)
      .single()
    if (data) setTicket(data as Ticket)
    setLoadingTicket(false)
  }, [ticketId])

  useEffect(() => { fetchTicket() }, [fetchTicket])

  useRealtimeTickets(useCallback(() => {
    fetchTicket()
    refetch()
  }, [fetchTicket, refetch]))

  if (loadingTicket) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
        Atendimento não encontrado
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Compact ticket list sidebar */}
      <div
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: 280, borderRight: '1px solid var(--border)', background: 'var(--bg-surface)', overflow: 'hidden' }}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Atendimentos
          </p>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding: '8px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tickets.map((t) => (
              <KanbanCard key={t.id} ticket={t} isActive={t.id === ticketId} />
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader ticket={ticket} onUpdate={fetchTicket} />
        <ChatWindow ticket={ticket} onUpdate={fetchTicket} preview={preview} />
      </div>
    </div>
  )
}
