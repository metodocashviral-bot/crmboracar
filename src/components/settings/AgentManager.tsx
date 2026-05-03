'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, UserCheck, UserX, Pencil, Check, X } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import CreateAgentModal from '@/components/modals/CreateAgentModal'
import type { Profile } from '@/types'
import toast from 'react-hot-toast'

export default function AgentManager() {
  const [agents, setAgents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const fetchAgents = useCallback(async () => {
    const res = await fetch('/api/agents')
    const { agents } = await res.json()
    setAgents(agents || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAgents() }, [fetchAgents])

  async function toggleActive(agent: Profile) {
    const res = await fetch(`/api/agents/${agent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !agent.is_active }),
    })
    if (res.ok) {
      toast.success(agent.is_active ? 'Atendente desativado' : 'Atendente ativado')
      fetchAgents()
    }
  }

  async function saveName(agent: Profile) {
    if (!editName.trim()) return
    await fetch(`/api/agents/${agent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: editName.trim() }),
    })
    toast.success('Nome atualizado')
    setEditingId(null)
    fetchAgents()
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900 dark:text-white">Atendentes</h3>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus size={14} className="mr-1.5" />
          Novo Atendente
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Avatar name={agent.full_name} size="sm" />
              <div className="flex-1 min-w-0">
                {editingId === agent.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveName(agent) }}
                      className="text-sm px-2 py-0.5 rounded border border-green-400 focus:outline-none dark:bg-slate-700 dark:text-white w-full"
                      autoFocus
                    />
                    <button onClick={() => saveName(agent)} className="p-1 text-green-500 hover:text-green-600">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {agent.full_name}
                    </p>
                    <Badge variant={agent.role === 'admin' ? 'purple' : 'default'}>
                      {agent.role === 'admin' ? 'Admin' : 'Atendente'}
                    </Badge>
                    {!agent.is_active && <Badge variant="danger">Inativo</Badge>}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.email}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingId(agent.id); setEditName(agent.full_name) }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title="Editar nome"
                >
                  <Pencil size={14} />
                </button>
                {agent.role !== 'admin' && (
                  <button
                    onClick={() => toggleActive(agent)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    title={agent.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {agent.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateAgentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchAgents}
      />
    </div>
  )
}
