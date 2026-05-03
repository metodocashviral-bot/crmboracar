'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/appStore'
import type { Profile } from '@/types'
import toast from 'react-hot-toast'

interface TransferModalProps {
  open: boolean
  onClose: () => void
  ticketId: string
  currentAgentId?: string
  onTransferred: () => void
}

export default function TransferModal({ open, onClose, ticketId, currentAgentId, onTransferred }: TransferModalProps) {
  const { profile } = useAppStore()
  const [agents, setAgents] = useState<Profile[]>([])
  const [selected, setSelected] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .neq('id', currentAgentId || '')
      .then(({ data }: { data: Profile[] | null }) => { if (data) setAgents(data) })
  }, [open, currentAgentId])

  async function handleTransfer() {
    if (!selected) return
    setLoading(true)
    const supabase = createClient()

    await supabase.from('tickets').update({ assigned_agent_id: selected }).eq('id', ticketId)

    await supabase.from('ticket_transfers').insert({
      ticket_id: ticketId,
      from_agent_id: currentAgentId || null,
      to_agent_id: selected,
      reason: reason || null,
    })

    const targetAgent = agents.find((a) => a.id === selected)
    const transferMsg = `${profile?.full_name || 'Atendente'} transferiu o atendimento para ${targetAgent?.full_name || 'outro atendente'}`

    const { data: ticketData } = await supabase.from('tickets').select('contact_id').eq('id', ticketId).single()

    await supabase.from('messages').insert({
      ticket_id: ticketId,
      contact_id: ticketData?.contact_id,
      sender_type: 'system',
      content: transferMsg,
    })

    // Send WhatsApp message to contact (names in bold)
    const transferMsgWpp = `*${profile?.full_name || 'Atendente'}* transferiu o atendimento para *${targetAgent?.full_name || 'outro atendente'}*`
    fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, content: transferMsgWpp, agentId: profile?.id, noPrefix: true }),
    }).catch(() => {})

    toast.success('Atendimento transferido')
    setLoading(false)
    onTransferred()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Transferir Atendimento">
      <div className="space-y-4">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelected(agent.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                selected === agent.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <Avatar name={agent.full_name} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.full_name}</p>
                <p className="text-xs text-gray-500">{agent.email}</p>
              </div>
            </button>
          ))}
          {agents.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum atendente disponível</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Motivo (opcional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Ex: Especialidade técnica"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={handleTransfer} disabled={!selected || loading}>
            {loading ? 'Transferindo...' : 'Transferir'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
