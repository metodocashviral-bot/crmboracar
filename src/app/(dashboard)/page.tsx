'use client'

import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import Header from '@/components/layout/Header'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { useTickets } from '@/hooks/useTickets'
import { useAppStore } from '@/stores/appStore'
import Spinner from '@/components/ui/Spinner'

export default function DashboardPage() {
  const { activeTicketId } = useAppStore()
  const [search, setSearch] = useState('')
  const { tickets, loading, refetch } = useTickets(undefined, search || undefined)
  const handleRefresh = useCallback(() => { refetch() }, [refetch])

  const total = tickets.length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Atendimentos" subtitle={`Kanban · ${total} atendimento${total !== 1 ? 's' : ''}`} />

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 flex-shrink-0"
        style={{ height: 64, padding: '0 24px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="relative">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar contato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: 36, width: 280, paddingLeft: 36, paddingRight: 12,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-glow)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden" style={{ padding: 20 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : (
          <KanbanBoard tickets={tickets} onRefresh={handleRefresh} activeTicketId={activeTicketId} />
        )}
      </div>
    </div>
  )
}
