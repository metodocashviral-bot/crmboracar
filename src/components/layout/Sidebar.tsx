'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Settings, LogOut, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import { useAppStore } from '@/stores/appStore'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

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

  const wsColor = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-400',
    qr_code: 'bg-yellow-400',
    disconnected: 'bg-red-500',
  }[whatsappStatus]

  return (
    <aside className="w-64 h-full bg-slate-900 dark:bg-slate-950 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {settings?.app_name || 'CRM BoraCar'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={cn('w-2 h-2 rounded-full', wsColor)} />
              <span className="text-xs text-slate-400">
                {whatsappStatus === 'connected' ? 'WhatsApp conectado' : 'WhatsApp desconectado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href || (href !== '/' && pathname.startsWith(href))
                ? 'bg-green-500 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        {profile?.role === 'admin' && (
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/settings')
                ? 'bg-green-500 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Settings size={18} />
            Configurações
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar name={profile?.full_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
            <p className="text-xs text-slate-400 truncate">
              {profile?.role === 'admin' ? 'Administrador' : 'Atendente'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
