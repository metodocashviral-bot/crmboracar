'use client'

import { create } from 'zustand'
import type { Profile, CompanySettings, WhatsAppStatus } from '@/types'

interface AppStore {
  profile: Profile | null
  setProfile: (profile: Profile | null) => void

  settings: CompanySettings | null
  setSettings: (settings: CompanySettings) => void

  whatsappStatus: WhatsAppStatus
  setWhatsappStatus: (status: WhatsAppStatus) => void

  sidebarOpen: boolean
  toggleSidebar: () => void

  activeTicketId: string | null
  setActiveTicketId: (id: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),

  settings: null,
  setSettings: (settings) => set({ settings }),

  whatsappStatus: 'disconnected',
  setWhatsappStatus: (whatsappStatus) => set({ whatsappStatus }),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  activeTicketId: null,
  setActiveTicketId: (activeTicketId) => set({ activeTicketId }),
}))
