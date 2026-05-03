import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'in_progress' | 'finished' | 'follow_up' | 'high' | 'agent'
  className?: string
}

const styles: Record<string, React.CSSProperties> = {
  default:      { background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  agent:        { background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  success:      { background: 'var(--status-finished-bg)', color: 'var(--status-finished)' },
  finished:     { background: 'var(--status-finished-bg)', color: 'var(--status-finished)' },
  warning:      { background: 'var(--status-follow-up-bg)', color: 'var(--status-follow-up)' },
  follow_up:    { background: 'var(--status-follow-up-bg)', color: 'var(--status-follow-up)' },
  danger:       { background: 'var(--priority-high-bg)', color: 'var(--priority-high)' },
  high:         { background: 'var(--priority-high-bg)', color: 'var(--priority-high)' },
  info:         { background: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress)' },
  in_progress:  { background: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress)' },
  purple:       { background: '#f3f0ff', color: '#7c3aed' },
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 font-semibold', className)}
      style={{
        padding: '2px 8px',
        fontSize: '11px',
        borderRadius: 'var(--radius-full)',
        ...styles[variant],
      }}
    >
      {children}
    </span>
  )
}
