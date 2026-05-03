'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Phone, Mail, FileText } from 'lucide-react'
import Header from '@/components/layout/Header'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import { formatPhone } from '@/lib/utils'
import type { Contact } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const fetchContacts = useCallback(async () => {
    const supabase = createClient()
    let query = supabase.from('contacts').select('*').order('created_at', { ascending: false })
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    const { data } = await query
    if (data) setContacts(data)
    setLoading(false)
  }, [search])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  useEffect(() => {
    if (selected) setNotes(selected.notes || '')
  }, [selected])

  async function saveNotes() {
    if (!selected) return
    setSavingNotes(true)
    const supabase = createClient()
    await supabase.from('contacts').update({ notes }).eq('id', selected.id)
    setSelected({ ...selected, notes })
    setSavingNotes(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Contatos"
        actions={
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
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-slate-700 overflow-y-auto bg-white dark:bg-slate-900">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum contato encontrado</p>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelected(contact)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                  selected?.id === contact.id ? 'bg-green-50 dark:bg-green-900/10' : ''
                }`}
              >
                <Avatar name={contact.name} phone={contact.phone} src={contact.profile_pic_url} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {contact.name || formatPhone(contact.phone)}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{formatPhone(contact.phone)}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selected ? (
            <div className="max-w-lg space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={selected.name} phone={selected.phone} src={selected.profile_pic_url} size="lg" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selected.name || 'Sem nome'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Desde {format(new Date(selected.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatPhone(selected.phone)}</span>
                </div>
                {selected.email && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selected.email}</span>
                  </div>
                )}
              </div>

              {selected.tags && selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText size={14} className="inline mr-1" />
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Adicione observações sobre este contato..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="mt-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-medium disabled:opacity-50"
                >
                  {savingNotes ? 'Salvando...' : 'Salvar observações'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Selecione um contato para ver os detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
