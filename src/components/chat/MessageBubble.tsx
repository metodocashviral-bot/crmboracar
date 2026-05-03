import { formatTime } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  if (message.sender_type === 'system') {
    return (
      <div className="flex justify-center" style={{ padding: '4px 0' }}>
        <span style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-muted)' }}>
          {message.content}
        </span>
      </div>
    )
  }

  const isAgent = message.sender_type === 'agent'

  return (
    <div className="flex" style={{ justifyContent: isAgent ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '70%' }}>
        {isAgent && message.agent && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 2, textAlign: 'right' }}>
            {message.agent.full_name}
          </p>
        )}
        <div
          style={{
            padding: '8px 12px',
            fontSize: 14,
            lineHeight: '22px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            ...(isAgent ? {
              background: 'var(--brand-primary)',
              color: 'white',
              borderRadius: '12px 0 12px 12px',
              boxShadow: 'var(--shadow-xs)',
            } : {
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0 12px 12px 12px',
              boxShadow: 'var(--shadow-xs)',
            }),
          }}
        >
          {message.content}
        </div>
        <p style={{
          fontSize: 11,
          marginTop: 3,
          textAlign: isAgent ? 'right' : 'left',
          color: isAgent ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)',
        }}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
