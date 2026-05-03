'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface CreateAgentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateAgentModal({ open, onClose, onCreated }: CreateAgentModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!fullName || !email || !password) return
    setLoading(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar atendente')
      toast.success('Atendente criado com sucesso')
      setFullName('')
      setEmail('')
      setPassword('')
      onCreated()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Atendente" size="sm">
      <div className="space-y-3">
        <Input
          label="Nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="João da Silva"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="joao@empresa.com"
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button
            className="flex-1"
            onClick={handleCreate}
            disabled={!fullName || !email || !password || loading}
          >
            {loading ? 'Criando...' : 'Criar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
