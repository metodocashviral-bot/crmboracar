'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, ExternalLink, CheckCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import { timeAgo } from '@/lib/utils'

interface NotificationBellProps {
  collapsed?: boolean
}

export default function NotificationBell({ collapsed }: NotificationBellProps) {
  const router = useRouter()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleOpen(notifId: string, ticketId?: string) {
    markRead(notifId)
    setOpen(false)
    if (ticketId) router.push(`/chat/${ticketId}`)
  }

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Notificações"
        style={{
          width: collapsed ? 40 : '100%',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 10,
          padding: collapsed ? 0 : '0 12px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: open ? 'var(--brand-primary-light)' : 'transparent',
          color: open ? 'var(--brand-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'var(--transition-fast)',
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)' }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
        <span style={{ position: 'relative', flexShrink: 0 }}>
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -6,
              minWidth: 16, height: 16,
              background: '#ef4444', color: 'white',
              borderRadius: 'var(--radius-full)',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
              border: '1.5px solid var(--bg-surface)',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        {!collapsed && <span>Notificações</span>}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          bottom: 64,
          left: collapsed ? 64 : 228,
          width: 340,
          maxHeight: 480,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Notificações {unreadCount > 0 && <span style={{ color: '#ef4444' }}>({unreadCount})</span>}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Marcar todas como lidas"
                  style={{ padding: 6, borderRadius: 6, border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <Bell size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'transparent' : 'var(--brand-primary-light)',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Unread dot */}
                  <div style={{ paddingTop: 4, flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'transparent' : 'var(--brand-primary)' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</p>
                    {n.body && <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: '18px' }}>{n.body}</p>}
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.created_at)}</p>

                    {n.ticket_id && (
                      <button
                        onClick={() => handleOpen(n.id, n.ticket_id)}
                        style={{
                          marginTop: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--brand-primary)',
                          background: 'white',
                          border: '1px solid var(--brand-primary)',
                          borderRadius: 'var(--radius-md)',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand-primary)' }}
                      >
                        <ExternalLink size={11} />
                        Abrir agora
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
