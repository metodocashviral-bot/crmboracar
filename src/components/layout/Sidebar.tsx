'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Settings, LogOut, MessageSquare } from 'lucide-react'
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

  return (
    <aside className="flex flex-col flex-shrink-0" style={{ width: 220, height: '100vh', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5" style={{ height: 64, borderBottom: '1px solid var(--border)' }}>
        {settings?.logo_url ? (
          <img src={settings.logo_url} alt="Logo" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
        ) : (
          <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--brand-primary)' }}>
            <MessageSquare size={17} color="white" />
          </div>
        )}
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
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5" style={{ marginTop: 4 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 transition-all"
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--brand-primary-light)' : 'transparent',
                borderLeft: active ? '2px solid var(--brand-primary)' : '2px solid transparent',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
        {profile?.role === 'admin' && (() => {
          const active = pathname.startsWith('/settings')
          return (
            <Link
              href="/settings"
              className="flex items-center gap-2.5 transition-all"
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--brand-primary-light)' : 'transparent',
                borderLeft: active ? '2px solid var(--brand-primary)' : '2px solid transparent',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
            >
              <Settings size={17} />
              Configurações
            </Link>
          )
        })()}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <Avatar name={profile?.full_name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="truncate font-semibold" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{profile?.full_name}</p>
          <p className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {profile?.role === 'admin' ? 'Administrador' : 'Atendente'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center transition-colors"
          style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', flexShrink: 0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = '' }}
          title="Sair"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}
