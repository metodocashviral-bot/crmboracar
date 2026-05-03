import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`
  }
  return phone
}

export function phoneFromJid(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function formatMessageDate(date: string): string {
  const d = new Date(date)
  if (isToday(d)) return 'Hoje'
  if (isYesterday(d)) return 'Ontem'
  return format(d, 'dd/MM/yyyy')
}

export function formatTime(date: string): string {
  return format(new Date(date), 'HH:mm')
}

export function getInitials(name?: string, phone?: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  if (phone) return phone.slice(-2)
  return '?'
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}
