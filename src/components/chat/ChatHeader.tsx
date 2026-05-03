'use client'

import { useState } from 'react'
import { ArrowLeft, UserCheck, CheckCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import TransferModal from '@/components/modals/TransferModal'
import { createClient } from '@/lib/supabase/client'
import { formatPhone } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import type { Ticket } from '@/types'
import toast from 'react-hot-toast'

interface ChatHeaderProps {
  ticket: Ticket
  onUpdate: () => void
}

const statusVariant: Record<string, 'in_progress' | 'finished' | 'follow_up'> = {
  in_progress: 'in_progress',
  finished: 'finished',
  follow_up: 'follow_up',
}

const statusLabel: Record<string, string> = {
  in_progress: 'Em Atendimento',
  finished: 'Finalizado',
  follow_up: 'Aguardando Contato',
}

export default function ChatHeader({ ticket, onUpdate }: ChatHeaderProps) {
  const router = useRouter()
  const { profile } = useAppStore()
  const [transferOpen, setTransferOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function changeStatus(status: 'finished' | 'in_progress') {
    setLoading(true)
    const supabase = createClient()
    const updates: Record<string, unknown> = { status }
    if (status === 'finished') updates.finished_at = new Date().toISOString()
    await supabase.from('tickets').update(updates).eq('id', ticket.id)
    await supabase.from('messages').insert({
      ticket_id: ticket.id,
      contact_id: ticket.contact_id,
      sender_type: 'system',
      content: status === 'finished'
        ? `${profile?.full_name || 'Atendente'} finalizou o atendimento`
        : `${profile?.full_name || 'Atendente'} reabriu o atendimento`,
    })
    toast.success(status === 'finished' ? 'Atendimento finalizado' : 'Atendimento reaberto')
    setLoading(false)
    onUpdate()
  }

  return (
    <>
      <div
        className="flex items-center flex-shrink-0"
        style={{ height: 56, padding: '0 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', gap: 12 }}
      >
        <button
          onClick={() => router.push('/')}
          className="lg:hidden flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={17} />
        </button>

        <Avatar name={ticket.contact?.name} phone={ticket.contact?.phone} src={ticket.contact?.profile_pic_url} size="md" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold" style={{ fontSize: 14, color: 'var(--text-primary)' }}>
              {ticket.contact?.name || formatPhone(ticket.contact?.phone || '')}
            </p>
            <Badge variant={statusVariant[ticket.status]}>{statusLabel[ticket.status]}</Badge>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {ticket.contact?.phone && formatPhone(ticket.contact.phone)}
          </p>
        </div>

        {ticket.assigned_agent && (
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <Avatar name={ticket.assigned_agent.full_name} size="xs" />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{ticket.assigned_agent.full_name.split(' ')[0]}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Responsável</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {ticket.status !== 'finished' && (
            <Button size="sm" variant="secondary" onClick={() => setTransferOpen(true)}>
              <UserCheck size={13} className="mr-1" />
              Transferir
            </Button>
          )}
          {ticket.status !== 'finished' ? (
            <Button size="sm" onClick={() => changeStatus('finished')} disabled={loading}>
              <CheckCircle size={13} className="mr-1" />
              Finalizar
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => changeStatus('in_progress')} disabled={loading}>
              <RefreshCw size={13} className="mr-1" />
              Reabrir
            </Button>
          )}
        </div>
      </div>

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        ticketId={ticket.id}
        currentAgentId={ticket.assigned_agent_id}
        onTransferred={onUpdate}
      />
    </>
  )
}
