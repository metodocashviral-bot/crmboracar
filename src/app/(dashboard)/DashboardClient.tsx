'use client'

import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { useAppStore } from '@/stores/appStore'
import type { Profile, CompanySettings } from '@/types'

interface Props {
  profile: Profile | null
  settings: CompanySettings | null
  children: React.ReactNode
}

export default function DashboardClient({ profile, settings, children }: Props) {
  const { setProfile, setSettings, setWhatsappStatus, sidebarOpen } = useAppStore()

  useEffect(() => {
    if (profile) setProfile(profile)
    if (settings) {
      setSettings(settings)
      setWhatsappStatus(settings.whatsapp_connected ? 'connected' : 'disconnected')
    }
  }, [profile, settings])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {sidebarOpen && <Sidebar />}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
