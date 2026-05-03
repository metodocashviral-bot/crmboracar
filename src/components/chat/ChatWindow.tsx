'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { useRealtimeMessages } from '@/hooks/useRealtime'
import { useAppStore } from '@/stores/appStore'
import { createClient } from '@/lib/supabase/client'
import { formatMessageDate } from '@/lib/utils'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import Spinner from '@/components/ui/Spinner'
import type { Ticket, Message } from '@/types'
import toast from 'react-hot-toast'

interface ChatWindowProps {
  ticket: Ticket
  onUpdate: () => void
}

export default function ChatWindow({ ticket, onUpdate }: ChatWindowProps) {
  const { profile, whatsappStatus } = useAppStore()
  const { messages, loading, addMessage } = useMessages(ticket.id)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const supabase = createClient()
    async function init() {
      await supabase.from('messages').update({ is_read: true }).eq('ticket_id', ticket.id).eq('is_read', false)
      await supabase.from('tickets').update({ unread_count: 0 }).eq('id', ticket.id)
      const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('ticket_id', ticket.id).eq('sender_type', 'system').ilike('content', '%iniciou o atendimento%')
      if ((count ?? 0) === 0 && profile) {
        await supabase.from('messages').insert({ ticket_id: ticket.id, contact_id: ticket.contact_id, sender_type: 'system', content: `${profile.full_name} iniciou o atendimento` })
      }
      onUpdate()
    }
    init()
  }, [ticket.id])

  const handleNewMessage = useCallback(async (payload: any) => {
    const supabase = createClient()
    const { data } = await supabase.from('messages').select('*, agent:profiles(*)').eq('id', payload.new.id).single()
    if (data) addMessage(data as Message)
  }, [addMessage])

  useRealtimeMessages(ticket.id, handleNewMessage)

  async function handleSend(content: string) {
    if (!profile) return
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, content, agentId: profile.id }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro ao enviar') }
      const { message } = await res.json()
      if (message) addMessage(message)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar mensagem')
    }
  }

  const grouped: { date: string; messages: Message[] }[] = []
  messages.forEach((msg) => {
    const date = formatMessageDate(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.date === date) last.messages.push(msg)
    else grouped.push({ date, messages: [msg] })
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px', background: 'var(--bg-base)' }}>
        {loading ? (
          <div className="flex justify-center pt-8"><Spinner /></div>
        ) : (
          <>
            {grouped.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center" style={{ padding: '12px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, var(--border))' }} />
                  <span style={{ padding: '0 12px', fontSize: 11, color: 'var(--text-muted)' }}>{group.date}</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, var(--border))' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {group.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
      <MessageInput onSend={handleSend} disabled={whatsappStatus !== 'connected'} />
    </div>
  )
}
