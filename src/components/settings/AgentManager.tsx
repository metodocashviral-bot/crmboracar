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
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Atendentes
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus size={13} className="mr-1.5" />
          Novo Atendente
        </Button>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Carregando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {agents.map((agent) => (
            <div
              key={agent.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--bg-base)',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-base)' }}
            >
              <Avatar name={agent.full_name} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === agent.id ? (
                  <div className="flex items-center" style={{ gap: 4 }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveName(agent) }}
                      style={{
                        fontSize: 13,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--brand-primary)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        width: '100%',
                      }}
                      autoFocus
                    />
                    <button onClick={() => saveName(agent)} style={{ padding: 4, color: 'var(--brand-primary)', cursor: 'pointer' }}>
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ padding: 4, color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
                      {agent.full_name}
                    </p>
                    <Badge variant={agent.role === 'admin' ? 'purple' : 'default'}>
                      {agent.role === 'admin' ? 'Admin' : 'Atendente'}
                    </Badge>
                    {!agent.is_active && <Badge variant="danger">Inativo</Badge>}
                  </div>
                )}
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{agent.email}</p>
              </div>

              <div className="flex items-center" style={{ gap: 2 }}>
                <button
                  onClick={() => { setEditingId(agent.id); setEditName(agent.full_name) }}
                  style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                  title="Editar nome"
                >
                  <Pencil size={14} />
                </button>
                {agent.role !== 'admin' && (
                  <button
                    onClick={() => toggleActive(agent)}
                    style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
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
