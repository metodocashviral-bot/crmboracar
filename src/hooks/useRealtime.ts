'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeTickets(onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('realtime-tickets-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => onUpdateRef.current())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => onUpdateRef.current())
      .subscribe((status: string) => {
        if (status === 'CHANNEL_ERROR') {
          setTimeout(() => supabase.removeChannel(channel), 1000)
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, []) // stable — never re-subscribes
}

export function useRealtimeMessages(ticketId: string, onNewMessage: (payload: any) => void) {
  const onNewMessageRef = useRef(onNewMessage)
  onNewMessageRef.current = onNewMessage

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages-${ticketId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `ticket_id=eq.${ticketId}` },
        (payload: Record<string, unknown>) => onNewMessageRef.current(payload)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ticketId]) // re-subscribe only when ticketId changes
}
