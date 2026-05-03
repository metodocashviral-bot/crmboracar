'use client'

import { useState, useCallback, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
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
      <div className="flex h-full items-center justify-center text-gray-400">
        Atendimento não encontrado
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Ticket list sidebar */}
      <div className="hidden lg:flex flex-col w-72 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex-shrink-0">
        <div className="px-3 py-3 border-b border-gray-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Atendimentos
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {tickets.map((t) => (
            <KanbanCard key={t.id} ticket={t} isActive={t.id === ticketId} />
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader ticket={ticket} onUpdate={fetchTicket} />
        <ChatWindow ticket={ticket} onUpdate={fetchTicket} />
      </div>
    </div>
  )
}
