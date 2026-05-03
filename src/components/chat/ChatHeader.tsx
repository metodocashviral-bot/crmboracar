'use client'

import { useState } from 'react'
import { ArrowLeft, MoreVertical, UserCheck, CheckCircle, RefreshCw } from 'lucide-react'
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

const statusLabel: Record<string, string> = {
  in_progress: 'Em Atendimento',
  finished: 'Finalizado',
  follow_up: 'Aguardando Contato',
}

const statusVariant: Record<string, 'info' | 'success' | 'warning'> = {
  in_progress: 'info',
  finished: 'success',
  follow_up: 'warning',
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
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 lg:hidden"
        >
          <ArrowLeft size={18} />
        </button>

        <Avatar
          name={ticket.contact?.name}
          phone={ticket.contact?.phone}
          src={ticket.contact?.profile_pic_url}
          size="sm"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {ticket.contact?.name || formatPhone(ticket.contact?.phone || '')}
            </p>
            <Badge variant={statusVariant[ticket.status]}>{statusLabel[ticket.status]}</Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {ticket.contact?.phone && formatPhone(ticket.contact.phone)}
            {ticket.assigned_agent && ` · ${ticket.assigned_agent.full_name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {ticket.status !== 'finished' && (
            <Button size="sm" variant="secondary" onClick={() => setTransferOpen(true)}>
              <UserCheck size={14} className="mr-1" />
              Transferir
            </Button>
          )}
          {ticket.status !== 'finished' ? (
            <Button size="sm" onClick={() => changeStatus('finished')} disabled={loading}>
              <CheckCircle size={14} className="mr-1" />
              Finalizar
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => changeStatus('in_progress')} disabled={loading}>
              <RefreshCw size={14} className="mr-1" />
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
