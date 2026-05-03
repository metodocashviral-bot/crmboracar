export type UserRole = 'admin' | 'agent'
export type TicketStatus = 'in_progress' | 'finished' | 'follow_up'
export type SenderType = 'agent' | 'contact' | 'system'
export type Priority = 'low' | 'normal' | 'high'
export type WhatsAppStatus = 'disconnected' | 'connecting' | 'qr_code' | 'connected'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  created_at: string
}

export interface Contact {
  id: string
  phone: string
  name?: string
  email?: string
  notes?: string
  tags?: string[]
  profile_pic_url?: string
  created_at: string
}

export interface Ticket {
  id: string
  contact_id: string
  assigned_agent_id?: string
  status: TicketStatus
  follow_up_date?: string
  subject?: string
  priority: Priority
  unread_count: number
  last_message_at: string
  created_at: string
  finished_at?: string
  contact?: Contact
  assigned_agent?: Profile
  last_message?: string
}

export interface Message {
  id: string
  ticket_id: string
  contact_id: string
  sender_type: SenderType
  agent_id?: string
  content: string
  media_url?: string
  media_type?: string
  whatsapp_message_id?: string
  is_read: boolean
  created_at: string
  agent?: Profile
}

export interface CompanySettings {
  id: string
  app_name: string
  logo_url?: string
  primary_color: string
  dark_mode_default: boolean
  evolution_api_url?: string
  evolution_api_key?: string
  evolution_instance?: string
  whatsapp_connected: boolean
  whatsapp_number?: string
}

export interface TicketTransfer {
  id: string
  ticket_id: string
  from_agent_id?: string
  to_agent_id: string
  reason?: string
  created_at: string
  from_agent?: Profile
  to_agent?: Profile
}
