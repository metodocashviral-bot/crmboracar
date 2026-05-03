'use client'

import ThemeToggle from './ThemeToggle'
import Avatar from '@/components/ui/Avatar'
import { useAppStore } from '@/stores/appStore'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { profile } = useAppStore()

  return (
    <header
      className="flex items-center flex-shrink-0"
      style={{
        height: 56,
        padding: '0 24px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex-1 min-w-0">
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
        <ThemeToggle />
        <Avatar name={profile?.full_name} size="sm" ring />
      </div>
    </header>
  )
}
