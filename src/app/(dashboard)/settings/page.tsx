import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import WhatsAppConnect from '@/components/settings/WhatsAppConnect'
import AgentManager from '@/components/settings/AgentManager'
import CompanySettings from '@/components/settings/CompanySettings'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Configurações" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <CompanySettings />
          <WhatsAppConnect />
          <AgentManager />
        </div>
      </div>
    </div>
  )
}
