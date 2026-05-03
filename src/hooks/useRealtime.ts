'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeTickets(onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('realtime-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, onUpdate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, onUpdate)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [onUpdate])
}

export function useRealtimeMessages(ticketId: string, onNewMessage: (payload: any) => void) {
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages-${ticketId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `ticket_id=eq.${ticketId}` },
        onNewMessage
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ticketId, onNewMessage])
}
