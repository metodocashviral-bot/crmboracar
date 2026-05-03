'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/appStore'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body?: string
  ticket_id?: string
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const { profile } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const profileRef = useRef(profile)
  profileRef.current = profile

  const fetch = useCallback(async () => {
    if (!profileRef.current) return
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profileRef.current.id)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data as Notification[])
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    if (!profile) return
    const supabase = createClient()
    const channel = supabase
      .channel(`notifications-${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        (payload: { new: Notification }) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        (payload: { new: Notification }) => {
          setNotifications((prev) => prev.map((n) => n.id === payload.new.id ? payload.new as Notification : n))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllRead() {
    if (!profile) return
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetch }
}
