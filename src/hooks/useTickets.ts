'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Ticket } from '@/types'

export function useTickets(agentFilter?: string, search?: string) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from('tickets')
      .select(`
        *,
        contact:contacts(*),
        assigned_agent:profiles(*)
      `)
      .order('last_message_at', { ascending: false })

    if (agentFilter) {
      query = query.eq('assigned_agent_id', agentFilter)
    }

    const { data, error } = await query
    if (!error && data) {
      let filtered = data as Ticket[]
      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(
          (t) =>
            t.contact?.name?.toLowerCase().includes(q) ||
            t.contact?.phone?.includes(q)
        )
      }
      setTickets(filtered)
    }
    setLoading(false)
  }, [agentFilter, search])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return { tickets, loading, refetch: fetchTickets }
}
