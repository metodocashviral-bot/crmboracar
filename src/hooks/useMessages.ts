'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types'

export function useMessages(ticketId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*, agent:profiles(*)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data as Message[])
    setLoading(false)
  }, [ticketId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  function addMessage(msg: Message) {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }

  return { messages, loading, refetch: fetchMessages, addMessage }
}
