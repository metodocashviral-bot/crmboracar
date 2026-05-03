'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Settings, LogOut, MessageSquare, ChevronRight } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { useAppStore } from '@/stores/appStore'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/', label: 'Atendimentos', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contatos', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, settings, whatsappStatus } = useAppStore()

  const inChat = pathname.startsWith('/chat/')
  const [collapsed, setCollapsed] = useState(() => inChat)

  // Sync with route changes
  useEffect(() => {
    setCollapsed(inChat)
  }, [inChat])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const wsConnected = whatsappStatus === 'connected'

  function isActive(href: string) {
    if (href === '/') return pathname === '/' || pathname.startsWith('/chat')
    return pathname.startsWith(href)
  }

  const w = collapsed ? 56 : 220

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{
        width: w,
        height: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo / toggle */}
      <div
        className="flex items-center"
        style={{
          height: 64,
          borderBottom: '1px solid var(--border)',
          padding: collapsed ? '0 12px' : '0 16px',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {settings?.logo_url ? (
          <img src={settings.logo_url} alt="Logo" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--brand-primary)', flexShrink: 0 }}>
            <MessageSquare size={17} color="white" />
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold" style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {settings?.app_name || 'CRM BoraCar'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: wsConnected ? 'var(--brand-primary)' : '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {wsConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        )}
        {inChat && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            style={{
              width: 24, height: 24, borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav
        className="flex-1 flex flex-col"
        style={{ padding: collapsed ? '8px 8px' : '8px 12px', gap: 2, marginTop: 4 }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center transition-all"
              style={{
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 10,
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--brand-primary-light)' : 'transparent',
                borderLeft: collapsed ? 'none' : active ? '2px solid var(--brand-primary)' : '2px solid transparent',
                transition: 'var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
            >
              <Icon size={17} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
        {profile?.role === 'admin' && (() => {
          const active = pathname.startsWith('/settings')
          return (
            <Link
              href="/settings"
              title={collapsed ? 'Configurações' : undefined}
              className="flex items-center transition-all"
              style={{
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 10,
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--brand-primary-light)' : 'transparent',
                borderLeft: collapsed ? 'none' : active ? '2px solid var(--brand-primary)' : '2px solid transparent',
                transition: 'var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
            >
              <Settings size={17} />
              {!collapsed && <span>Configurações</span>}
            </Link>
          )
        })()}
      </nav>

      {/* User footer */}
      <div
        className="flex items-center"
        style={{
          borderTop: '1px solid var(--border)',
          padding: collapsed ? '12px 0' : '12px 16px',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <button
          onClick={handleLogout}
          title="Sair"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
        >
          <Avatar name={profile?.full_name} size="sm" />
        </button>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{profile?.full_name}</p>
              <p className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {profile?.role === 'admin' ? 'Administrador' : 'Atendente'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center transition-colors"
              style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = '' }}
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
