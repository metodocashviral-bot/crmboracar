'use client'

import { useState, useCallback } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import Header from '@/components/layout/Header'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { useTickets } from '@/hooks/useTickets'
import { useAppStore } from '@/stores/appStore'
import Spinner from '@/components/ui/Spinner'

export default function DashboardPage() {
  const { profile } = useAppStore()
  const { activeTicketId } = useAppStore()
  const [agentFilter, setAgentFilter] = useState('')
  const [search, setSearch] = useState('')
  const { tickets, loading, refetch } = useTickets(agentFilter || undefined, search || undefined)

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Atendimentos"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
              />
            </div>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : (
          <KanbanBoard
            tickets={tickets}
            onRefresh={handleRefresh}
            activeTicketId={activeTicketId}
          />
        )}
      </div>
    </div>
  )
}
